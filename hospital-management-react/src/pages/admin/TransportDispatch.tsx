import React, { useEffect, useMemo, useState } from 'react';
import { Ambulance, CheckCircle2, Clock3, Loader2, MapPin, Phone, RefreshCw, Search, Siren, UserCheck, XCircle, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface TransportRequest {
    id: number;
    patientName?: string;
    pickupLocation: string;
    destination?: string;
    contactPhone: string;
    transportType: string;
    severity: string;
    status: string;
    symptoms?: string;
    vehicleNumber?: string;
    crewName?: string;
    etaMinutes?: number;
    dispatcherNote?: string;
}

const badge: Record<string, string> = {
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-100',
    TRIAGED: 'bg-amber-50 text-amber-700 border-amber-100',
    DISPATCHED: 'bg-purple-50 text-purple-700 border-purple-100',
    ARRIVED: 'bg-teal-50 text-teal-700 border-teal-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-slate-50 text-slate-700 border-slate-100',
    LOW: 'bg-slate-50 text-slate-700 border-slate-100',
    MODERATE: 'bg-blue-50 text-blue-700 border-blue-100',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-100',
    CRITICAL: 'bg-red-50 text-red-700 border-red-100',
};

const TransportDispatch: React.FC = () => {
    const [items, setItems] = useState<TransportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');
    const [vehicleNumbers, setVehicleNumbers] = useState<Record<number, string>>({});
    const [crewNames, setCrewNames] = useState<Record<number, string>>({});
    const [etas, setEtas] = useState<Record<number, string>>({});
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/emergency-transport');
            const rows = Array.isArray(res.data?.data) ? res.data.data as TransportRequest[] : [];
            setItems(rows);
            setVehicleNumbers(Object.fromEntries(rows.map(row => [row.id, row.vehicleNumber || ''])));
            setCrewNames(Object.fromEntries(rows.map(row => [row.id, row.crewName || ''])));
            setEtas(Object.fromEntries(rows.map(row => [row.id, row.etaMinutes ? String(row.etaMinutes) : ''])));
            setNotes(Object.fromEntries(rows.map(row => [row.id, row.dispatcherNote || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load transport dispatch board.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const stats = useMemo(() => ({
        requested: items.filter(i => i.status === 'REQUESTED').length,
        dispatched: items.filter(i => i.status === 'DISPATCHED').length,
        completed: items.filter(i => i.status === 'COMPLETED').length,
        critical: items.filter(i => i.severity === 'CRITICAL').length,
    }), [items]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return items.filter(item => {
            const matchesFilter = filter === 'ALL'
                || (filter === 'ACTIVE' && !['COMPLETED', 'CANCELLED'].includes(item.status))
                || item.status === filter
                || item.severity === filter
                || item.transportType === filter;
            const matchesSearch = !term
                || (item.patientName || '').toLowerCase().includes(term)
                || item.pickupLocation.toLowerCase().includes(term)
                || (item.destination || '').toLowerCase().includes(term)
                || item.contactPhone.toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, items, search]);

    const update = async (item: TransportRequest, status = item.status, severity = item.severity) => {
        setUpdatingId(item.id);
        setError(null);
        try {
            const eta = etas[item.id] ? Number(etas[item.id]) : null;
            const res = await api.patch(`/emergency-transport/${item.id}`, {
                status,
                severity,
                vehicleNumber: vehicleNumbers[item.id] || '',
                crewName: crewNames[item.id] || '',
                etaMinutes: eta,
                dispatcherNote: notes[item.id] || '',
            });
            const updated = res.data?.data as TransportRequest;
            setItems(current => current.map(row => row.id === item.id ? updated : row));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update transport request.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><Ambulance className="h-6 w-6 text-rose-600" /> Transport Dispatch</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Triage emergency transport, assign vehicles, and keep patients updated.</p>
                </div>
                <Button onClick={fetchItems} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[[Clock3, 'Requested', stats.requested], [Siren, 'Dispatched', stats.dispatched], [CheckCircle2, 'Completed', stats.completed], [Zap, 'Critical', stats.critical]].map(([Icon, label, value]) => { const I = Icon as typeof Ambulance; return <div key={label as string} className="stat-card"><I className="mb-2 h-5 w-5 text-rose-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>; })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, location, phone..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ACTIVE', 'ALL', 'REQUESTED', 'TRIAGED', 'DISPATCHED', 'ARRIVED', 'COMPLETED', 'CRITICAL', 'AMBULANCE'].map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === value ? 'border-rose-600 bg-rose-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-rose-300'}`}>{value.replace('_', ' ')}</button>)}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[var(--text-muted)]">No transport requests found.</div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(item => (
                                <div key={item.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_280px]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[var(--text-color)]">{item.patientName}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.status]}`}>{item.status.replace('_', ' ')}</span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.severity]}`}>{item.severity}</span>
                                            <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">{item.transportType.replace('_', ' ')}</span>
                                        </div>
                                        <p className="mt-2 flex items-start gap-2 text-sm text-[var(--text-muted)]"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {item.pickupLocation}</p>
                                        <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]"><Phone className="h-3.5 w-3.5" /> {item.contactPhone} • Destination: {item.destination || 'Hospital emergency entrance'}</p>
                                        {item.symptoms && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.symptoms}</p>}
                                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                            <input value={vehicleNumbers[item.id] || ''} onChange={e => setVehicleNumbers(c => ({ ...c, [item.id]: e.target.value }))} placeholder="Vehicle number" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                                            <input value={crewNames[item.id] || ''} onChange={e => setCrewNames(c => ({ ...c, [item.id]: e.target.value }))} placeholder="Crew name" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                                            <input type="number" value={etas[item.id] || ''} onChange={e => setEtas(c => ({ ...c, [item.id]: e.target.value }))} placeholder="ETA minutes" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                                        </div>
                                        <textarea value={notes[item.id] || ''} onChange={e => setNotes(c => ({ ...c, [item.id]: e.target.value }))} rows={3} placeholder="Dispatcher note for patient..." className="mt-3 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <select value={item.status} onChange={e => update(item, e.target.value, item.severity)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['REQUESTED', 'TRIAGED', 'DISPATCHED', 'ARRIVED', 'COMPLETED', 'CANCELLED'].map(v => <option key={v}>{v}</option>)}</select>
                                        <select value={item.severity} onChange={e => update(item, item.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map(v => <option key={v}>{v}</option>)}</select>
                                        <Button onClick={() => update(item)} isLoading={updatingId === item.id} className="w-full">Save Dispatch</Button>
                                        <Button onClick={() => update(item, 'DISPATCHED', item.severity)} variant="outline" className="w-full gap-2"><UserCheck className="h-4 w-4" /> Dispatch</Button>
                                        <Button onClick={() => update(item, 'CANCELLED', item.severity)} variant="outline" className="w-full gap-2 text-red-600"><XCircle className="h-4 w-4" /> Cancel</Button>
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

export default TransportDispatch;
