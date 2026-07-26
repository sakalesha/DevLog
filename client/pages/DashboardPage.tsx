import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { entryService } from '../services/entryService';
import { categoryService } from '../services/categoryService';
import { LearningEntry, UserStats, Category } from '../types';
import { getCategoryIcon } from '../constants';
import { format } from 'date-fns';
import { Plus, Edit3, Flame, Clock, Calendar, CheckCircle2, Filter, X, Folder, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [allEntries, setAllEntries] = useState<LearningEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Get active category filter from URL query param
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const filterCatId = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, e, c] = await Promise.all([
          entryService.getStats(),
          entryService.getEntries(),
          categoryService.getCategories()
        ]);
        setStats(s);
        setAllEntries(e);
        setCategories(c);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCategory = useMemo(() => {
    if (!filterCatId) return null;
    return categories.find(c => c._id === filterCatId) || null;
  }, [filterCatId, categories]);

  // Filter entries based on selected category ID or name in categoryPath
  const displayedEntries = useMemo(() => {
    if (!filterCatId || !activeCategory) return allEntries;
    return allEntries.filter(entry => {
      if (entry.categoryId === filterCatId) return true;
      if (entry.category === activeCategory.name) return true;
      if (entry.categoryPath && entry.categoryPath.includes(activeCategory.name)) return true;
      return false;
    });
  }, [allEntries, filterCatId, activeCategory]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Personal Learning Log</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight leading-tight mb-3">
            What confused me yesterday <span className="text-amber-400">→</span><br />
            what I mastered today.
          </h1>
          <p className="text-slate-300 mt-2 text-base md:text-lg font-light leading-relaxed">
            Document code concepts, architectural breakdowns, and daily aha-moments with custom $N$-depth categorization.
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0 flex justify-center">
          <Button
            size="lg"
            icon={Plus}
            onClick={() => navigate('/entry/new')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/20 border-0 font-bold px-8 py-4 rounded-2xl"
          >
            Log New Insight
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Current Streak"
          value={`${stats?.currentStreak || 0} Days`}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
          color="orange"
          trend="Keep the learning momentum alive!"
        />
        <StatCard
          label="Total Insights Logged"
          value={stats?.totalEntriesCreated || 0}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="green"
        />
        <StatCard
          label="Hours Dedicated"
          value={`${stats?.totalHoursLearned || 0}h`}
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
          color="blue"
        />
        <StatCard
          label="Topics Explored"
          value={stats?.topicsCount || 0}
          icon={<Calendar className="w-5 h-5 text-violet-500" />}
          color="purple"
        />
      </section>

      {/* Category Filter Banner (if active) */}
      {activeCategory && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/80 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-600 text-white shadow-sm">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Active Category Filter</span>
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeCategory.name}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({displayedEntries.length} entries found)</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Journal Entries Feed */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span>{activeCategory ? `${activeCategory.name} Logs` : 'Recent Journal Entries'}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {displayedEntries.length} of {allEntries.length} entries
            </span>
          </div>

          {displayedEntries.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-12 text-center shadow-sm space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No journal entries found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {activeCategory ? `You haven't logged any insights in "${activeCategory.name}" yet.` : "Start documenting your development journey today!"}
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate('/entry/new')}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Log First Insight
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedEntries.map((entry) => {
                const Icon = getCategoryIcon(entry.category);
                const hasPath = entry.categoryPath && entry.categoryPath.length > 0;

                return (
                  <Card key={entry._id} className="p-6 group relative" hover>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" size="sm" icon={Icon}>
                          {hasPath ? entry.categoryPath!.join(' > ') : entry.category}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.timeSpent?.amount || 0}m</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </span>
                        <Link
                          to={`/entry/${entry._id}/edit`}
                          className="text-slate-300 dark:text-slate-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                          title="Edit Log"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <Link to={`/entries/${entry._id}`} className="block">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg md:text-xl mb-2.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-display leading-snug flex items-center justify-between">
                        <span>{entry.topic}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-600 dark:text-primary-400 flex-shrink-0" />
                      </h3>
                      
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-0.5">Core Takeaway:</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {entry.keyTakeaway}
                        </p>
                      </div>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Widgets (Activity Map & Tips) */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 font-display flex items-center justify-between">
              <span>Activity Matrix</span>
              <span className="text-[11px] font-normal text-slate-400">Last 28 days</span>
            </h2>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }).map((_, i) => {
                const isActiveDay = i % 3 === 0 || i === 27 || i === 25 || i === 20;
                const intensity = i % 7 === 0 ? 'bg-primary-600 dark:bg-primary-500 shadow-md shadow-primary-500/30' : i % 5 === 0 ? 'bg-primary-400 dark:bg-primary-600' : isActiveDay ? 'bg-primary-200 dark:bg-primary-800' : 'bg-slate-100 dark:bg-slate-900';
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-md transition-all hover:scale-125 cursor-pointer ${intensity}`}
                    title={`Day ${28 - i} ago`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Less active</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-900" />
                <span className="w-2.5 h-2.5 rounded bg-primary-200 dark:bg-primary-800" />
                <span className="w-2.5 h-2.5 rounded bg-primary-400 dark:bg-primary-600" />
                <span className="w-2.5 h-2.5 rounded bg-primary-600 dark:bg-primary-500" />
              </div>
              <span>More active</span>
            </div>
          </div>

          {/* Quick Tip Widget */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-primary-500/10 p-6 rounded-3xl border border-amber-500/20 dark:border-amber-500/10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Flame className="w-3.5 h-3.5" />
              <span>Pro Tip</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Organize with $N$-Depth Trees</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Click "Manage" in the left sidebar to create folders inside folders (e.g. Frontend &gt; React &gt; State &gt; Action Hooks).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
