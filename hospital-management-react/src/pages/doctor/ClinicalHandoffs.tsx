import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, ClipboardList, Loader2, Plus, RefreshCw, ShieldAlert, Timer } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Handoff {
    id: number;
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

const ClinicalHandoffs: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [handoffs, setHandoffs] = useState<Handoff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({ patientName: '', location: '', priority: 'MEDIUM', summary: '', nextAction: '', watchFlags: '' });

    const fetchHandoffs = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/clinical-handoffs/creator/${user.id}`);
            setHandoffs(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load handoffs.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHandoffs(); }, [user?.id]);

    const stats = useMemo(() => ({
        open: handoffs.filter(h => h.status === 'OPEN').length,
        progress: handoffs.filter(h => h.status === 'IN_PROGRESS').length,
        urgent: handoffs.filter(h => ['HIGH', 'CRITICAL'].includes(h.priority)).length,
        closed: handoffs.filter(h => h.status === 'CLOSED').length,
    }), [handoffs]);

    const createHandoff = async () => {
        if (!user?.id || !form.patientName.trim() || !form.summary.trim()) {
            setMessage('Patient name and summary are required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/clinical-handoffs', { createdById: user.id, ...form });
            setForm({ patientName: '', location: '', priority: 'MEDIUM', summary: '', nextAction: '', watchFlags: '' });
            await fetchHandoffs();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to create handoff.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ClipboardList className="h-6 w-6 text-teal-600" /> Clinical Handoffs</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Create shift handoff notes with watch flags and next actions.</p>
                </div>
                <Button onClick={fetchHandoffs} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Open', value: stats.open, icon: ClipboardList, color: 'text-blue-600' },
                    { label: 'In Progress', value: stats.progress, icon: Timer, color: 'text-amber-600' },
                    { label: 'Urgent', value: stats.urgent, icon: ShieldAlert, color: 'text-red-600' },
                    { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-600' },
                ].map(item => {
                    const Icon = item.icon;
                    return <div key={item.label} className="stat-card"><Icon className={`mb-2 h-5 w-5 ${item.color}`} /><p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p><p className="text-sm text-[var(--text-muted)]">{item.label}</p></div>;
                })}
            </div>

            {message && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700">{message}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                    <CardContent className="p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">New Handoff</h2>
                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input value={form.patientName} onChange={e => setForm(c => ({ ...c, patientName: e.target.value }))} placeholder="Patient name / identifier" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                                <input value={form.location} onChange={e => setForm(c => ({ ...c, location: e.target.value }))} placeholder="Ward / bed / location" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            </div>
                            <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(v => <option key={v}>{v}</option>)}
                            </select>
                            <textarea value={form.summary} onChange={e => setForm(c => ({ ...c, summary: e.target.value }))} rows={4} placeholder="Clinical summary for incoming team..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                            <textarea value={form.nextAction} onChange={e => setForm(c => ({ ...c, nextAction: e.target.value }))} rows={2} placeholder="Next action..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                            <textarea value={form.watchFlags} onChange={e => setForm(c => ({ ...c, watchFlags: e.target.value }))} rows={2} placeholder="Watch flags / escalation triggers..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                            <Button onClick={createHandoff} isLoading={saving} className="gap-2"><Plus className="h-4 w-4" /> Create Handoff</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Handoffs</h2></div>
                        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div> : handoffs.length === 0 ? (
                            <div className="py-16 text-center text-sm text-[var(--text-muted)]">No handoffs yet.</div>
                        ) : (
                            <div className="divide-y divide-[var(--border-color)]">
                                {handoffs.map(h => (
                                    <div key={h.id} className="p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-[var(--text-color)]">{h.patientName}</h3>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge[h.priority]}`}>{h.priority}</span>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge[h.status]}`}>{h.status.replace('_', ' ')}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{h.summary}</p>
                                        {h.nextAction && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800">{h.nextAction}</p>}
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

export default ClinicalHandoffs;
