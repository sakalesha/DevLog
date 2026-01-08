
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  ChevronLeft, 
  Calendar, 
  ExternalLink,
  Award,
  Terminal,
  Activity
} from 'lucide-react';
import { entryService } from '../services/entryService';
import { LearningEntry, UserStats } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';

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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-semibold">Dashboard</span>
          </button>
          <div className="flex gap-4">
            <Github className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-gray-900 cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <header className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-32 h-32 rounded-3xl bg-blue-600 p-1">
            <div className="w-full h-full rounded-[22px] overflow-hidden border-4 border-white">
              <img src="https://picsum.photos/seed/dev/200/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">John Doe</h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              Full Stack Engineer passionate about distributed systems and React. 
              Documenting my journey to mastery, one log at a time.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                <Award className="w-4 h-4 text-amber-500" />
                {stats?.currentStreak} Day Streak
              </div>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                <Terminal className="w-4 h-4 text-blue-500" />
                {stats?.totalEntriesCreated} Logs Written
              </div>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                <Activity className="w-4 h-4 text-green-500" />
                {stats?.totalHoursLearned}h Learning
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Section */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Learning Timeline</h2>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <div className="space-y-12">
          {entries.map((entry, idx) => (
            <div key={entry._id} className="relative pl-10 md:pl-0">
              {/* Timeline Line */}
              {idx !== entries.length - 1 && (
                <div className="absolute left-4 md:left-1/2 top-8 bottom-0 w-px bg-gray-200 -translate-x-1/2 hidden md:block"></div>
              )}
              
              <div className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                        {CATEGORY_ICONS[entry.category]}
                        {entry.category}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {entry.topic}
                    </h3>
                    <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">
                      {entry.keyTakeaway}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold">#{tag}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => navigate(`/entries/${entry._id}`)}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                    >
                      Read Full Log <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white bg-blue-600 shadow-lg items-center justify-center z-10">
                  <Calendar className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 hidden md:block"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-400 text-sm font-medium">
          &copy; 2024 DevLog - Built for consistency.
        </div>
      </footer>
    </div>
  );
};

export default PortfolioPage;
