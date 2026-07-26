import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Linkedin,
  ChevronLeft,
  Calendar,
  ExternalLink,
  Award,
  Terminal,
  Activity,
  Folder,
  ArrowRight
} from 'lucide-react';
import { entryService } from '../services/entryService';
import { LearningEntry, UserStats } from '../types';
import { getCategoryIcon } from '../constants';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      entryService.getEntries(),
      entryService.getStats()
    ]).then(([e, s]) => {
      setEntries(e.filter(entry => entry.status === 'published'));
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center animate-pulse text-slate-500 font-bold">Loading Portfolio...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFFBEB] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-semibold text-sm">
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="flex gap-4">
            <Github className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <header className="max-w-5xl mx-auto px-6 py-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/80 border border-primary-200/60 dark:border-primary-800/60 text-xs font-bold text-primary-600 dark:text-primary-300 mb-6 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>Public DevLog Portfolio</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 font-display leading-tight">
          What confused me yesterday <span className="text-amber-500">→</span><br />
          what I mastered today.
        </h1>
        <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
          A documented history of technical problems solved, architecture learned, and daily code insights.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-10">
          <div className="px-5 py-2.5 bg-white/90 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{stats?.currentStreak || 0} Day Streak</span>
          </div>
          <div className="px-5 py-2.5 bg-white/90 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm">
            <Terminal className="w-4 h-4 text-primary-500" />
            <span>{stats?.totalEntriesCreated || 0} Insights Logged</span>
          </div>
          <div className="px-5 py-2.5 bg-white/90 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>{stats?.totalHoursLearned || 0}h Focused Learning</span>
          </div>
        </div>
      </header>

      {/* Timeline Section */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Learning Journey Timeline</h2>
          <div className="h-px flex-1 bg-slate-200/80 dark:bg-slate-800"></div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-850/80 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-600 dark:text-slate-400">No published portfolio logs yet</p>
          </div>
        ) : (
          <div className="space-y-12">
            {entries.map((entry, idx) => {
              const Icon = getCategoryIcon(entry.category);
              const hasPath = entry.categoryPath && entry.categoryPath.length > 0;

              return (
                <div key={entry._id} className="relative pl-10 md:pl-0">
                  {/* Timeline Vertical Line */}
                  {idx !== entries.length - 1 && (
                    <div className="absolute left-4 md:left-1/2 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block"></div>
                  )}

                  <div className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1 w-full">
                      <div className="bg-white/90 dark:bg-slate-850/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 dark:border-slate-750 shadow-md hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <Badge variant="blue" size="sm" icon={Icon}>
                            {hasPath ? entry.categoryPath!.join(' > ') : entry.category}
                          </Badge>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-display">
                          {entry.topic}
                        </h3>
                        
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 mb-6">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-0.5">Key Takeaway:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{entry.keyTakeaway}"
                          </p>
                        </div>

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {entry.tags.map(tag => (
                              <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => navigate(`/entries/${entry._id}`)}
                          className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline group-hover:translate-x-1 transition-transform"
                        >
                          <span>Read Complete Log</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Center Timeline Icon Node */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-primary-600 dark:bg-primary-500 shadow-lg items-center justify-center z-10">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 hidden md:block"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
          Built as a learning log — not to show expertise, but to build it.
        </div>
      </footer>
    </div>
  );
};

export default PortfolioPage;
