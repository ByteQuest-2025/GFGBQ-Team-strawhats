'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { departmentAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

export default function DepartmentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [complaints, setComplaints] = useState([]);
    const [pendingCount, setPendingCount] = useState({ pending: 0, in_progress: 0 });
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
        try {
            const [complaintsData, countData] = await Promise.all([
                departmentAPI.getComplaints(statusFilter || undefined),
                departmentAPI.getPendingCount()
            ]);
            setComplaints(complaintsData);
            setPendingCount(countData);
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

    if (authLoading || loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto my-8 px-4">
            <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Department Dashboard</h2>
                    <p className="text-sm text-gray-500">
                        Welcome, Officer. You have{' '}
                        <span className="font-bold text-orange-600">{pendingCount.total_active} active</span> tasks.
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Priority Legend */}
                    <div className="bg-white p-2 rounded border flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-500"></div> High
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-500"></div> Medium
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500"></div> Low
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>
            )}

            {/* Complaints Table */}
            <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4 border-b">ID</th>
                            <th className="p-4 border-b">Priority (AI)</th>
                            <th className="p-4 border-b">Issue / Location</th>
                            <th className="p-4 border-b">Votes</th>
                            <th className="p-4 border-b">Status</th>
                            <th className="p-4 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {complaints.map((complaint) => (
                            <tr key={complaint.id} className="hover:bg-gray-50 border-b last:border-0">
                                <td className="p-4 font-mono">#{complaint.id}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 font-bold ${complaint.priority === 'High' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {complaint.priority === 'High' && <AlertTriangle size={14} />}
                                        {complaint.priority}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900 mb-1">{complaint.category}</div>
                                    <div className="truncate max-w-xs text-gray-600" title={complaint.description}>
                                        {complaint.description}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <MapPin size={12} /> {complaint.location}
                                    </div>
                                </td>
                                <td className="p-4 font-semibold">{complaint.upvotes}</td>
                                <td className="p-4"><Badge status={complaint.status} /></td>
                                <td className="p-4">
                                    {complaint.status !== 'Resolved' && complaint.status !== 'Rejected' ? (
                                        <div className="flex gap-2">
                                            {complaint.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(complaint.id, 'In Progress', 'Work started')}
                                                    disabled={updating === complaint.id}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs shadow-sm transition disabled:opacity-50"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStatusUpdate(complaint.id, 'Resolved', 'Issue resolved')}
                                                disabled={updating === complaint.id}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs shadow-sm transition disabled:opacity-50"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-green-600 flex items-center gap-1 text-xs">
                                            <CheckCircle size={14} /> Done
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {complaints.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No complaints found matching the filter.
                    </div>
                )}
            </div>
        </div>
    );
}
