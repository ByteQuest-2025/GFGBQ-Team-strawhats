'use client';

import { useState, useEffect } from 'react';
import { complaintsAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import { MapPin, ThumbsUp, AlertTriangle } from 'lucide-react';

export default function CommunityFeed() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [category, setCategory] = useState('');

    const categories = [
        'All', 'Roads & Transport', 'Water Supply', 'Electricity',
        'Sanitation & Waste', 'Health & Safety'
    ];

    useEffect(() => {
        fetchComplaints();
    }, [sortBy, category]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const data = await complaintsAPI.getPublic(
                category === 'All' ? '' : category,
                sortBy
            );
            setComplaints(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (id) => {
        try {
            await complaintsAPI.upvote(id);
            // Update local state
            setComplaints(prev => prev.map(c =>
                c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c
            ));
        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto my-8 px-4">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Public Grievances</h2>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-1 text-sm bg-white border rounded shadow-sm"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setSortBy('upvotes')}
                        className={`px-3 py-1 text-sm border rounded shadow-sm ${sortBy === 'upvotes' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Top Voted
                    </button>
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-3 py-1 text-sm border rounded shadow-sm ${sortBy === 'recent' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Recent
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 flex gap-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center justify-start pt-1 gap-1 min-w-[3rem]">
                            <button
                                onClick={() => handleUpvote(complaint.id)}
                                className="p-2 rounded-full hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition"
                            >
                                <ThumbsUp size={20} />
                            </button>
                            <span className="font-bold text-gray-700">{complaint.upvotes}</span>
                            <span className="text-[10px] text-gray-400">Votes</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                                    {complaint.category}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                                {complaint.description}
                            </h4>
                            <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                <MapPin size={14} /> {complaint.location}
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 mt-2">
                                <Badge status={complaint.status} />
                                {complaint.priority === 'High' && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                                        <AlertTriangle size={12} /> High Urgency
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {complaints.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded shadow text-gray-500">
                    No public grievances found.
                </div>
            )}
        </div>
    );
}
