import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Edit3,
  Share2,
  Calendar,
  Clock,
  Tag,
  HelpCircle,
  Brain,
  ExternalLink,
  Sparkles,
  Search,
  Loader2,
  Folder,
  CheckCircle2,
  Trash2,
  BookOpen,
  AlignLeft,
  Eye,
  List,
  FileText,
  Copy
} from 'lucide-react';
import { entryService } from '../services/entryService';
import { geminiService, DeepDiveResult } from '../services/geminiService';
import { LearningEntry } from '../types';
import { getCategoryIcon } from '../constants';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import RichContentViewer, { extractToc, stripHtml, estimateReadingTime, wordCount, TocEntry } from '../components/ui/RichContentViewer';

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDialogProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center space-y-4">
      <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete this log?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This action is permanent and cannot be undone.</p>
      </div>
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-colors"
        >
          Delete Permanently
        </button>
      </div>
    </div>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const EntryDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const { toasts, toast, dismissToast } = useToast();

  const [entry, setEntry] = useState<LearningEntry | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [deepDive, setDeepDive] = useState<DeepDiveResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Check for published=true query param (redirected from editor)
  const justPublished = new URLSearchParams(location.search).get('published') === 'true';

  useEffect(() => {
    if (id) {
      entryService.getEntryById(id).then(async data => {
        if (data) {
          setEntry(data);
          setToc(extractToc(data.content));
          try {
            const aiSuggestions = await geminiService.getLearningSuggestions(data.topic, data.category, data.categoryPath);
            setSuggestions(aiSuggestions);
          } catch {
            setSuggestions(['Advanced Design Patterns', 'Performance Optimization', 'Refactoring Techniques']);
          }
        }
        setLoading(false);
      });
    }
  }, [id]);

  // Reading progress bar listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDeepDive = async (topic: string) => {
    setDeepDiveLoading(true);
    try {
      const result = await geminiService.performDeepDive(topic);
      setDeepDive(result);
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast('Link copied to clipboard!', 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCheatSheet = () => {
    if (!entry) return;
    const plainTextContent = stripHtml(entry.content);
    const cheatSheet = `# ${entry.topic}\n\n**Category:** ${entry.category}\n**Golden Rule:** "${entry.keyTakeaway}"\n\n---\n\n## Detailed Notes & Code\n\n${plainTextContent}\n\n---\n*Exported from DevLog*`;
    navigator.clipboard.writeText(cheatSheet);
    setCopiedCheatSheet(true);
    toast('Markdown Cheat Sheet copied! Ready to paste into slides or docs.', 'success', 3500);
    setTimeout(() => setCopiedCheatSheet(false), 3000);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await entryService.deleteEntry(id);
      navigate('/');
    } catch (err: any) {
      toast(err?.message || 'Failed to delete entry.', 'error');
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 my-8">
        <div className="animate-pulse h-12 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-48" />
        <div className="animate-pulse h-96 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Insight Not Found</h2>
        <p className="text-sm text-slate-400 mt-1 mb-4">This log may have been deleted or moved.</p>
        <Link to="/" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm">Back Home</Link>
      </div>
    );
  }

  const Icon = getCategoryIcon(entry.category);
  const hasPath = entry.categoryPath && entry.categoryPath.length > 0;
  const readTime = estimateReadingTime(entry.content);
  const words = wordCount(entry.content);

  return (
    <div className="min-h-screen bg-[#FFFBEB] dark:bg-[#0F172A] transition-colors duration-300 pb-24 animate-fade-in relative">
      {/* ── Reading Progress Bar ──────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-600 via-amber-500 to-indigo-500 z-[100] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {showConfirmDelete && (
          <ConfirmDeleteDialog
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}

        {/* Published Success Banner */}
        {justPublished && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 shadow-sm animate-slide-up">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">🎉 Successfully Published!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Your learning log is now live and formatted as an editorial article.</p>
            </div>
          </div>
        )}

        {/* ── Editorial Top Navigation & Action Bar ─────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3 py-2 border-b border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Logs</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy as Markdown Cheat Sheet button */}
            <button
              onClick={handleCopyCheatSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors text-violet-700 dark:text-violet-300 font-bold text-xs shadow-sm"
              title="Copy formatted markdown outline for presentations or docs"
            >
              {copiedCheatSheet ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4" />}
              <span>{copiedCheatSheet ? 'Copied Outline!' : 'Copy Cheat Sheet'}</span>
            </button>
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-slate-600 dark:text-slate-300"
              title="Copy Share Link"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            {/* Delete */}
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={deleting}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/60 transition-colors text-slate-400 hover:text-red-500 dark:hover:text-red-400"
              title="Delete Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Edit */}
            <Link
              to={`/entry/${id}/edit`}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all ml-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Article</span>
            </Link>
          </div>
        </div>

        {/* ── Article Header (Editorial Style — no box wrapper) ────────────────── */}
        <header className="space-y-6 pt-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Badge variant="blue" size="md" icon={Icon}>
              {hasPath ? entry.categoryPath!.join(' > ') : entry.category}
            </Badge>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              Published Log
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white font-display leading-[1.12] tracking-tight">
            {entry.topic}
          </h1>

          {/* Editorial Byline / Meta Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-slate-200/80 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span>{format(new Date(entry.date), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>{entry.timeSpent?.amount || 0} {entry.timeSpent?.unit || 'min'} dedicated</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-violet-500" />
                <span>{words.toLocaleString()} words</span>
              </div>
            </div>
            {entry.views > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{entry.views} views</span>
              </div>
            )}
          </div>
        </header>

        {/* ── tl;dr Executive Summary / Key Takeaway Callout ──────────────────── */}
        <div className="my-8 bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/30 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-orange-950/10 p-6 md:p-8 rounded-2xl border-l-4 border-amber-500 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">
            <Brain className="w-4 h-4 text-amber-500" />
            <span>tl;dr — Golden Rule & Key Takeaway</span>
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-bold text-lg md:text-xl leading-relaxed italic">
            "{entry.keyTakeaway}"
          </p>
        </div>

        {/* ── Table of Contents (In This Article) ─────────────────────────────── */}
        {toc.length >= 2 && (
          <div className="my-8 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <List className="w-4 h-4 text-indigo-500" />
              <span>In This Article</span>
            </div>
            <nav className="flex flex-col gap-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors leading-snug
                    ${item.level === 1 ? '' : item.level === 2 ? 'ml-4' : 'ml-8'}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* ── Article Content Body (Editorial Typography Engine) ────────────── */}
        <article className="py-6">
          <RichContentViewer html={entry.content} containerRef={contentRef} />
        </article>

        {/* ── Open Doubts & Areas for Research ──────────────────────────────── */}
        {entry.doubts && (
          <section className="my-10 bg-indigo-50/60 dark:bg-indigo-950/30 p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/50 shadow-sm">
            <h2 className="text-sm font-extrabold text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>Open Questions & Areas for Deeper Research</span>
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {entry.doubts}
            </p>
          </section>
        )}

        {/* ── Tags ───────────────────────────────────────────────────────────── */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400 mr-1" />
            {entry.tags.map(tag => (
              <span key={tag} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── AI Deep Dive & Study Topics ────────────────────────────────────── */}
        <section className="pt-10 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>Gemini AI Technical Deep Dive</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expand your mastery with an AI technical breakdown and related research.</p>
            </div>
            <button
              onClick={() => handleDeepDive(entry.topic)}
              disabled={deepDiveLoading}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-sm disabled:opacity-50"
            >
              {deepDiveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Run Research Analysis</span>
            </button>
          </div>

          {deepDive && (
            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 animate-in fade-in duration-500 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Comprehensive Research Summary</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed">
                {deepDive.text}
              </div>
              {deepDive.sources && deepDive.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Verified Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {deepDive.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3 pt-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Related Study Topics to Explore Next:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleDeepDive(s)}
                    className="p-4 bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 rounded-2xl hover:border-primary-400 dark:hover:border-primary-500 transition-all text-left group flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{s}</p>
                    <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                      <span>Research Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer Meta */}
        <footer className="pt-8 pb-12 text-center text-xs text-slate-400 dark:text-slate-500 font-medium border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
          <p>Logged: {entry.createdAt ? format(new Date(entry.createdAt), 'PPP p') : 'Just now'}</p>
          <p>Last Updated: {entry.updatedAt ? format(new Date(entry.updatedAt), 'PPP p') : 'Just now'}</p>
        </footer>
      </div>
    </div>
  );
};

export default EntryDetailPage;
