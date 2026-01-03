'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { departmentAPI, complaintsAPI } from '@/lib/api';
import Badge from '@/components/Badge';
import {
    MapPin, Clock, User, Phone, Mail, FileText, Upload, CheckCircle,
    AlertTriangle, ArrowLeft, Loader2, ImagePlus, X, MessageSquare,
    Calendar, Activity
} from 'lucide-react';

export default function HandleComplaint() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState('');
    const [proofImages, setProofImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const complaintId = params?.id;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && complaintId) {
            fetchComplaint();
        }
    }, [user, complaintId]);

    const fetchComplaint = async () => {
        try {
            const data = await complaintsAPI.getById(complaintId);
            setComplaint(data);
            setStatus(data.status);
        } catch (err) {
            setError('Failed to load complaint');
        } finally {
            setLoading(false);
        }
    };

    const handleProofUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + proofImages.length > 5) {
            setError('Maximum 5 proof images allowed');
            return;
        }

        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                setError('Each file must be less than 10MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setProofImages(prev => [...prev, { url: e.target.result, file, name: file.name }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeProof = (index) => {
        setProofImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleResolve = async () => {
        if (!remarks.trim()) {
            setError('Please add remarks before resolving');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Update status to resolved
            await departmentAPI.updateStatus(complaintId, {
                status: 'RESOLVED',
                remarks: remarks
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/department');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to resolve complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await departmentAPI.updateStatus(complaintId, {
                status: newStatus,
                remarks: `Status updated to ${newStatus}`
            });
            setStatus(newStatus);
            fetchComplaint();
        } catch (err) {
            setError('Failed to update status');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg text-center">
                <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Resolved Successfully!</h2>
                <p className="text-gray-600">The citizen will be notified about the resolution.</p>
                <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg text-center">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Complaint Not Found</h2>
                <button onClick={() => router.push('/department')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const getPriorityColor = (priority) => {
        const p = String(priority).toLowerCase();
        if (p === 'high') return 'text-red-600 bg-red-50 border-red-200';
        if (p === 'medium') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => router.push('/department')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Handle Complaint #{complaint.id}</h2>
                </div>

                {/* SLA Timer */}
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl shadow-sm">
                    <Clock className="text-red-600 dark:text-red-400 animate-pulse" size={24} />
                    <div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">SLA Deadline</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300 font-mono">02 Days : 04 Hrs</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Complaint Details */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className={`${getPriorityColor(complaint.priority)} dark:bg-opacity-10 px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center`}>
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                    <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">{complaint.category || 'General'}</h3>
                                    <p className="text-xs opacity-75 text-gray-600 dark:text-gray-300">Received {new Date(complaint.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`bg-white dark:bg-gray-700 text-xs font-bold px-3 py-1.5 rounded-full border dark:border-gray-600 shadow-sm flex items-center gap-1 ${getPriorityColor(complaint.priority)} dark:bg-opacity-20`}>
                                <Activity size={12} />
                                AI Priority: {complaint.priority || 'Medium'}
                            </span>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{complaint.description}</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <MapPin className="text-gray-400 dark:text-gray-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Location</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{complaint.location}</p>
                                        {complaint.ward && <p className="text-xs text-gray-500 dark:text-gray-400">Ward: {complaint.ward}</p>}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <Calendar className="text-gray-400 dark:text-gray-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Submitted</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {new Date(complaint.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Upvotes indicator */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <span className="font-bold text-orange-600 dark:text-orange-500">{complaint.upvotes || 0}</span> community votes
                                </span>
                                <Badge status={complaint.status} />
                            </div>
                        </div>
                    </section>

                    {/* Resolution Workspace */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>

                        <div className="mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={24} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resolution Workspace</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Officer Remarks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Officer Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white resize-none p-4"
                                    placeholder="Describe the action taken to resolve this complaint..."
                                    rows="4"
                                />
                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRemarks('Issue inspected and resolved on site. Work completed successfully.')}
                                        className="text-xs bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Use Template 1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRemarks('Team dispatched and repair work completed. Follow-up scheduled if needed.')}
                                        className="text-xs bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Use Template 2
                                    </button>
                                </div>
                            </div>

                            {/* Resolution Proof Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Resolution Proof (Upload Images)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleProofUpload}
                                        className="hidden"
                                        id="proof-upload"
                                    />
                                    <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="text-gray-400 dark:text-gray-500 mb-2" size={40} />
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Upload proof images</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 10MB each (max 5 files)</span>
                                    </label>
                                </div>

                                {proofImages.length > 0 && (
                                    <div className="flex gap-3 mt-4 flex-wrap">
                                        {proofImages.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img.url}
                                                    alt={`Proof ${idx + 1}`}
                                                    className="w-24 h-24 object-cover rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeProof(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <span className="absolute bottom-1 left-1 right-1 bg-green-600 text-white text-[10px] text-center rounded truncate px-1">
                                                    Proof {idx + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm"
                                >
                                    Save as In Progress
                                </button>
                                <button
                                    onClick={handleResolve}
                                    disabled={submitting || !remarks.trim()}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/30 transform transition hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <CheckCircle size={20} />
                                    )}
                                    MARK RESOLVED
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Current Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Current Status</h4>
                        <div className="flex gap-2 mb-4">
                            <select
                                value={status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 dark:text-gray-400">SLA Compliance</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">65%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Citizen Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Citizen Details</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                                {complaint.user?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">{complaint.user?.name || 'Citizen'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Registered User</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <Mail className="text-gray-400 dark:text-gray-500" size={16} />
                                <span>{complaint.user?.email || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <Phone className="text-gray-400 dark:text-gray-500" size={16} />
                                <span>{complaint.user?.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2">
                                <MessageSquare size={16} /> Contact Citizen
                            </button>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Activity Log</h4>
                        <div className="space-y-4">
                            {complaint.status_logs?.slice(-4).reverse().map((log, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Status: <Badge status={log.status} size="small" />
                                        </p>
                                        {log.remarks && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{log.remarks}</p>}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!complaint.status_logs || complaint.status_logs.length === 0) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
