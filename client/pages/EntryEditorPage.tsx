import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { marked } from 'marked';
import {
  Sparkles,
  ChevronLeft,
  Loader2,
  Clock,
  Tags,
  MessageCircle,
  X,
  BookOpen,
  Calendar,
  Lightbulb,
  FileText,
  Send,
  RotateCcw,
  AlertCircle,
  Maximize2,
  Minimize2,
  AlignLeft,
  Type,
  ClipboardList,
  CheckCheck,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { entryService } from '../services/entryService';
import { geminiService } from '../services/geminiService';
import { categoryService, getCategoryPath } from '../services/categoryService';
import { Category, LearningEntry } from '../types';
import { CategoryTreeSelector } from '../components/categories/CategoryTreeSelector';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'devlog_draft';
const AUTOSAVE_DEBOUNCE_MS = 1500;

// ─── Quill Config ──────────────────────────────────────────────────────────────

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['code', 'code-block', 'blockquote', 'link', 'image'],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function countWords(html: string): number {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

function countChars(html: string): number {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length;
}

/**
 * Heuristic: does this plain text look like it contains markdown?
 * Checks for the most common signals a developer would paste.
 */
function looksLikeMarkdown(text: string): boolean {
  return (
    /^#{1,6}\s.+/m.test(text)       ||  // headings
    /\*\*[^*]+\*\*/.test(text)      ||  // bold
    /\*[^*]+\*/.test(text)          ||  // italic
    /^[-*+]\s.+/m.test(text)        ||  // unordered list
    /^\d+\.\s.+/m.test(text)        ||  // ordered list
    /^>\s.+/m.test(text)            ||  // blockquote
    /```[\s\S]*?```/.test(text)     ||  // fenced code block
    /`[^`]+`/.test(text)            ||  // inline code
    /^---+$/m.test(text)            ||  // horizontal rule
    /\[.+\]\(.+\)/.test(text)          // links
  );
}

/** Convert markdown text to HTML via marked and sanitise for Quill */
async function markdownToHtml(md: string): Promise<string> {
  marked.setOptions({ gfm: true, breaks: true });
  let html = await marked(md) as string;

  // Enhance GitHub-style alerts: > [!IMPORTANT], > [!NOTE], etc. inside blockquotes
  html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:<br>|\s*)/gi, (match, type) => {
    const colors: Record<string, string> = {
      NOTE: '#3b82f6',
      TIP: '#10b981',
      IMPORTANT: '#f59e0b',
      WARNING: '#f97316',
      CAUTION: '#ef4444'
    };
    const color = colors[type.toUpperCase()] || '#6366f1';
    return `<blockquote style="border-left: 4px solid ${color}; padding: 1rem; margin: 1.5rem 0; background: rgba(100, 116, 139, 0.08); border-radius: 0.5rem;"><p><strong style="color: ${color}; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em;">${type.toUpperCase()}:</strong><br>`;
  });

  return html;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const EntryEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  const { toasts, toast, dismissToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mdPasteDetected, setMdPasteDetected] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasDraftRestore, setHasDraftRestore] = useState(false);

  // Image Modal state & refs
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertImageToEditor = useCallback((src: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
    editor.insertEmbed(range.index, 'image', src, 'user');
    editor.setSelection(range.index + 1, 0);
    toast('Image inserted into notes! 📸', 'success', 3000);
  }, [toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Image file exceeds 5MB limit.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        insertImageToEditor(reader.result);
        setShowImageModal(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const handleUrlImageInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) {
      toast('Please enter a valid image URL.', 'error');
      return;
    }
    insertImageToEditor(imageUrlInput.trim());
    setImageUrlInput('');
    setShowImageModal(false);
  };

  const [formData, setFormData] = useState<Partial<LearningEntry>>({
    topic: '',
    category: 'General',
    categoryId: undefined,
    categoryPath: [],
    content: '',
    keyTakeaway: '',
    doubts: '',
    timeSpent: { amount: 45, unit: 'minutes' },
    tags: [],
    date: new Date().toISOString().split('T')[0],
    status: 'published',
  });

  const [tagInput, setTagInput] = useState('');
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Markdown Paste ──────────────────────────────────────────────────────────

  /**
   * Intercept paste events on the editor wrapper.
   * If the clipboard text looks like markdown, convert it via `marked` and
   * insert the resulting HTML at the current cursor position in Quill.
   * Falls back to Quill's native paste for plain text / HTML content.
   */
  const handleEditorPaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');

    // If it doesn't look like markdown, let Quill handle it normally
    if (!text || !looksLikeMarkdown(text)) return;

    // It IS markdown — stop Quill's native paste and do our own
    e.preventDefault();
    e.stopPropagation();

    const convertedHtml = await markdownToHtml(text);
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection(true);
    editor.clipboard.dangerouslyPasteHTML(range?.index ?? 0, convertedHtml);

    toast('Markdown detected & formatted automatically! 🎉', 'success', 3500);
    setMdPasteDetected(false);
  }, [toast]);

  /**
   * Manual "Paste Markdown" button handler — reads from clipboard API
   * (useful as a fallback if the auto-detect is bypassed)
   */
  const handleManualMarkdownPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast('Clipboard is empty.', 'error');
        return;
      }
      const convertedHtml = await markdownToHtml(text);
      const editor = quillRef.current?.getEditor();
      if (!editor) return;
      const range = editor.getSelection(true);
      editor.clipboard.dangerouslyPasteHTML(range?.index ?? 0, convertedHtml);
      toast('Markdown pasted and formatted! 🎉', 'success', 3000);
      setMdPasteDetected(false);
    } catch {
      toast('Could not read clipboard. Please use Ctrl+V inside the editor.', 'error');
    }
  }, [toast]);

  /**
   * On clipboard change (when user focuses editor area), check if clipboard
   * looks like markdown and show a hint badge.
   */
  const handleEditorFocus = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMdPasteDetected(!!text && looksLikeMarkdown(text));
    } catch {
      // clipboard permission not granted — silently ignore
    }
  }, []);

  // Attach native capture-phase paste listener directly to Quill's contenteditable root
  // This ensures we intercept Ctrl+V BEFORE Quill's internal HTML/text clipboard matcher runs!
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const root = editor?.root;
    if (!root) return;

    const nativePasteHandler = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain');
      if (!text || !looksLikeMarkdown(text)) return;

      e.preventDefault();
      e.stopPropagation();

      const convertedHtml = await markdownToHtml(text);
      const range = editor.getSelection(true);
      editor.clipboard.dangerouslyPasteHTML(range?.index ?? 0, convertedHtml);
      toast('Markdown detected & formatted automatically! 🎉', 'success', 3500);
      setMdPasteDetected(false);
    };

    root.addEventListener('paste', nativePasteHandler, { capture: true });
    return () => {
      root.removeEventListener('paste', nativePasteHandler, { capture: true });
    };
  }, [toast]);

  // ─── Data Loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);

        if (id) {
          const entry = await entryService.getEntryById(id);
          if (entry) {
            setFormData(entry);
            return; // editing — skip draft restore
          }
        } else {
          // Check for categoryId in query params
          const searchParams = new URLSearchParams(location.search);
          const queryCatId = searchParams.get('category');
          if (queryCatId) {
            const cat = cats.find(c => c._id === queryCatId);
            const path = getCategoryPath(cats, queryCatId);
            if (cat) {
              setFormData(prev => ({ ...prev, categoryId: queryCatId, category: cat.name, categoryPath: path }));
            }
          }

          // Check for a saved draft
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            setHasDraftRestore(true);
          }
        }
      } catch (err) {
        console.error('Failed to load editor data', err);
        toast('Failed to load data. Please refresh.', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.search]);

  // ─── Autosave to localStorage ──────────────────────────────────────────────

  const scheduleAutosave = useCallback((data: Partial<LearningEntry>) => {
    if (isEditing) return; // only autosave new entries
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch { /* storage full — ignore */ }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [isEditing]);

  const updateForm = useCallback((update: Partial<LearningEntry>) => {
    setFormData(prev => {
      const next = { ...prev, ...update };
      scheduleAutosave(next);
      return next;
    });
  }, [scheduleAutosave]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setFormData(JSON.parse(saved));
        setHasDraftRestore(false);
        toast('Draft restored!', 'success');
      }
    } catch {
      toast('Could not restore draft.', 'error');
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraftRestore(false);
  };

  // ─── AI ───────────────────────────────────────────────────────────────────

  const handleAiGenerate = async () => {
    const plainText = formData.content?.replace(/<[^>]*>?/gm, '').trim() || '';
    if (plainText.length < 30) {
      toast('Content too short for AI analysis (min 30 chars).', 'error');
      return;
    }
    setAiLoading(true);
    try {
      const takeaway = await geminiService.generateKeyTakeaway(plainText);
      updateForm({ keyTakeaway: takeaway });
      toast('Key takeaway generated by Gemini AI!', 'success');
    } catch {
      toast('AI generation failed. Please try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!formData.topic) {
      toast('Please enter a topic first.', 'error');
      return;
    }
    setSuggLoading(true);
    try {
      const suggs = await geminiService.getLearningSuggestions(
        formData.topic,
        formData.category || 'General',
        formData.categoryPath,
      );
      setSuggestions(suggs);
    } catch {
      setSuggestions(['System Design Patterns', 'Concurrency in Depth', 'Advanced Testing']);
    } finally {
      setSuggLoading(false);
    }
  };

  // ─── Tags ──────────────────────────────────────────────────────────────────

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        updateForm({ tags: [...(formData.tags || []), tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateForm({ tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!formData.topic?.trim()) return 'Topic is required.';
    if (!formData.content?.replace(/<[^>]*>?/gm, '').trim()) return 'Content cannot be empty.';
    if (!formData.keyTakeaway?.trim()) return 'A key takeaway is required.';
    return null;
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    const validationError = validateForm();
    if (validationError) {
      toast(validationError, 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, status: targetStatus };
      const saved = await entryService.saveEntry(payload);

      // Clear the autosave draft on successful save
      localStorage.removeItem(DRAFT_KEY);

      if (targetStatus === 'published') {
        // Go to the detail page with a success banner
        navigate(`/entries/${saved._id}?published=true`);
      } else {
        toast('Draft saved successfully.', 'success');
        // Stay on the editor for drafts so the user can keep working
      }
    } catch (err: any) {
      toast(err?.message || 'Failed to save. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto pb-16 relative animate-fade-in">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all text-sm font-semibold shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Logs</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Log' : 'New Learning Entry'}</span>
          </span>
        </div>
      </div>

      {/* Draft Restore Banner */}
      {hasDraftRestore && !isEditing && (
        <div className="mb-4 flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">You have an unsaved draft</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Would you like to restore your previous writing session?</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={restoreDraft}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              Restore
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">

        {/* Topic Title & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              What did you learn today? *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mastered React 19 Action Hooks & Concurrent State..."
              value={formData.topic}
              onChange={(e) => updateForm({ topic: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Date Recorded *</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => updateForm({ date: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
            />
          </div>
        </div>

        {/* N-Depth Category Tree Selector */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800/80">
          <CategoryTreeSelector
            categories={categories}
            selectedCategoryId={formData.categoryId}
            onSelect={(catId, catName, path) => {
              updateForm({ categoryId: catId, category: catName, categoryPath: path });
            }}
            onCategoryCreated={(newCat) => {
              setCategories(prev => [...prev, newCat]);
            }}
          />
        </div>

        {/* Rich Text Studio */}
        <div className="space-y-2">
          {/* Editor Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              Detailed Learning Notes & Code Snippets *
            </label>
            <div className="flex items-center gap-3">
              {/* Live word & char counter */}
              {formData.content && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  <Type className="w-3 h-3" />
                  <span>{countWords(formData.content ?? '').toLocaleString()} words</span>
                  <span className="opacity-50">·</span>
                  <span>{countChars(formData.content ?? '').toLocaleString()} chars</span>
                </div>
              )}

              {/* Markdown Paste Badge — shown when markdown is detected on clipboard */}
              {mdPasteDetected && (
                <button
                  type="button"
                  onClick={handleManualMarkdownPaste}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-[11px] font-bold hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors animate-pulse"
                  title="Click to paste clipboard content as formatted markdown"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Markdown detected — Paste formatted</span>
                </button>
              )}

              {/* Manual Paste Markdown button (always visible) */}
              <button
                type="button"
                onClick={handleManualMarkdownPaste}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                title="Convert clipboard markdown to formatted rich text"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Paste Markdown</span>
              </button>

              {/* Add Image button */}
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                title="Insert Image from computer or URL"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Add Image</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Fullscreen toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(f => !f)}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Editor container — gets fullscreen class when active */}
          <div
            className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner transition-all ${
              isFullscreen
                ? 'quill-fullscreen fixed inset-4 z-[200] shadow-2xl rounded-2xl border'
                : 'bg-white dark:bg-slate-850'
            }`}
            onPaste={handleEditorPaste}
          >
            {/* Fullscreen escape hint */}
            {isFullscreen && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">
                    {formData.topic || 'Untitled Entry'} — Fullscreen Mode
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    {countWords(formData.content ?? '')} words · {countChars(formData.content ?? '')} chars
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>
            )}
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={(val) => updateForm({ content: val })}
              modules={quillModules}
              placeholder="Write out your concepts, code examples, diagrams, or architectural takeaways... (supports pasting Markdown)"
              className={`dark:text-slate-100 ${isFullscreen ? 'quill-fullscreen' : ''}`}
              onFocus={handleEditorFocus}
            />
          </div>

          {/* Keyboard & Markdown tip */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap items-center gap-1.5">
            <ClipboardList className="w-3 h-3" />
            <span className="font-semibold text-violet-600 dark:text-violet-400">Supports Markdown paste</span>
            <span className="opacity-40">·</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700">Ctrl+`</span>
            <span>code block</span>
            <span className="opacity-40">·</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700">Ctrl+B</span>
            <span>bold</span>
            <span className="opacity-40">·</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700">Ctrl+K</span>
            <span>link</span>
            <span className="opacity-40">·</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700">![alt](url)</span>
            <span>image</span>
          </p>
        </div>

        {/* Key Takeaway + AI Generator */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Core Key Takeaway (TL;DR) *</span>
            </label>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI Summarize from Notes</span>
            </button>
          </div>
          <textarea
            required
            rows={2}
            placeholder="In 1-2 sentences, what is the single most important concept or golden rule you learned?"
            value={formData.keyTakeaway}
            onChange={(e) => updateForm({ keyTakeaway: e.target.value })}
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
          />
        </div>

        {/* Doubts & Time Spent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-indigo-500" />
              <span>Open Questions & Doubts (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="What still feels unclear or needs exploration?"
              value={formData.doubts}
              onChange={(e) => updateForm({ doubts: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Time Dedicated</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                required
                value={formData.timeSpent?.amount || 0}
                onChange={(e) => updateForm({ timeSpent: { ...formData.timeSpent!, amount: parseInt(e.target.value) || 0 } })}
                className="w-28 px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
              />
              <select
                value={formData.timeSpent?.unit || 'minutes'}
                onChange={(e: any) => updateForm({ timeSpent: { ...formData.timeSpent!, unit: e.target.value } })}
                className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm cursor-pointer"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Tags className="w-4 h-4 text-blue-500" />
            <span>Tags & Keywords (Press Enter to add)</span>
          </label>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 shadow-sm min-h-[50px]">
            {formData.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add keyword e.g. hooks, dsa, nextjs..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex-1 min-w-[150px] bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none px-2 py-1"
            />
          </div>
        </div>

        {/* AI Next Topic Suggestions */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Curious what to study next?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get Gemini AI recommendations tailored to your active hierarchy path.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={suggLoading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-850 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {suggLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Get Next Study Topics</span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-fade-in">
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Suggested Next Topics:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateForm({ topic: sugg })}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  + {sugg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">

          {/* Status info */}
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-700 dark:text-slate-300">Publish</strong> makes this log visible in your journal.&nbsp;
              <strong className="text-slate-700 dark:text-slate-300">Save Draft</strong> keeps it private so you can finish writing later.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            {/* Save Draft */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            {/* Publish */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('published')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
              <span>{isEditing ? 'Save & Publish' : 'Publish Log'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Add Image Modal ───────────────────────────────────────────────────── */}
      {showImageModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Insert Image</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add visuals, diagrams, or screenshots to your log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option 1: Upload File */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Option 1: Upload from Computer
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-850/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-600 dark:text-slate-300 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Click to browse or drag & drop</span>
                <span className="text-xs text-slate-400">Supports PNG, JPG, GIF, WEBP (Max 5MB)</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-slate-200 dark:border-slate-800" />
              <span className="absolute px-3 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase">Or</span>
            </div>

            {/* Option 2: Image URL */}
            <form onSubmit={handleUrlImageInsert} className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Option 2: Insert from Web URL
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://example.com/diagram.png"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                {imageUrlInput && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 max-h-32 flex items-center justify-center p-2">
                    <img src={imageUrlInput} alt="Preview" className="max-h-28 object-contain rounded-lg" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageUrlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Insert URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryEditorPage;
