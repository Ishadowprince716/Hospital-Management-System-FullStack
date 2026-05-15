import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Loader2, RefreshCw, Search, ShieldAlert, Timer } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Handoff {
    id: number;
    createdByName?: string;
    patientName: string;
    location?: string;
    priority: string;
    status: string;
    summary: string;
    nextAction?: string;
    watchFlags?: string;
    updatedAt?: string;
}

const badge: Record<string, string> = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-100',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-100',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-100',
    CRITICAL: 'bg-red-50 text-red-700 border-red-100',
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const HandoffMonitor: React.FC = () => {
    const [handoffs, setHandoffs] = useState<Handoff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [actions, setActions] = useState<Record<number, string>>({});
    const [flags, setFlags] = useState<Record<number, string>>({});

    const fetchHandoffs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/clinical-handoffs');
            const rows = Array.isArray(res.data?.data) ? res.data.data as Handoff[] : [];
            setHandoffs(rows);
            setActions(Object.fromEntries(rows.map(r => [r.id, r.nextAction || ''])));
            setFlags(Object.fromEntries(rows.map(r => [r.id, r.watchFlags || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load clinical handoffs.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHandoffs(); }, []);

    const stats = useMemo(() => ({
        open: handoffs.filter(h => h.status === 'OPEN').length,
        progress: handoffs.filter(h => h.status === 'IN_PROGRESS').length,
        urgent: handoffs.filter(h => ['HIGH', 'CRITICAL'].includes(h.priority)).length,
        closed: handoffs.filter(h => h.status === 'CLOSED').length,
    }), [handoffs]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return handoffs.filter(h => {
            const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && h.status !== 'CLOSED') || h.status === filter || h.priority === filter;
            const matchesSearch = !term || h.patientName.toLowerCase().includes(term) || h.summary.toLowerCase().includes(term) || (h.createdByName || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, handoffs, search]);

    const update = async (handoff: Handoff, status = handoff.status, priority = handoff.priority) => {
        setUpdatingId(handoff.id);
        setError(null);
        try {
            const res = await api.patch(`/clinical-handoffs/${handoff.id}`, {
                status,
                priority,
                nextAction: actions[handoff.id] || '',
                watchFlags: flags[handoff.id] || '',
            });
            const updated = res.data?.data as Handoff;
            setHandoffs(current => current.map(item => item.id === handoff.id ? updated : item));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update handoff.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ClipboardList className="h-6 w-6 text-teal-600" /> Handoff Monitor</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Track unresolved clinical handoffs, watch flags, and continuity actions.</p>
                </div>
                <Button onClick={fetchHandoffs} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Open', value: stats.open, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'In Progress', value: stats.progress, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Urgent', value: stats.urgent, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => { const Icon = item.icon; return <div key={item.label} className="stat-card"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}><Icon className={`h-5 w-5 ${item.color}`} /></div><p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p><p className="text-sm text-[var(--text-muted)]">{item.label}</p></div>; })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor, summary..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" /></div>
                <div className="flex flex-wrap gap-2">{['ACTIVE', 'ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'HIGH', 'CRITICAL'].map(v => <button key={v} onClick={() => setFilter(v)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === v ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-teal-300'}`}>{v.replace('_', ' ')}</button>)}</div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div> : filtered.length === 0 ? <div className="py-16 text-center text-sm text-[var(--text-muted)]">No handoffs found.</div> : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(h => (
                                <div key={h.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-[var(--text-color)]">{h.patientName}</h2><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[h.priority]}`}>{h.priority}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[h.status]}`}>{h.status.replace('_', ' ')}</span></div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{h.summary}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]"><span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{h.createdByName || 'Unknown clinician'}</span>{h.location && <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{h.location}</span>}</div>
                                        <textarea value={actions[h.id] || ''} onChange={e => setActions(c => ({ ...c, [h.id]: e.target.value }))} rows={2} placeholder="Next action..." className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                        <textarea value={flags[h.id] || ''} onChange={e => setFlags(c => ({ ...c, [h.id]: e.target.value }))} rows={2} placeholder="Watch flags..." className="mt-3 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <select value={h.status} onChange={e => update(h, e.target.value, h.priority)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['OPEN', 'IN_PROGRESS', 'CLOSED'].map(v => <option key={v}>{v}</option>)}</select>
                                        <select value={h.priority} onChange={e => update(h, h.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(v => <option key={v}>{v}</option>)}</select>
                                        <Button onClick={() => update(h)} isLoading={updatingId === h.id} className="w-full">Save Handoff</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default HandoffMonitor;
