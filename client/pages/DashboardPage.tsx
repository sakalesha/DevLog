
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { entryService } from '../services/entryService';
import { challengeService } from '../services/challengeService';
import { LearningEntry, UserStats, Challenge } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';
import { Target, Award, ChevronRight, Plus, Edit3, Flame, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<LearningEntry[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, e, c] = await Promise.all([
          entryService.getStats(),
          entryService.getEntries(),
          challengeService.getChallenges()
        ]);
        setStats(s);
        setRecentEntries(e.slice(0, 5));
        setActiveChallenges(c.filter(challenge => challenge.status === 'active').slice(0, 3));

      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-4">
    <div className="h-20 bg-slate-200/50 animate-pulse rounded-2xl w-full" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200/50 animate-pulse rounded-2xl" />)}
    </div>
  </div>;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-900/10 text-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight leading-tight mb-2">
            Here’s what confused me <span className="text-blue-400">→</span><br />
            here’s how I fixed my thinking.
          </h1>
          <p className="text-slate-300 mt-4 text-lg font-light max-w-2xl">
            I run a devlog purely to document my learning with code, clarity, and honesty.
            <span className="block mt-2 text-sm opacity-70 font-mono">Not for perfection. Just for growth.</span>
          </p>
        </div>
        <div className="relative z-10">
          <Button
            size="lg"
            icon={Plus}
            onClick={() => navigate('/entry/new')}
            className="bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-black/10 border-0"
          >
            Start Today's Log
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Current Streak"
          value={`${stats?.currentStreak} Days`}
          icon={<Flame className="w-5 h-5" />}
          color="orange"
          trend="+1 from yesterday"
        />
        <StatCard
          label="Total Logs"
          value={stats?.totalEntriesCreated || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Hours Learned"
          value={`${stats?.totalHoursLearned}h`}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Topics Covered"
          value={stats?.topicsCount || 0}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
      </section>

      {/* Active Challenges Section */}
      {activeChallenges.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-800 font-display">Active Challenges</h2>
            <Link to="/challenges" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeChallenges.map(challenge => {
              const challengeEntries = recentEntries.filter(e => e.challengeId === challenge._id);
              const progress = Math.min(Math.round((challengeEntries.length / challenge.duration) * 100), 100);
              return (
                <Link
                  key={challenge._id}
                  to={`/challenges/${challenge._id}`}
                >
                  <Card hover className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center ring-4 ring-primary-50/50">
                          {React.createElement(CATEGORY_ICONS[challenge.category], { className: "w-6 h-6" })}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase text-xs tracking-widest">{challenge.name}</h3>
                          <Badge size="sm" variant="blue">{challenge.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span>{challenge.duration} Days</span>
                      </div>
                      <ProgressBar progress={progress} height="md" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Entries */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-800 font-display">Recent Logs</h2>
            <Link to="/entries" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <Card
                key={entry._id}
                className="p-5 group relative"
                hover
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="blue" size="sm" icon={CATEGORY_ICONS[entry.category]}>
                      {entry.category}
                    </Badge>
                    {entry.challengeId !== 'none' && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day {entry.dayNumber}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-400">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                    <Link
                      to={`/entry/${entry._id}/edit`}
                      className="text-slate-300 hover:text-primary-600 transition-colors"
                      title="Edit Log"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <Link to={`/entries/${entry._id}`} className="block">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary-600 transition-colors font-display leading-tight">{entry.topic}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{entry.keyTakeaway}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{tag}</span>
                    ))}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Heatmap/Sidebar placeholder */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">Activity Map</h2>
            <div className="grid grid-cols-7 gap-1.5">
              {/* Heatmap with some color */}
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md transition-all hover:scale-110 ${i % 7 === 0 ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30' : i % 3 === 0 ? 'bg-emerald-400' : i % 5 === 0 ? 'bg-emerald-200' : 'bg-slate-100'}`}
                  title={`Day ${i + 1}`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-center text-slate-400 mt-4 font-medium">Last 4 weeks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
