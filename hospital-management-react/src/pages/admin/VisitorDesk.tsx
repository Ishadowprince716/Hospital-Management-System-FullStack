import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Clock3, IdCard, Loader2, QrCode, RefreshCw, Search, ShieldAlert, UserRoundCheck, Users, XCircle } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface VisitorPass {
    id: number;
    patientName?: string;
    visitorName: string;
    visitorPhone: string;
    relationship?: string;
    visitDate: string;
    timeWindow?: string;
    purpose?: string;
    status: string;
    riskLevel: string;
    passCode?: string;
    checkedInAt?: string;
    checkedOutAt?: string;
    frontDeskNote?: string;
}

const badge: Record<string, string> = {
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-100',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CHECKED_IN: 'bg-purple-50 text-purple-700 border-purple-100',
    CHECKED_OUT: 'bg-slate-50 text-slate-700 border-slate-100',
    DENIED: 'bg-red-50 text-red-700 border-red-100',
    STANDARD: 'bg-slate-50 text-slate-700 border-slate-100',
    RESTRICTED: 'bg-red-50 text-red-700 border-red-100',
};

const VisitorDesk: React.FC = () => {
    const [items, setItems] = useState<VisitorPass[]>([]);
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
            const res = await api.get('/visitor-passes');
            const rows = Array.isArray(res.data?.data) ? res.data.data as VisitorPass[] : [];
            setItems(rows);
            setNotes(Object.fromEntries(rows.map(row => [row.id, row.frontDeskNote || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load visitor desk.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const stats = useMemo(() => ({
        requested: items.filter(i => i.status === 'REQUESTED').length,
        approved: items.filter(i => i.status === 'APPROVED').length,
        checkedIn: items.filter(i => i.status === 'CHECKED_IN').length,
        restricted: items.filter(i => i.riskLevel === 'RESTRICTED').length,
    }), [items]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return items.filter(item => {
            const matchesFilter = filter === 'ALL'
                || (filter === 'ACTIVE' && !['CHECKED_OUT', 'DENIED'].includes(item.status))
                || item.status === filter
                || item.riskLevel === filter;
            const matchesSearch = !term
                || (item.patientName || '').toLowerCase().includes(term)
                || item.visitorName.toLowerCase().includes(term)
                || item.visitorPhone.toLowerCase().includes(term)
                || (item.passCode || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, items, search]);

    const update = async (item: VisitorPass, status = item.status, riskLevel = item.riskLevel) => {
        setUpdatingId(item.id);
        setError(null);
        try {
            const res = await api.patch(`/visitor-passes/${item.id}`, {
                status,
                riskLevel,
                frontDeskNote: notes[item.id] || '',
            });
            const updated = res.data?.data as VisitorPass;
            setItems(current => current.map(row => row.id === item.id ? updated : row));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update visitor pass.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><IdCard className="h-6 w-6 text-teal-600" /> Visitor Desk</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Approve visitor passes, manage access, and track check-in/check-out activity.</p>
                </div>
                <Button onClick={fetchItems} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[[Clock3, 'Requested', stats.requested], [BadgeCheck, 'Approved', stats.approved], [UserRoundCheck, 'Checked In', stats.checkedIn], [ShieldAlert, 'Restricted', stats.restricted]].map(([Icon, label, value]) => { const I = Icon as typeof IdCard; return <div key={label as string} className="stat-card"><I className="mb-2 h-5 w-5 text-teal-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>; })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitor, patient, phone, pass..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ACTIVE', 'ALL', 'REQUESTED', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'DENIED', 'RESTRICTED'].map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === value ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-teal-300'}`}>{value.replace('_', ' ')}</button>)}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[var(--text-muted)]">No visitor passes found.</div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(item => (
                                <div key={item.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[var(--text-color)]">{item.visitorName}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.status]}`}>{item.status.replace('_', ' ')}</span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.riskLevel]}`}>{item.riskLevel}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{item.patientName} • {item.relationship || 'Visitor'} • {item.visitorPhone}</p>
                                        <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">Visit: {item.visitDate} • {item.timeWindow || 'ANYTIME'}</p>
                                        {item.passCode && <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><QrCode className="h-4 w-4" /> {item.passCode}</p>}
                                        {item.purpose && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.purpose}</p>}
                                        <textarea value={notes[item.id] || ''} onChange={e => setNotes(c => ({ ...c, [item.id]: e.target.value }))} rows={3} placeholder="Front-desk note for patient..." className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <select value={item.status} onChange={e => update(item, e.target.value, item.riskLevel)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['REQUESTED', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'DENIED'].map(v => <option key={v}>{v}</option>)}</select>
                                        <select value={item.riskLevel} onChange={e => update(item, item.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>STANDARD</option><option>RESTRICTED</option></select>
                                        <Button onClick={() => update(item)} isLoading={updatingId === item.id} className="w-full">Save Pass</Button>
                                        <Button onClick={() => update(item, 'APPROVED', item.riskLevel)} variant="outline" className="w-full gap-2"><BadgeCheck className="h-4 w-4" /> Approve</Button>
                                        <Button onClick={() => update(item, 'CHECKED_IN', item.riskLevel)} variant="outline" className="w-full gap-2"><Users className="h-4 w-4" /> Check In</Button>
                                        <Button onClick={() => update(item, 'DENIED', item.riskLevel)} variant="outline" className="w-full gap-2 text-red-600"><XCircle className="h-4 w-4" /> Deny</Button>
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

export default VisitorDesk;
