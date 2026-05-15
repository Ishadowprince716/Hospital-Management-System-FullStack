import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, MessageSquareHeart, RefreshCw, Search, Star, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Feedback {
    id: number;
    patientName?: string;
    doctorName?: string;
    rating: number;
    waitTimeRating?: number;
    staffRating?: number;
    doctorRating?: number;
    category?: string;
    comment?: string;
    followUpRequested?: boolean;
    createdAt?: string;
}

interface Stats {
    total?: number;
    averageRating?: number;
    followUps?: number;
    detractors?: number;
    promoters?: number;
}

const PatientExperience: React.FC = () => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<Stats>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    const fetchFeedback = async () => {
        setLoading(true);
        setError(null);
        try {
            const [feedbackRes, statsRes] = await Promise.all([
                api.get('/patient-feedback'),
                api.get('/patient-feedback/stats'),
            ]);
            setFeedback(Array.isArray(feedbackRes.data?.data) ? feedbackRes.data.data : []);
            setStats(statsRes.data?.data || {});
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load patient feedback.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const categoryData = useMemo(() => {
        const map = new Map<string, { category: string; count: number; total: number }>();
        feedback.forEach(item => {
            const category = item.category || 'General';
            const row = map.get(category) || { category, count: 0, total: 0 };
            row.count += 1;
            row.total += item.rating || 0;
            map.set(category, row);
        });
        return [...map.values()].map(row => ({
            category: row.category,
            count: row.count,
            avg: row.count ? Number((row.total / row.count).toFixed(1)) : 0,
        }));
    }, [feedback]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return feedback.filter(item => {
            const matchesFilter = filter === 'ALL'
                || (filter === 'FOLLOW_UP' && item.followUpRequested)
                || (filter === 'LOW_RATING' && item.rating <= 3)
                || item.category === filter;
            const matchesSearch = !term
                || (item.patientName || '').toLowerCase().includes(term)
                || (item.doctorName || '').toLowerCase().includes(term)
                || (item.comment || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [feedback, filter, search]);

    const filters = ['ALL', 'FOLLOW_UP', 'LOW_RATING', ...Array.from(new Set(feedback.map(item => item.category || 'General')))];

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <MessageSquareHeart className="h-6 w-6 text-rose-600" />
                        Patient Experience
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Track satisfaction, follow-up requests, and service themes from patient feedback.</p>
                </div>
                <Button onClick={fetchFeedback} variant="outline" className="gap-2 self-start">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Average Rating', value: stats.averageRating ? Number(stats.averageRating).toFixed(1) : '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Responses', value: stats.total ?? feedback.length, icon: MessageSquareHeart, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Follow-ups', value: stats.followUps ?? 0, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Promoters', value: stats.promoters ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                                <Icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                    <CardContent className="p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Rating by Theme</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Average score and volume by feedback category.</p>
                        <div className="mt-5 h-72">
                            {loading ? (
                                <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                                        <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                        <Tooltip />
                                        <Bar dataKey="avg" fill="#e11d48" radius={[6, 6, 0, 0]} name="Avg Rating" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Follow-up Queue</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Low ratings and requested callbacks.</p>
                        <div className="mt-4 space-y-3">
                            {feedback.filter(item => item.followUpRequested || item.rating <= 3).slice(0, 6).map(item => (
                                <div key={item.id} className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-color)]">{item.patientName || 'Patient'}</p>
                                            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.comment || 'No comment provided.'}</p>
                                        </div>
                                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{item.rating}/5</span>
                                    </div>
                                </div>
                            ))}
                            {!loading && feedback.filter(item => item.followUpRequested || item.rating <= 3).length === 0 && (
                                <p className="py-10 text-center text-sm text-[var(--text-muted)]">No follow-up items right now.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search patient, doctor, comment..."
                        className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)] outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map(item => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                                filter === item ? 'border-rose-600 bg-rose-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-rose-300'
                            }`}
                        >
                            {item.replaceAll('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)] dark:bg-slate-800/50">
                                <tr>
                                    {['Patient', 'Theme', 'Rating', 'Doctor', 'Comment', 'Follow-up', 'Date'].map(header => (
                                        <th key={header} className="px-5 py-3 font-bold">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                        <td className="px-5 py-4 font-semibold text-[var(--text-color)]">{item.patientName || '—'}</td>
                                        <td className="px-5 py-4 text-[var(--text-muted)]">{item.category || 'General'}</td>
                                        <td className="px-5 py-4 font-bold text-amber-600">{item.rating}/5</td>
                                        <td className="px-5 py-4 text-[var(--text-muted)]">{item.doctorName || '—'}</td>
                                        <td className="max-w-[300px] truncate px-5 py-4 text-[var(--text-muted)]" title={item.comment || ''}>{item.comment || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${item.followUpRequested ? 'border-purple-100 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                                                {item.followUpRequested ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-[var(--text-muted)]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                    </tr>
                                ))}
                                {!loading && filtered.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-[var(--text-muted)]">No feedback found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientExperience;
