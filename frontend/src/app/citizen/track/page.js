'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { complaintsAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import { MapPin } from 'lucide-react';

export default function TrackGrievance() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchComplaints();
        }
    }, [user]);

    const fetchComplaints = async () => {
        try {
            const data = await complaintsAPI.getMy();
            setComplaints(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const getProgressWidth = (status) => {
        const s = String(status || '').toLowerCase().replace(/_/g, ' ');
        if (s === 'resolved' || s === 'closed') return 'w-full bg-green-500';
        if (s === 'in progress' || s === 'assigned') return 'w-1/2 bg-yellow-500';
        if (s === 'rejected') return 'w-full bg-red-500';
        return 'w-[10%] bg-blue-500'; // Pending
    };

    if (authLoading || loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto my-8 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Grievance History</h2>

            {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>
            )}

            {complaints.length === 0 ? (
                <div className="text-center py-12 bg-white rounded shadow text-gray-500">
                    No grievances found. <a href="/citizen/lodge" className="text-blue-600 font-semibold">Lodge your first complaint</a>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <div
                            key={complaint.id}
                            className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-bold text-lg text-gray-800">#{complaint.id}</span>
                                        <span className="text-sm text-gray-500">• {complaint.category}</span>
                                        <span className="text-sm text-gray-400">
                                            • {new Date(complaint.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-2">{complaint.description}</p>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={14} /> {complaint.location}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge status={complaint.status} />
                                    <div className="text-xs text-gray-500 font-medium">
                                        Priority: {complaint.priority}
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline Bar */}
                            <div className="mt-6 relative">
                                <div className="h-1 w-full bg-gray-200 rounded">
                                    <div className={`h-1 rounded transition-all duration-500 ${getProgressWidth(complaint.status)}`}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                                    <span>Received</span>
                                    <span>Processing</span>
                                    <span>Resolved</span>
                                </div>
                            </div>

                            {/* Status Logs */}
                            {complaint.status_logs && complaint.status_logs.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Status History</h4>
                                    <div className="space-y-2">
                                        {complaint.status_logs.slice(-3).map((log, idx) => (
                                            <div key={idx} className="text-sm text-gray-600 flex gap-2">
                                                <span className="text-gray-400">{new Date(log.created_at).toLocaleDateString()}</span>
                                                <Badge status={log.status} size="small" />
                                                {log.remarks && <span>- {log.remarks}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
