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
  List
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toc, setToc] = useState<TocEntry[]>([]);

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
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in">
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
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Your learning log is now saved and visible in your journal.</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all font-semibold text-sm shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Logs</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Delete */}
          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={deleting}
            className="p-2.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/60 transition-colors text-slate-400 hover:text-red-500 dark:hover:text-red-400"
            title="Delete Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            title="Copy Share Link"
          >
            {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
          </button>
          {/* Edit */}
          <Link
            to={`/entry/${id}/edit`}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-primary-500/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Log</span>
          </Link>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden">

        {/* Hero Header */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-slate-50/80 to-slate-100/50 dark:from-slate-850/80 dark:to-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/80 relative">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="md" icon={Icon}>
                {hasPath ? entry.categoryPath!.join(' > ') : entry.category}
              </Badge>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              Published
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-display leading-tight mb-6">
            {entry.topic}
          </h1>

          <div className="flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>{format(new Date(entry.date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{entry.timeSpent?.amount || 0} {entry.timeSpent?.unit || 'minutes'} dedicated</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>{readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-violet-500" />
              <span>{words.toLocaleString()} words</span>
            </div>
            {entry.views > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{entry.views} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Table of Contents (if headings exist) */}
        {toc.length >= 2 && (
          <div className="px-8 md:px-12 py-6 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Table of Contents</p>
            </div>
            <nav className="space-y-1.5">
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

        {/* Content Body */}
        <div className="p-8 md:p-12 space-y-10">

          {/* Rich Notes */}
          <section>
            <h2 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
              Detailed Notes & Code
            </h2>
            <RichContentViewer html={entry.content} containerRef={contentRef} />
          </section>

          {/* Key Takeaway Highlight Box */}
          <section className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 p-8 rounded-3xl border border-amber-200/70 dark:border-amber-800/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-sm font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-500" />
              <span>Core Golden Rule (Takeaway)</span>
            </h2>
            <p className="text-slate-900 dark:text-slate-100 font-bold text-lg md:text-xl leading-relaxed italic">
              "{entry.keyTakeaway}"
            </p>
          </section>

          {/* Open Doubts */}
          {entry.doubts && (
            <section className="bg-indigo-50/60 dark:bg-indigo-950/30 p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/50 shadow-sm">
              <h2 className="text-sm font-extrabold text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Open Questions & Areas for Deeper Research</span>
              </h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {entry.doubts}
              </p>
            </section>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400 mr-1" />
              {entry.tags.map(tag => (
                <span key={tag} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Deep Dive & Suggestions */}
          <section className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
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
              <div className="space-y-3 pt-2">
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

        </div>

        {/* Footer Meta */}
        <div className="bg-slate-50/80 dark:bg-slate-850/80 p-6 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium border-t border-slate-200/60 dark:border-slate-800/80 flex-wrap gap-2">
          <span>Logged: {entry.createdAt ? format(new Date(entry.createdAt), 'PPP p') : 'Just now'}</span>
          <span>Last Updated: {entry.updatedAt ? format(new Date(entry.updatedAt), 'PPP p') : 'Just now'}</span>
        </div>

      </div>
    </div>
  );
};

export default EntryDetailPage;
