
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Plus, Target, ChevronRight, Edit3, Award, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { challengeService } from '../services/challengeService';
import { entryService } from '../services/entryService';
import { Challenge, LearningEntry } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';

const ChallengeDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [entries, setEntries] = useState<LearningEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (challengeId: string) => {
        try {
            const [c, e] = await Promise.all([
                challengeService.getChallengeById(challengeId),
                entryService.getEntries()
            ]);
            setChallenge(c);
            setEntries(e.filter(entry => entry.challengeId === challengeId).sort((a, b) => b.dayNumber - a.dayNumber));
        } finally {
            setLoading(false);
        }
    };

    const progress = challenge ? Math.min(Math.round((entries.length / challenge.duration) * 100), 100) : 0;

    if (loading) return <div className="animate-pulse space-y-4 pt-10">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-40 bg-gray-200 rounded-3xl"></div>
    </div>;

    if (!challenge) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900">Challenge not found</h2>
            <Link to="/challenges" className="text-blue-600 hover:underline mt-4 inline-block">Back to Challenges</Link>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/challenges')}
                    icon={ChevronLeft}
                >
                    Back to Challenges
                </Button>
                <div className="flex gap-3">
                    <Button
                        onClick={() => navigate(`/entry/new?challengeId=${challenge._id}`)}
                        icon={Plus}
                    >
                        Add Entry
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-blue-600 p-8 text-white relative">
                    <div className="absolute top-8 right-8 text-blue-200">
                        <Target className="w-24 h-24 opacity-20" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-100 uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full mb-4">
                            {React.createElement(CATEGORY_ICONS[challenge.category], { className: "w-3.5 h-3.5" })}
                            {challenge.category}
                        </div>
                        <h1 className="text-4xl font-black mb-4">{challenge.name}</h1>
                        <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
                            {challenge.description}
                        </p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50/50">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-gray-900">{progress}%</span>
                            <span className="text-sm text-gray-500 mb-1">({entries.length} / {challenge.duration} days)</span>
                        </div>
                        <div className="mt-3">
                            <ProgressBar progress={progress} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase">Started</span>
                            <span className="text-gray-900 font-bold">{format(new Date(challenge.startDate), 'MMM dd, yyyy')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase">Status</span>
                            <Badge variant="green" size="md">{challenge.status}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Learning Path</h2>
                {entries.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center">
                        <p className="text-gray-500">No entries yet. Start logging your progress!</p>
                        <Link
                            to={`/entry/new?challengeId=${challenge._id}`}
                            className="mt-4 inline-block text-blue-600 font-bold hover:underline"
                        >
                            Create Day 1 Log
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry) => (
                            <div key={entry._id} className="relative pl-8 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-0.5 before:bg-gray-100 last:before:hidden">
                                <div className="absolute left-[-4px] top-4 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white"></div>

                                <Card className="p-6 hover:shadow-md transition-all group relative" hover>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="blue" size="md">DAY {entry.dayNumber}</Badge>
                                            <span className="text-xs text-gray-400">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/entry/${entry._id}/edit`} className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                    <Link to={`/entries/${entry._id}`}>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{entry.topic}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2">{entry.keyTakeaway}</p>
                                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {entry.timeSpent.amount} {entry.timeSpent.unit}
                                            </span>
                                            <div className="flex gap-1">
                                                {entry.tags.slice(0, 3).map(tag => (
                                                    <Badge key={tag} variant="gray" size="sm">#{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeDetailPage;
