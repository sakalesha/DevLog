
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

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-20 bg-gray-200 rounded-xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, John! 👋</h1>
          <p className="text-gray-500 mt-1">You've maintained your streak for {stats?.currentStreak} days. Keep it up!</p>
        </div>
        <Button
          size="lg"
          icon={Plus}
          onClick={() => navigate('/entry/new')}
        >
          Start Today's Log
        </Button>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={`${stats?.currentStreak} Days`}
          icon={<Flame className="w-6 h-6" />}
          color="orange"
          trend="+1 from yesterday"
        />
        <StatCard
          label="Total Logs"
          value={stats?.totalEntriesCreated || 0}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          label="Hours Learned"
          value={`${stats?.totalHoursLearned}h`}
          icon={<Clock className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Topics Covered"
          value={stats?.topicsCount || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
      </section>

      {/* Active Challenges Section */}
      {activeChallenges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Active Challenges</h2>
            <Link to="/challenges" className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
              View All Challenges <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeChallenges.map(challenge => {
              const challengeEntries = recentEntries.filter(e => e.challengeId === challenge._id); // Note: recentEntries only has 5, this is just for UI demo
              const progress = Math.min(Math.round((challengeEntries.length / challenge.duration) * 100), 100);
              return (
                <Link
                  key={challenge._id}
                  to={`/challenges/${challenge._id}`}
                >
                  <Card hover className="p-6 h-full transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        {CATEGORY_ICONS[challenge.category]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">{challenge.name}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{challenge.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Progress</span>
                        <span>{challenge.duration} Days</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar progress={progress} height="sm" />
                      </div>
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
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Logs</h2>
            <Link to="/entries" className="text-sm font-semibold text-blue-600 hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <Card
                key={entry._id}
                className="p-4 hover:border-blue-300 transition-all group relative"
                hover
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {CATEGORY_ICONS[entry.category]}
                    {entry.category}
                    {entry.challengeId !== 'none' && (
                      <Badge variant="blue" size="sm">Day {entry.dayNumber}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                    <Link
                      to={`/entry/${entry._id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Log"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <Link to={`/entries/${entry._id}`}>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{entry.topic}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{entry.keyTakeaway}</p>
                  <div className="mt-3 flex gap-2">
                    {entry.tags.map(tag => (
                      <Badge key={tag} variant="gray" size="sm">#{tag}</Badge>
                    ))}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Heatmap/Sidebar placeholder */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>
            <div className="grid grid-cols-7 gap-2">
              {/* Heatmap with some color */}
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${i % 7 === 0 ? 'bg-green-700' : i % 3 === 0 ? 'bg-green-400' : i % 5 === 0 ? 'bg-green-200' : 'bg-gray-100'}`}
                  title={`Day ${i + 1}`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">Showing last 4 weeks of activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
