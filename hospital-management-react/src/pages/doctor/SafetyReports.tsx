import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, ClipboardPlus, Loader2, Send, ShieldAlert, Timer } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Incident {
    id: number;
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

const badge = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-100',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-100',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-100',
    CRITICAL: 'bg-red-50 text-red-700 border-red-100',
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    REVIEWING: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const SafetyReports: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '',
        category: 'Medication',
        severity: 'MEDIUM',
        patientIdentifier: '',
        location: '',
        description: '',
    });

    const fetchIncidents = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/safety-incidents/reporter/${user.id}`);
            setIncidents(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load safety reports.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [user?.id]);

    const stats = useMemo(() => ({
        open: incidents.filter(item => item.status === 'OPEN').length,
        reviewing: incidents.filter(item => item.status === 'REVIEWING').length,
        high: incidents.filter(item => ['HIGH', 'CRITICAL'].includes(item.severity)).length,
        resolved: incidents.filter(item => item.status === 'RESOLVED').length,
    }), [incidents]);

    const submit = async () => {
        if (!user?.id || !form.title.trim() || !form.description.trim()) {
            setMessage('Title and description are required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/safety-incidents', { reportedById: user.id, ...form });
            setForm({ title: '', category: 'Medication', severity: 'MEDIUM', patientIdentifier: '', location: '', description: '' });
            setMessage('Safety incident reported for review.');
            await fetchIncidents();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit safety report.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                    Safety Reports
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Document medication, fall, equipment, infection-control, or workflow safety events for admin review.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-blue-600' },
                    { label: 'Reviewing', value: stats.reviewing, icon: Timer, color: 'text-amber-600' },
                    { label: 'High Risk', value: stats.high, icon: ShieldAlert, color: 'text-red-600' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
                ].map(item => {
                    const Icon = item.icon;
                    return <div key={item.label} className="stat-card"><Icon className={`mb-2 h-5 w-5 ${item.color}`} /><p className="text-2xl font-bold text-[var(--text-color)]">{item.value}</p><p className="text-sm text-[var(--text-muted)]">{item.label}</p></div>;
                })}
            </div>

            {message && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700">{message}</div>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card>
                    <CardContent className="p-5">
                        <h2 className="text-base font-bold text-[var(--text-color)]">Report Incident</h2>
                        <div className="mt-4 space-y-3">
                            <input value={form.title} onChange={e => setForm(c => ({ ...c, title: e.target.value }))} placeholder="Incident title" className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <select value={form.category} onChange={e => setForm(c => ({ ...c, category: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                                    {['Medication', 'Fall', 'Equipment', 'Infection Control', 'Documentation', 'Workflow', 'Other'].map(v => <option key={v}>{v}</option>)}
                                </select>
                                <select value={form.severity} onChange={e => setForm(c => ({ ...c, severity: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(v => <option key={v}>{v}</option>)}
                                </select>
                                <input value={form.patientIdentifier} onChange={e => setForm(c => ({ ...c, patientIdentifier: e.target.value }))} placeholder="Patient ID/name if relevant" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                                <input value={form.location} onChange={e => setForm(c => ({ ...c, location: e.target.value }))} placeholder="Location/ward" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            </div>
                            <textarea value={form.description} onChange={e => setForm(c => ({ ...c, description: e.target.value }))} rows={5} placeholder="Describe what happened, immediate actions taken, and known contributing factors." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                            <Button onClick={submit} isLoading={saving} className="gap-2 bg-red-600 hover:bg-red-700"><Send className="h-4 w-4" /> Submit Report</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="border-b border-[var(--border-color)] p-5">
                            <h2 className="text-base font-bold text-[var(--text-color)]">My Submitted Reports</h2>
                        </div>
                        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div> : incidents.length === 0 ? (
                            <div className="py-16 text-center"><ClipboardPlus className="mx-auto mb-3 h-12 w-12 text-slate-300" /><p className="text-sm text-[var(--text-muted)]">No safety reports submitted.</p></div>
                        ) : (
                            <div className="divide-y divide-[var(--border-color)]">
                                {incidents.map(item => (
                                    <div key={item.id} className="p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-[var(--text-color)]">{item.title}</h3>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge[item.severity as keyof typeof badge]}`}>{item.severity}</span>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge[item.status as keyof typeof badge]}`}>{item.status}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">{item.description}</p>
                                        {item.correctiveAction && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.correctiveAction}</p>}
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

export default SafetyReports;
