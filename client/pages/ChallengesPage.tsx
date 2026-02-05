
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Calendar, ChevronRight, Award, Trash2 } from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { entryService } from '../services/entryService';
import { Challenge, Category, LearningEntry } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ChallengesPage: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [entries, setEntries] = useState<LearningEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
        name: '',
        category: 'DSA',
        description: '',
        duration: 30,
        startDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [c, e] = await Promise.all([
                challengeService.getChallenges(),
                entryService.getEntries()
            ]);
            setChallenges(c);
            setEntries(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChallenge.name || !newChallenge.description) return;

        await challengeService.saveChallenge(newChallenge);
        setShowCreateModal(false);
        setNewChallenge({
            name: '',
            category: 'DSA',
            description: '',
            duration: 30,
            startDate: new Date().toISOString().split('T')[0],
        });
        fetchData();
    };

    const handleDeleteChallenge = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (window.confirm('Are you sure? This will delete the challenge and all associated entries.')) {
            await challengeService.deleteChallenge(id);
            fetchData();
        }
    };

    const calculateProgress = (challengeId: string, duration: number) => {
        const challengeEntries = entries.filter(e => e.challengeId === challengeId);
        return Math.min(Math.round((challengeEntries.length / duration) * 100), 100);
    };

    if (loading) return <div className="animate-pulse space-y-4 pt-10">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Challenges</h1>
                    <p className="text-slate-500 mt-1">Structured paths to master your skills.</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    icon={Plus}
                    className="shadow-xl shadow-primary-500/20"
                >
                    New Challenge
                </Button>
            </div>

            {challenges.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-primary-50">
                        <Target className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">No active challenges</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Create your first challenge to organize your learning entries into a structured bootcamp or study series.
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        size="lg"
                    >
                        Get Started
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => {
                        const progress = calculateProgress(challenge._id, challenge.duration);
                        return (
                            <Link key={challenge._id} to={`/challenges/${challenge._id}`}>
                                <Card hover className="h-full flex flex-col justify-between p-0 group overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge variant="blue" icon={CATEGORY_ICONS[challenge.category]}>
                                                {challenge.category}
                                            </Badge>
                                            <button
                                                onClick={(e) => handleDeleteChallenge(challenge._id, e)}
                                                className="text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2 font-display">
                                            {challenge.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                                            {challenge.description}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                                <span>{progress}% Complete</span>
                                                <span>{challenge.duration} Days Plan</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-1000 ease-out relative"
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Started {new Date(challenge.startDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-primary-600 group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h2 className="text-2xl font-bold font-display relative z-10">New Learning Challenge</h2>
                            <p className="opacity-90 relative z-10 mt-1">Define your goal and timeframe.</p>
                        </div>
                        <form onSubmit={handleCreateChallenge} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Challenge Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    placeholder="e.g. 100 Days of Code"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                                    value={newChallenge.name}
                                    onChange={e => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none bg-white font-medium text-slate-700"
                                            value={newChallenge.category}
                                            onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value as Category })}
                                        >
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Duration (Days)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        value={newChallenge.duration}
                                        onChange={e => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="What is your objective?"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all placeholder:text-slate-400"
                                    value={newChallenge.description}
                                    onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 shadow-xl shadow-primary-500/20"
                                >
                                    Create Challenge
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengesPage;
