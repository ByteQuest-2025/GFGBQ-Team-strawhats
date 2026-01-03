'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import { BarChart3, AlertTriangle, Users, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [statsData, summaryData, deptsData] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getSummary(),
                adminAPI.getDepartments()
            ]);
            setStats(statsData);
            setSummary(summaryData);
            setDepartments(deptsData);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
            </div>
        );
    }

    const highPriorityZones = [
        'Ward 12 - Market Area',
        'Sector 4 - Housing Board',
        'MG Road - Commercial'
    ];

    return (
        <div className="max-w-6xl mx-auto my-8 px-4">
            <h2 className="text-2xl font-bold text-theme mb-6">Administration Overview</h2>

            {error && (
                <div className="text-[var(--error)] bg-[var(--error-bg)] p-3 rounded mb-4">{error}</div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card-theme p-6 rounded-lg border-l-4 border-[var(--primary)]">
                    <div className="text-theme-muted text-sm font-semibold uppercase">Total Grievances</div>
                    <div className="text-3xl font-bold text-theme mt-2">{summary?.total_complaints || 0}</div>
                </div>
                <div className="card-theme p-6 rounded-lg border-l-4 border-[var(--error)]">
                    <div className="text-theme-muted text-sm font-semibold uppercase">Pending Action</div>
                    <div className="text-3xl font-bold text-[var(--error)] mt-2">{summary?.pending_action || 0}</div>
                </div>
                <div className="card-theme p-6 rounded-lg border-l-4 border-[var(--success)]">
                    <div className="text-theme-muted text-sm font-semibold uppercase">Resolved</div>
                    <div className="text-3xl font-bold text-[var(--success)] mt-2">{summary?.resolved || 0}</div>
                </div>
                <div className="card-theme p-6 rounded-lg border-l-4 border-[var(--accent)]">
                    <div className="text-theme-muted text-sm font-semibold uppercase">Resolution Rate</div>
                    <div className="text-3xl font-bold text-[var(--accent)] mt-2">
                        {summary?.resolution_rate || 0}%
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Category Breakdown */}
                <div className="card-theme p-6 rounded-lg">
                    <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-[var(--primary)]" /> Category Breakdown
                    </h3>
                    <div className="space-y-4">
                        {stats?.by_category && Object.entries(stats.by_category).map(([category, count]) => {
                            const total = stats.total || 1;
                            const pct = (count / total) * 100;
                            return (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-theme-secondary">{category}</span>
                                        <span className="font-bold text-theme">{count}</span>
                                    </div>
                                    <div className="w-full bg-theme-tertiary rounded-full h-2">
                                        <div
                                            className="bg-[var(--primary)] h-2 rounded-full transition-all"
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* High Priority Zones */}
                <div className="card-theme p-6 rounded-lg">
                    <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-[var(--error)]" /> High Priority Zones
                    </h3>
                    <div className="space-y-3">
                        {highPriorityZones.map((zone, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[var(--error-bg)] rounded border border-[var(--error)]/20">
                                <span className="text-sm font-medium text-theme">{zone}</span>
                                <span className="text-xs font-bold text-[var(--error)] bg-theme-card px-2 py-1 rounded border border-[var(--error)]/30">
                                    Critical
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Priority Distribution */}
            <div className="mt-8 card-theme p-6 rounded-lg">
                <h3 className="font-bold text-theme mb-4">Priority Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[var(--error-bg)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--error)]">
                            {stats?.by_priority?.High || 0}
                        </div>
                        <div className="text-sm text-theme-secondary">High Priority</div>
                    </div>
                    <div className="text-center p-4 bg-[var(--warning-bg)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--warning)]">
                            {stats?.by_priority?.Medium || 0}
                        </div>
                        <div className="text-sm text-theme-secondary">Medium Priority</div>
                    </div>
                    <div className="text-center p-4 bg-[var(--primary-light)] rounded-lg">
                        <div className="text-2xl font-bold text-[var(--primary)]">
                            {stats?.by_priority?.Low || 0}
                        </div>
                        <div className="text-sm text-theme-secondary">Low Priority</div>
                    </div>
                </div>
            </div>

            {/* Departments List */}
            <div className="mt-8 card-theme p-6 rounded-lg">
                <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
                    <Users size={20} className="text-[var(--primary)]" /> Departments
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div key={dept.id} className="p-4 border border-theme rounded-lg hover:shadow-md transition card-hover-effect bg-theme-card">
                            <div className="font-semibold text-theme">{dept.name}</div>
                            <div className="text-xs text-theme-muted mt-1">{dept.code}</div>
                            {dept.contact_email && (
                                <div className="text-xs text-[var(--primary)] mt-2">{dept.contact_email}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
