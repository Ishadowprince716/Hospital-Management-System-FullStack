import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Loader2, RefreshCw, Search, Timer, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Referral {
    id: number; patientName?: string; referringDoctorName?: string; specialty: string; priority: string; status: string; reason: string;
    preferredDate?: string; coordinatorNote?: string;
}

const badge: Record<string, string> = {
    ROUTINE: 'bg-blue-50 text-blue-700 border-blue-100',
    URGENT: 'bg-red-50 text-red-700 border-red-100',
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-100',
    SCHEDULED: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-slate-50 text-slate-700 border-slate-100',
};

const ReferralDesk: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchReferrals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/referrals');
            const rows = Array.isArray(res.data?.data) ? res.data.data as Referral[] : [];
            setReferrals(rows);
            setNotes(Object.fromEntries(rows.map(r => [r.id, r.coordinatorNote || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load referrals.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReferrals(); }, []);

    const stats = useMemo(() => ({
        requested: referrals.filter(r => r.status === 'REQUESTED').length,
        scheduled: referrals.filter(r => r.status === 'SCHEDULED').length,
        urgent: referrals.filter(r => r.priority === 'URGENT').length,
        completed: referrals.filter(r => r.status === 'COMPLETED').length,
    }), [referrals]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return referrals.filter(r => {
            const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && !['COMPLETED', 'CANCELLED'].includes(r.status)) || r.status === filter || r.priority === filter;
            const matchesSearch = !term || (r.patientName || '').toLowerCase().includes(term) || (r.referringDoctorName || '').toLowerCase().includes(term) || r.specialty.toLowerCase().includes(term) || r.reason.toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, referrals, search]);

    const update = async (referral: Referral, status = referral.status, priority = referral.priority) => {
        setUpdatingId(referral.id);
        setError(null);
        try {
            const res = await api.patch(`/referrals/${referral.id}`, { ...referral, status, priority, coordinatorNote: notes[referral.id] || '' });
            const updated = res.data?.data as Referral;
            setReferrals(current => current.map(r => r.id === referral.id ? updated : r));
            setNotes(current => ({ ...current, [referral.id]: updated.coordinatorNote || '' }));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update referral.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ArrowRightLeft className="h-6 w-6 text-indigo-600" /> Referral Desk</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Coordinate specialist referrals, scheduling, and patient instructions.</p></div><Button onClick={fetchReferrals} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[Timer, 'Requested', stats.requested], [Timer, 'Scheduled', stats.scheduled], [Zap, 'Urgent', stats.urgent], [CheckCircle2, 'Completed', stats.completed]].map(([Icon, label, value]) => { const I = Icon as typeof Timer; return <div key={label as string} className="stat-card"><I className="mb-2 h-5 w-5 text-indigo-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>; })}</div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, doctor, specialty..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" /></div><div className="flex flex-wrap gap-2">{['ACTIVE', 'ALL', 'REQUESTED', 'SCHEDULED', 'COMPLETED', 'URGENT'].map(v => <button key={v} onClick={() => setFilter(v)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === v ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-indigo-300'}`}>{v}</button>)}</div></div>
            <Card><CardContent className="p-0">{loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : filtered.length === 0 ? <div className="py-16 text-center text-sm text-[var(--text-muted)]">No referrals found.</div> : <div className="divide-y divide-[var(--border-color)]">{filtered.map(r => <div key={r.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-bold text-[var(--text-color)]">{r.patientName}</h2><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[r.priority]}`}>{r.priority}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[r.status]}`}>{r.status}</span></div><p className="mt-2 text-sm text-[var(--text-muted)]">{r.specialty}: {r.reason}</p><p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">Referring doctor: {r.referringDoctorName || '—'}</p><textarea value={notes[r.id] || ''} onChange={e => setNotes(c => ({ ...c, [r.id]: e.target.value }))} rows={3} placeholder="Coordinator note for patient and doctor..." className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" /></div><div className="space-y-3"><select value={r.status} onChange={e => update(r, e.target.value, r.priority)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(v => <option key={v}>{v}</option>)}</select><select value={r.priority} onChange={e => update(r, r.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>ROUTINE</option><option>URGENT</option></select><Button onClick={() => update(r)} isLoading={updatingId === r.id} className="w-full bg-indigo-600 hover:bg-indigo-700">Save Referral</Button></div></div>)}</div>}</CardContent></Card>
        </div>
    );
};

export default ReferralDesk;
