import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock3, Loader2, RefreshCw, Search, UserCheck, XCircle, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { formatDoctorName } from '../../utils/displayNames';

interface WaitlistEntry {
    id: number;
    patientName?: string;
    doctorName?: string;
    specialty?: string;
    currentAppointmentDate?: string;
    desiredStartDate: string;
    desiredEndDate?: string;
    timePreference?: string;
    priority: string;
    status: string;
    reason?: string;
    coordinatorNote?: string;
}

const badge: Record<string, string> = {
    WAITING: 'bg-blue-50 text-blue-700 border-blue-100',
    MATCHED: 'bg-amber-50 text-amber-700 border-amber-100',
    SCHEDULED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-slate-50 text-slate-700 border-slate-100',
    EXPIRED: 'bg-red-50 text-red-700 border-red-100',
    NORMAL: 'bg-slate-50 text-slate-700 border-slate-100',
    URGENT: 'bg-red-50 text-red-700 border-red-100',
};

const WaitlistBoard: React.FC = () => {
    const [items, setItems] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/appointment-waitlist');
            const rows = Array.isArray(res.data?.data) ? res.data.data as WaitlistEntry[] : [];
            setItems(rows);
            setNotes(Object.fromEntries(rows.map(row => [row.id, row.coordinatorNote || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load waitlist board.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const stats = useMemo(() => ({
        waiting: items.filter(i => i.status === 'WAITING').length,
        matched: items.filter(i => i.status === 'MATCHED').length,
        scheduled: items.filter(i => i.status === 'SCHEDULED').length,
        urgent: items.filter(i => i.priority === 'URGENT').length,
    }), [items]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return items.filter(item => {
            const matchesFilter = filter === 'ALL'
                || (filter === 'ACTIVE' && !['SCHEDULED', 'CANCELLED', 'EXPIRED'].includes(item.status))
                || item.status === filter
                || item.priority === filter;
            const matchesSearch = !term
                || (item.patientName || '').toLowerCase().includes(term)
                || (item.doctorName || '').toLowerCase().includes(term)
                || (item.specialty || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, items, search]);

    const update = async (item: WaitlistEntry, status = item.status, priority = item.priority) => {
        setUpdatingId(item.id);
        setError(null);
        try {
            const res = await api.patch(`/appointment-waitlist/${item.id}`, {
                status,
                priority,
                coordinatorNote: notes[item.id] || '',
            });
            const updated = res.data?.data as WaitlistEntry;
            setItems(current => current.map(row => row.id === item.id ? updated : row));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update waitlist request.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><CalendarClock className="h-6 w-6 text-blue-600" /> Waitlist Board</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Prioritize earlier appointment requests and coordinate matched slots.</p>
                </div>
                <Button onClick={fetchItems} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[[Clock3, 'Waiting', stats.waiting], [UserCheck, 'Matched', stats.matched], [CheckCircle2, 'Scheduled', stats.scheduled], [Zap, 'Urgent', stats.urgent]].map(([Icon, label, value]) => { const I = Icon as typeof CalendarClock; return <div key={label as string} className="stat-card"><I className="mb-2 h-5 w-5 text-blue-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>; })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor, specialty..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ACTIVE', 'ALL', 'WAITING', 'MATCHED', 'SCHEDULED', 'CANCELLED', 'EXPIRED', 'URGENT'].map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === value ? 'border-blue-600 bg-blue-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-blue-300'}`}>{value.replace('_', ' ')}</button>)}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[var(--text-muted)]">No waitlist requests found.</div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(item => (
                                <div key={item.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[var(--text-color)]">{item.patientName}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.status]}`}>{item.status.replace('_', ' ')}</span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.priority]}`}>{item.priority}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{item.specialty || 'General Medicine'} • {item.doctorName ? formatDoctorName(item.doctorName) : 'Any doctor'} • {item.timePreference || 'ANYTIME'}</p>
                                        <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">Desired: {item.desiredStartDate}{item.desiredEndDate ? ` to ${item.desiredEndDate}` : ''}{item.currentAppointmentDate ? ` • Current: ${item.currentAppointmentDate}` : ''}</p>
                                        {item.reason && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.reason}</p>}
                                        <textarea value={notes[item.id] || ''} onChange={e => setNotes(c => ({ ...c, [item.id]: e.target.value }))} rows={3} placeholder="Coordinator note for patient..." className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <select value={item.status} onChange={e => update(item, e.target.value, item.priority)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['WAITING', 'MATCHED', 'SCHEDULED', 'CANCELLED', 'EXPIRED'].map(v => <option key={v}>{v}</option>)}</select>
                                        <select value={item.priority} onChange={e => update(item, item.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                                        <Button onClick={() => update(item)} isLoading={updatingId === item.id} className="w-full">Save Request</Button>
                                        <Button onClick={() => update(item, 'MATCHED', item.priority)} variant="outline" className="w-full gap-2"><UserCheck className="h-4 w-4" /> Mark Matched</Button>
                                        <Button onClick={() => update(item, 'CANCELLED', item.priority)} variant="outline" className="w-full gap-2 text-red-600"><XCircle className="h-4 w-4" /> Cancel</Button>
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

export default WaitlistBoard;
