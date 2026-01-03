'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { departmentAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import { AlertTriangle, CheckCircle, MapPin, Loader2, RefreshCw, Eye, Clock, Users } from 'lucide-react';

export default function DepartmentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [complaints, setComplaints] = useState([]);
    const [pendingCount, setPendingCount] = useState({ pending: 0, in_progress: 0, total_active: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'officer' && user.role !== 'admin'))) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [complaintsData, countData] = await Promise.all([
                departmentAPI.getComplaints(statusFilter || undefined),
                departmentAPI.getPendingCount()
            ]);
            setComplaints(complaintsData || []);
            setPendingCount(countData || { pending: 0, in_progress: 0, total_active: 0 });
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus, remarks = '') => {
        setUpdating(id);
        try {
            await departmentAPI.updateStatus(id, {
                status: newStatus,
                remarks: remarks || `Status updated to ${newStatus}`
            });
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const getPriorityBadge = (priority) => {
        const p = String(priority || 'Low').toLowerCase();
        if (p === 'high') return <span className="flex items-center gap-1 text-red-600 font-bold"><AlertTriangle size={14} /> High</span>;
        if (p === 'medium') return <span className="text-orange-600 font-semibold">Medium</span>;
        return <span className="text-blue-600">Low</span>;
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto my-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Department Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Welcome, Officer. You have{' '}
                        <span className="font-bold text-orange-600 dark:text-orange-500">{pendingCount.total_active || 0} active</span> tasks.
                    </p>
                </div>

                <div className="flex gap-3 items-center">
                    {/* Refresh */}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg text-sm transition border border-transparent dark:border-gray-700"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {/* Priority Legend */}
                    <div className="hidden md:flex bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700 shadow-sm gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> High
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-400"></div> Medium
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div> Low
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchData} className="text-sm underline hover:text-red-800 dark:hover:text-red-300">Retry</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Clock className="text-red-600 dark:text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount.pending || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <RefreshCw className="text-yellow-600 dark:text-yellow-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount.in_progress || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="text-green-600 dark:text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Resolved Today</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount.resolved_today || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}

            {/* Complaints Table */}
            {!loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 border-b dark:border-gray-700">ID</th>
                                <th className="p-4 border-b dark:border-gray-700">Priority (AI)</th>
                                <th className="p-4 border-b dark:border-gray-700">Issue / Location</th>
                                <th className="p-4 border-b dark:border-gray-700 text-center">Votes</th>
                                <th className="p-4 border-b dark:border-gray-700">Status</th>
                                <th className="p-4 border-b dark:border-gray-700 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700 dark:text-gray-300">
                            {complaints.map((complaint) => {
                                const statusLower = String(complaint.status || '').toLowerCase().replace(/_/g, ' ');
                                const isResolved = statusLower === 'resolved' || statusLower === 'rejected' || statusLower === 'closed';

                                return (
                                    <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700 last:border-0 transition">
                                        <td className="p-4 font-mono text-blue-600 dark:text-blue-400">#{complaint.id}</td>
                                        <td className="p-4">{getPriorityBadge(complaint.priority)}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">{complaint.category || 'General'}</div>
                                            <div className="truncate max-w-sm text-gray-600 dark:text-gray-400 text-sm" title={complaint.description}>
                                                {complaint.description}
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                <MapPin size={12} /> {complaint.location}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-orange-600 dark:text-orange-500">{complaint.upvotes || 0}</span>
                                        </td>
                                        <td className="p-4"><Badge status={complaint.status} /></td>
                                        <td className="p-4">
                                            {!isResolved ? (
                                                <div className="flex gap-2 justify-center">
                                                    {statusLower === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS', 'Work started')}
                                                            disabled={updating === complaint.id}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {updating === complaint.id ? <Loader2 className="animate-spin" size={12} /> : null}
                                                            Start
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/department/complaint/${complaint.id}`)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition flex items-center gap-1"
                                                    >
                                                        <Eye size={12} /> Handle
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-500 flex items-center gap-1 justify-center text-xs font-medium">
                                                    <CheckCircle size={14} /> Done
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {complaints.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="font-medium">No complaints found matching the filter.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
