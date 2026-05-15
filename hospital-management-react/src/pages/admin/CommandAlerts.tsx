import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Flame,
    Loader2,
    Plus,
    RefreshCw,
    ShieldAlert,
    UserRoundCheck,
} from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface CommandAlert {
    id: number;
    title: string;
    description?: string;
    department: string;
    patientName?: string;
    patientIdentifier?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';
    ownerName?: string;
    slaMinutes?: number;
    recommendedAction?: string;
    resolutionNotes?: string;
    createdAt?: string;
}

interface Metrics {
    openAlerts?: number;
    criticalAlerts?: number;
    slaBreaches?: number;
    departments?: Record<string, number>;
}

const emptyForm = {
    title: '',
    description: '',
    department: 'EMERGENCY',
    patientName: '',
    patientIdentifier: '',
    severity: 'HIGH',
    ownerName: '',
    slaMinutes: 30,
    recommendedAction: '',
};

const unwrap = <T,>(payload: unknown, fallback: T): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const value = (payload as { data?: unknown }).data;
        return (value ?? fallback) as T;
    }
    return (payload ?? fallback) as T;
};

const severityStyles: Record<string, string> = {
    CRITICAL: 'border-red-200 bg-red-50 text-red-700',
    HIGH: 'border-amber-200 bg-amber-50 text-amber-700',
    MEDIUM: 'border-blue-200 bg-blue-50 text-blue-700',
    LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const statusStyles: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700',
    ACKNOWLEDGED: 'bg-blue-100 text-blue-700',
    ESCALATED: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
};

const CommandAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<CommandAlert[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'ALL' | CommandAlert['status']>('ALL');
    const [form, setForm] = useState(emptyForm);

    const fetchAlerts = async () => {
        setLoading(true);
        setError('');
        try {
            const [alertsResult, metricsResult] = await Promise.all([
                api.get('/command-alerts'),
                api.get('/command-alerts/metrics'),
            ]);
            setAlerts(unwrap<CommandAlert[]>(alertsResult.data, []));
            setMetrics(unwrap<Metrics>(metricsResult.data, {}));
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to load command alerts.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const filteredAlerts = useMemo(() => {
        if (filter === 'ALL') return alerts;
        return alerts.filter(alert => alert.status === filter);
    }, [alerts, filter]);

    const departmentLoad = Object.entries(metrics.departments || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const isBreached = (alert: CommandAlert) => {
        if (alert.status === 'RESOLVED' || !alert.createdAt || !alert.slaMinutes) return false;
        const ageMinutes = (Date.now() - new Date(alert.createdAt).getTime()) / 60000;
        return ageMinutes > alert.slaMinutes;
    };

    const createAlert = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.post('/command-alerts', form);
            setForm(emptyForm);
            await fetchAlerts();
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to create command alert.'));
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id: number, status: CommandAlert['status'], resolutionNotes?: string) => {
        setError('');
        try {
            await api.patch(`/command-alerts/${id}/status`, { status, resolutionNotes });
            await fetchAlerts();
        } catch (err) {
            setError(getApiErrorMessage(err, 'Unable to update command alert.'));
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Command Alerts
                    </h1>
                    <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                        Pro-grade incident command for patient flow, safety risks, SLA breaches, care delays, and operational escalation.
                    </p>
                </div>
                <Button onClick={fetchAlerts} variant="outline" className="gap-2 self-start">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Open Alerts', value: metrics.openAlerts ?? 0, icon: AlertTriangle, tone: 'bg-red-50 text-red-700' },
                    { label: 'Critical', value: metrics.criticalAlerts ?? 0, icon: Flame, tone: 'bg-amber-50 text-amber-700' },
                    { label: 'SLA Breaches', value: metrics.slaBreaches ?? 0, icon: Clock3, tone: 'bg-orange-50 text-orange-700' },
                    { label: 'Departments', value: Object.keys(metrics.departments || {}).length, icon: UserRoundCheck, tone: 'bg-teal-50 text-teal-700' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.tone}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-black text-[var(--text-color)]">{loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : item.value}</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                <Card>
                    <CardContent className="p-5">
                        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-color)]">
                            <Plus className="h-4 w-4 text-teal-600" />
                            Create command alert
                        </h2>
                        <form onSubmit={createAlert} className="mt-4 space-y-3">
                            <input className="w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="Alert title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            <textarea className="min-h-20 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="Situation summary" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <select className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                    {['EMERGENCY', 'ICU', 'OPD', 'RADIOLOGY', 'LAB', 'PHARMACY', 'BEDS', 'BILLING', 'TRANSPORT', 'SAFETY'].map(item => <option key={item}>{item}</option>)}
                                </select>
                                <select className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(item => <option key={item}>{item}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="Patient name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
                                <input className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="MRN / ID" value={form.patientIdentifier} onChange={e => setForm({ ...form, patientIdentifier: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-[1fr_110px] gap-3">
                                <input className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="Owner / team" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
                                <input className="rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" type="number" min={5} value={form.slaMinutes} onChange={e => setForm({ ...form, slaMinutes: Number(e.target.value) })} />
                            </div>
                            <textarea className="min-h-20 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm" placeholder="Recommended action" value={form.recommendedAction} onChange={e => setForm({ ...form, recommendedAction: e.target.value })} />
                            <Button type="submit" disabled={saving} className="w-full gap-2">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Create alert
                            </Button>
                        </form>

                        <div className="mt-5 rounded-lg border border-[var(--border-color)] bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Department load</p>
                            <div className="mt-3 space-y-2">
                                {departmentLoad.length === 0 ? (
                                    <p className="text-sm text-[var(--text-muted)]">No active department pressure yet.</p>
                                ) : departmentLoad.map(([department, count]) => (
                                    <div key={department}>
                                        <div className="flex justify-between text-xs font-bold text-[var(--text-color)]">
                                            <span>{department}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-white">
                                            <div className="h-2 rounded-full bg-teal-600" style={{ width: `${Math.min(100, count * 18)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-3 border-b border-[var(--border-color)] p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[var(--text-color)]">Live escalation board</h2>
                                <p className="text-sm text-[var(--text-muted)]">Prioritized by status, severity, and SLA risk.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(['ALL', 'OPEN', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED'] as const).map(item => (
                                    <button
                                        key={item}
                                        onClick={() => setFilter(item)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === item ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="p-8 text-sm text-[var(--text-muted)]">No command alerts match this view.</div>
                        ) : (
                            <div className="divide-y divide-[var(--border-color)]">
                                {filteredAlerts.map(alert => (
                                    <div key={alert.id} className="p-5">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${severityStyles[alert.severity] || severityStyles.MEDIUM}`}>
                                                        {alert.severity}
                                                    </span>
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusStyles[alert.status] || statusStyles.OPEN}`}>
                                                        {alert.status.replace('_', ' ')}
                                                    </span>
                                                    {isBreached(alert) && (
                                                        <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">SLA BREACH</span>
                                                    )}
                                                </div>
                                                <h3 className="mt-3 text-base font-black text-[var(--text-color)]">{alert.title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{alert.description || 'No summary recorded.'}</p>
                                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[var(--text-muted)]">
                                                    <span>Dept: {alert.department}</span>
                                                    <span>Owner: {alert.ownerName || 'Unassigned'}</span>
                                                    <span>SLA: {alert.slaMinutes || 30} min</span>
                                                    {alert.patientName && <span>Patient: {alert.patientName} {alert.patientIdentifier ? `(${alert.patientIdentifier})` : ''}</span>}
                                                </div>
                                                {alert.recommendedAction && (
                                                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                                                        {alert.recommendedAction}
                                                    </div>
                                                )}
                                            </div>
                                            {alert.status !== 'RESOLVED' && (
                                                <div className="flex shrink-0 flex-wrap gap-2">
                                                    <button onClick={() => updateStatus(alert.id, 'ACKNOWLEDGED')} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100">
                                                        Acknowledge
                                                    </button>
                                                    <button onClick={() => updateStatus(alert.id, 'ESCALATED')} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100">
                                                        Escalate
                                                    </button>
                                                    <button onClick={() => updateStatus(alert.id, 'RESOLVED', 'Resolved from command board')} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100">
                                                        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                                                        Resolve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CommandAlerts;
