import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search, ShieldAlert, Timer } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Incident {
    id: number;
    reporterName?: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    description: string;
    patientIdentifier?: string;
    location?: string;
    correctiveAction?: string;
    updatedAt?: string;
}

const badge: Record<string, string> = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-100',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-100',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-100',
    CRITICAL: 'bg-red-50 text-red-700 border-red-100',
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    REVIEWING: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const RiskCenter: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ACTIVE');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [actions, setActions] = useState<Record<number, string>>({});

    const fetchIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/safety-incidents');
            const rows = Array.isArray(res.data?.data) ? res.data.data as Incident[] : [];
            setIncidents(rows);
            setActions(Object.fromEntries(rows.map(row => [row.id, row.correctiveAction || ''])));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load safety incidents.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const stats = useMemo(() => ({
        open: incidents.filter(i => i.status === 'OPEN').length,
        reviewing: incidents.filter(i => i.status === 'REVIEWING').length,
        critical: incidents.filter(i => i.severity === 'CRITICAL').length,
        resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    }), [incidents]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return incidents.filter(item => {
            const matchesFilter = filter === 'ALL'
                || (filter === 'ACTIVE' && item.status !== 'RESOLVED')
                || item.status === filter
                || item.severity === filter;
            const matchesSearch = !term
                || item.title.toLowerCase().includes(term)
                || item.description.toLowerCase().includes(term)
                || item.category.toLowerCase().includes(term)
                || (item.reporterName || '').toLowerCase().includes(term);
            return matchesFilter && matchesSearch;
        });
    }, [filter, incidents, search]);

    const update = async (incident: Incident, status = incident.status, severity = incident.severity) => {
        setUpdatingId(incident.id);
        setError(null);
        try {
            const res = await api.patch(`/safety-incidents/${incident.id}`, {
                status,
                severity,
                correctiveAction: actions[incident.id] || '',
            });
            const updated = res.data?.data as Incident;
            setIncidents(current => current.map(item => item.id === incident.id ? updated : item));
            setActions(current => ({ ...current, [incident.id]: updated.correctiveAction || '' }));
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to update incident.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Risk Center
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Review safety incidents, severity, corrective actions, and closure status.</p>
                </div>
                <Button onClick={fetchIncidents} variant="outline" className="gap-2 self-start"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Reviewing', value: stats.reviewing, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Critical', value: stats.critical, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => {
                    const Icon = item.icon;
                    return <div key={item.label} className="stat-card"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}><Icon className={`h-5 w-5 ${item.color}`} /></div><p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p><p className="text-sm text-[var(--text-muted)]">{item.label}</p></div>;
                })}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incident, category, reporter..." className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] pl-9 pr-3 text-sm text-[var(--text-color)]" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ACTIVE', 'ALL', 'OPEN', 'REVIEWING', 'RESOLVED', 'CRITICAL', 'HIGH'].map(value => (
                        <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filter === value ? 'border-red-600 bg-red-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-red-300'}`}>{value}</button>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div> : filtered.length === 0 ? (
                        <div className="py-16 text-center"><ShieldAlert className="mx-auto mb-3 h-12 w-12 text-slate-300" /><p className="text-sm text-[var(--text-muted)]">No incidents found.</p></div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {filtered.map(item => (
                                <div key={item.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_260px]">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[var(--text-color)]">{item.title}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.severity]}`}>{item.severity}</span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge[item.status]}`}>{item.status}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{item.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]">
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{item.reporterName || 'Unknown reporter'}</span>
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{item.category}</span>
                                            {item.location && <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{item.location}</span>}
                                        </div>
                                        <textarea value={actions[item.id] || ''} onChange={e => setActions(c => ({ ...c, [item.id]: e.target.value }))} rows={3} placeholder="Corrective action, RCA note, or closure summary..." className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <select value={item.status} onChange={e => update(item, e.target.value, item.severity)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                                            {['OPEN', 'REVIEWING', 'RESOLVED'].map(v => <option key={v}>{v}</option>)}
                                        </select>
                                        <select value={item.severity} onChange={e => update(item, item.status, e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                                            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(v => <option key={v}>{v}</option>)}
                                        </select>
                                        <Button onClick={() => update(item)} isLoading={updatingId === item.id} className="w-full bg-red-600 hover:bg-red-700">Save Action</Button>
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

export default RiskCenter;
