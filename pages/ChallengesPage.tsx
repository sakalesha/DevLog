
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Calendar, ChevronRight, Award, Trash2 } from 'lucide-react';
import { challengeService } from '../services/challengeService';
import { entryService } from '../services/entryService';
import { Challenge, Category, LearningEntry } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';

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

    const handleDeleteChallenge = async (id: string) => {
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
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
                    <p className="text-gray-500 mt-1">Structured paths to master your skills.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5" />
                    New Challenge
                </button>
            </div>

            {challenges.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No active challenges</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Create your first challenge to organize your learning entries into a structured bootcamp or study series.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                        Get Started
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => {
                        const progress = calculateProgress(challenge._id, challenge.duration);
                        return (
                            <div key={challenge._id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all relative overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                                            {CATEGORY_ICONS[challenge.category]}
                                            {challenge.category}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteChallenge(challenge._id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <Link to={`/challenges/${challenge._id}`}>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {challenge.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                            {challenge.description}
                                        </p>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-gray-700">{progress}% Complete</span>
                                                <span className="text-gray-400">{challenge.duration} Days Plan</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Started {new Date(challenge.startDate).toLocaleDateString()}
                                    </div>
                                    <Link to={`/challenges/${challenge._id}`} className="text-blue-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-600 p-6 text-white">
                            <h2 className="text-2xl font-bold">New Learning Challenge</h2>
                            <p className="opacity-80">Define your goal and timeframe.</p>
                        </div>
                        <form onSubmit={handleCreateChallenge} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Challenge Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    placeholder="e.g. 100 Days of Code, Full Stack Bootcamp"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newChallenge.name}
                                    onChange={e => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Category</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                        value={newChallenge.category}
                                        onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value as Category })}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Duration (Days)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newChallenge.duration}
                                        onChange={e => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="What is your objective?"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={newChallenge.description}
                                    onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengesPage;
