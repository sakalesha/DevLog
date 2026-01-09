
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Target
} from 'lucide-react';
import { entryService } from '../services/entryService';
import { geminiService, DeepDiveResult } from '../services/geminiService';
import { challengeService } from '../services/challengeService';
import { LearningEntry, Challenge } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';

const EntryDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LearningEntry | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [deepDive, setDeepDive] = useState<DeepDiveResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  useEffect(() => {
    if (id) {
      entryService.getEntryById(id).then(async data => {
        if (data) {
          setEntry(data);
          // Fetch parent challenge
          if (data.challengeId !== 'none') {
            const c = await challengeService.getChallengeById(data.challengeId);
            setChallenge(c);
          }
          const aiSuggestions = await geminiService.getLearningSuggestions(data.topic, data.category);
          setSuggestions(aiSuggestions);
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

  if (loading) return <div className="animate-pulse h-screen bg-gray-200 rounded-2xl m-8"></div>;
  if (!entry) return <div className="flex flex-col items-center justify-center h-screen"><p>Entry not found.</p><Link to="/" className="text-blue-500">Back Home</Link></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <button
          onClick={() => challenge ? navigate(`/challenges/${challenge._id}`) : navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {challenge ? `Back to ${challenge.name}` : 'Back to History'}
        </button>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <Link
            to={`/entry/${id}/edit`}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Edit3 className="w-4 h-4" />
            Edit Log
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-8 md:p-12 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
              {CATEGORY_ICONS[entry.category]}
              {entry.category}
              {challenge && (
                <span className="flex items-center gap-1.5 ml-2 border-l border-gray-300 pl-3">
                  <Target className="w-3.5 h-3.5" />
                  {challenge.name}
                </span>
              )}
            </div>
            {challenge && (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">
                Day {entry.dayNumber}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-6">{entry.topic}</h1>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(entry.date), 'MMMM dd, yyyy')}
            </div>
            {challenge && (
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Sparkles className="w-4 h-4" />
                Session Day {entry.dayNumber}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {entry.timeSpent.amount} {entry.timeSpent.unit} spent
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {entry.tags.join(', ')}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-500 pl-4">What I Learned</h2>
            {/* Using dangerouslySetInnerHTML to render HTML from the Rich Text Editor */}
            <div
              className="text-gray-700 leading-relaxed text-lg prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </section>

          <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Key Takeaway
            </h2>
            <p className="text-blue-800 font-medium leading-relaxed italic">
              "{entry.keyTakeaway}"
            </p>
          </section>

          {entry.doubts && (
            <section className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
              <h2 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Remaining Doubts
              </h2>
              <p className="text-orange-800 font-medium leading-relaxed">
                {entry.doubts}
              </p>
            </section>
          )}

          {/* AI Suggestions & Deep Dive */}
          <section className="pt-4 border-t border-gray-100 mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">AI Insights</h2>
              <button
                onClick={() => handleDeepDive(entry.topic)}
                disabled={deepDiveLoading}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {deepDiveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                Deep Dive Research
              </button>
            </div>

            {deepDive && (
              <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-indigo-900 font-bold mb-3">
                  <Sparkles className="w-4 h-4" />
                  Technical Analysis
                </div>
                <div className="prose prose-sm prose-indigo mb-6 text-indigo-900 leading-relaxed">
                  {deepDive.text}
                </div>
                {deepDive.sources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Sources Found</p>
                    <div className="flex flex-wrap gap-2">
                      {deepDive.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          {s.title} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleDeepDive(s)}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 transition-colors group text-left"
                >
                  <p className="text-sm font-bold text-gray-900 mb-2">{s}</p>
                  <span className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1 group-hover:underline">
                    Deep Dive <ExternalLink className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-gray-50 p-6 flex items-center justify-between text-xs text-gray-400 font-medium border-t border-gray-100">
          <span>Created: {format(new Date(entry.createdAt), 'PPP p')}</span>
          <span>Last Updated: {format(new Date(entry.updatedAt), 'PPP p')}</span>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailPage;
