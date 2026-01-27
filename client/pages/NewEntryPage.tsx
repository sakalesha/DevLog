
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import {
  Save,
  Trash2,
  Sparkles,
  ChevronLeft,
  Loader2,
  Clock,
  Tags,
  MessageCircle,
  AlertCircle,
  Eye,
  Edit3,
  CheckCircle2,
  X
} from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { entryService } from '../services/entryService';
import { geminiService } from '../services/geminiService';
import { challengeService } from '../services/challengeService';
import { Challenge, Category, LearningEntry } from '../types';


interface Toast {
  message: string;
  type: 'success' | 'error';
}

const NewEntryPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [formData, setFormData] = useState<Partial<LearningEntry>>({
    topic: '',
    category: 'DSA',
    content: '',
    keyTakeaway: '',
    doubts: '',
    timeSpent: { amount: 30, unit: 'minutes' },
    tags: [],
    date: new Date().toISOString().split('T')[0],
    challengeId: '',
    dayNumber: 0,
  });

  const [nextDay, setNextDay] = useState<number>(1);


  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allChallenges = await challengeService.getChallenges();
      setChallenges(allChallenges);

      if (id) {
        const entry = await entryService.getEntryById(id);
        if (entry) {
          setFormData(entry);
          return;
        }
      }

      // Check for challengeId in query params
      const searchParams = new URLSearchParams(location.search);
      const queryChallengeId = searchParams.get('challengeId');
      if (queryChallengeId) {
        setFormData(prev => ({ ...prev, challengeId: queryChallengeId }));
      } else if (allChallenges.length > 0) {
        setFormData(prev => ({ ...prev, challengeId: allChallenges[0]._id }));
      }
    };
    fetchData();
  }, [id, location.search]);

  // Update nextDay whenever challengeId changes
  useEffect(() => {
    if (formData.challengeId && !id) {
      entryService.getEntries().then(entries => {
        const challengeEntries = entries.filter(e => e.challengeId === formData.challengeId);
        setNextDay(challengeEntries.length + 1);
      });
    }
  }, [formData.challengeId, id]);


  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAiGenerate = async () => {
    const plainText = formData.content?.replace(/<[^>]*>?/gm, '').trim() || '';

    if (plainText.length < 50) {
      setToast({ message: "Content too short for AI analysis (min 50 chars).", type: 'error' });
      return;
    }

    setAiLoading(true);
    try {
      const takeaway = await geminiService.generateKeyTakeaway(plainText);
      setFormData(prev => ({ ...prev, keyTakeaway: takeaway }));
      setToast({ message: "Key takeaway generated!", type: 'success' });
    } catch (err) {
      setToast({ message: "AI generation failed.", type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.content || !formData.keyTakeaway) {
      setToast({ message: "Please fill in all required fields.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await entryService.saveEntry(formData);
      setToast({ message: id ? "Entry updated successfully!" : "New entry logged!", type: 'success' });

      // Delay navigation to allow user to see the success toast
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setToast({ message: "Failed to save entry. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['code-block', 'blockquote'],
      ['clean']
    ],
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-10 duration-300 border ${toast.type === 'success'
            ? 'bg-green-600 text-white border-green-500'
            : 'bg-red-600 text-white border-red-500'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold text-sm">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          {id && (
            <>
              <Link
                to={`/entry/${id}/edit`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-semibold ${location.pathname.includes('/edit')
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit Log
              </Link>
              <Link
                to={`/entries/${id}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-semibold"
              >
                <Eye className="w-4 h-4" />
                View Log
              </Link>
              <button
                onClick={async () => {
                  if (window.confirm('Delete this log?')) {
                    await entryService.deleteEntry(id);
                    setToast({ message: "Entry deleted.", type: 'success' });
                    setTimeout(() => navigate('/'), 1000);
                  }
                }}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            form="entry-form"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {id ? 'Update Log' : 'Save Log'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{id ? 'Edit Learning Log' : 'What did you learn today?'}</h1>
            <p className="text-blue-100 opacity-90">Document your progress and build your portfolio.</p>
          </div>
          {!id && formData.challengeId && (
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">Session</span>
              <span className="text-2xl font-black">Day {nextDay}</span>
            </div>
          )}
        </div>


        <form id="entry-form" onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Topic / Title</label>
              <input
                type="text"
                placeholder="e.g. Binary Tree BFS"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.topic}
                onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                maxLength={100}
              />
              <span className="text-[10px] text-gray-400 float-right">{formData.topic?.length}/100</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Challenge</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={formData.challengeId}
                onChange={e => setFormData(prev => ({ ...prev, challengeId: e.target.value }))}
                disabled={!!id}
              >
                <option value="">No Challenge</option>
                {challenges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 mb-1 block">Learning Content</label>
            <div className="rich-text-wrapper">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={content => setFormData(prev => ({ ...prev, content }))}
                modules={quillModules}
                placeholder="Explain as if you are teaching someone else... (Use Code Block for snippets)"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
              <span>Min 50 chars required</span>
              <span>Rich text enabled</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">Key Takeaway</label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-gray-400 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Generate
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="One core principle you'll never forget..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formData.keyTakeaway}
              onChange={e => setFormData(prev => ({ ...prev, keyTakeaway: e.target.value }))}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Time Spent</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-20 px-3 py-2 border rounded-lg outline-none"
                      value={formData.timeSpent?.amount}
                      onChange={e => setFormData(prev => ({ ...prev, timeSpent: { ...prev.timeSpent!, amount: parseInt(e.target.value) || 0 } }))}
                    />
                    <select
                      className="flex-1 px-3 py-2 border rounded-lg outline-none bg-white"
                      value={formData.timeSpent?.unit}
                      onChange={e => setFormData(prev => ({ ...prev, timeSpent: { ...prev.timeSpent!, unit: e.target.value as 'minutes' | 'hours' } }))}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tags className="w-5 h-5 text-gray-400" />
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tags</label>
                  <input
                    type="text"
                    placeholder="Press enter to add tags"
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Doubts (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Anything that still feels fuzzy?"
                    className="w-full px-3 py-2 border rounded-lg outline-none resize-none"
                    value={formData.doubts}
                    onChange={e => setFormData(prev => ({ ...prev, doubts: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPage;
