'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { complaintsAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import { MapPin, ThumbsUp, AlertTriangle, Loader2, RefreshCw, Users } from 'lucide-react';

export default function CommunityFeed() {
    const { user } = useAuth();
    const router = useRouter();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [category, setCategory] = useState('');
    const [upvoting, setUpvoting] = useState(null);

    const categories = [
        'All', 'Roads & Transport', 'Water Supply', 'Electricity',
        'Sanitation & Waste', 'Health & Safety', 'General'
    ];

    useEffect(() => {
        fetchComplaints();
    }, [sortBy, category]);

    const fetchComplaints = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await complaintsAPI.getPublic(
                category === 'All' ? '' : category,
                sortBy
            );
            setComplaints(data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch complaints');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (id) => {
        if (!user) {
            router.push('/login?redirect=/citizen/community');
            return;
        }

        setUpvoting(id);
        try {
            await complaintsAPI.upvote(id);
            // Update local state
            setComplaints(prev => prev.map(c =>
                c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c
            ));
        } catch (err) {
            console.error('Upvote failed:', err);
            if (err.message.includes('credentials')) {
                router.push('/login?redirect=/citizen/community');
            }
        } finally {
            setUpvoting(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto my-8 px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Community Feed
                    </h2>
                    <p className="text-sm text-gray-500">Public grievances from citizens. Upvote to boost priority!</p>
                </div>
                <button
                    onClick={fetchComplaints}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-6 bg-gray-50 p-3 rounded-lg">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 text-sm bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                    ))}
                </select>
                <div className="flex gap-1">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${sortBy === 'recent' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
                            }`}
                    >
                        Recent
                    </button>
                    <button
                        onClick={() => setSortBy('upvotes')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${sortBy === 'upvotes' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
                            }`}
                    >
                        Top Voted
                    </button>
                    <button
                        onClick={() => setSortBy('priority')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${sortBy === 'priority' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
                            }`}
                    >
                        High Priority
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchComplaints} className="text-sm underline">Retry</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}

            {/* Complaints Grid */}
            {!loading && complaints.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    {complaints.map((complaint) => (
                        <div key={complaint.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
                            <div className="flex gap-4">
                                {/* Vote Section */}
                                <div className="flex flex-col items-center justify-start pt-1 gap-1 min-w-[3.5rem]">
                                    <button
                                        onClick={() => handleUpvote(complaint.id)}
                                        disabled={upvoting === complaint.id}
                                        className={`p-2.5 rounded-full transition ${upvoting === complaint.id
                                                ? 'bg-orange-100 text-orange-500'
                                                : 'hover:bg-orange-50 text-gray-400 hover:text-orange-500'
                                            }`}
                                    >
                                        {upvoting === complaint.id ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <ThumbsUp size={20} />
                                        )}
                                    </button>
                                    <span className="font-bold text-lg text-gray-700">{complaint.upvotes || 0}</span>
                                    <span className="text-[10px] text-gray-400">votes</span>
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded truncate">
                                            {complaint.category || 'General'}
                                        </span>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-medium text-gray-800 mb-2 line-clamp-3">
                                        {complaint.description}
                                    </p>
                                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                        <MapPin size={14} className="flex-shrink-0" />
                                        <span className="truncate">{complaint.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                                        <Badge status={complaint.status} />
                                        {complaint.priority === 'HIGH' && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                                                <AlertTriangle size={12} /> High Urgency
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && complaints.length === 0 && !error && (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Public Grievances Yet</h3>
                    <p className="text-gray-400 mb-4">Be the first to submit a public grievance!</p>
                    {user ? (
                        <button
                            onClick={() => router.push('/citizen/lodge')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Lodge Grievance
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Login to Submit
                        </button>
                    )}
                </div>
            )}

            {/* Stats */}
            {!loading && complaints.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-400">
                    Showing {complaints.length} public grievance{complaints.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
