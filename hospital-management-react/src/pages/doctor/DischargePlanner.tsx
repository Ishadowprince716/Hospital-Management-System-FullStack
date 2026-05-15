import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ClipboardCheck, Loader2, Plus, RefreshCw, Truck, WalletCards } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Patient { id: number; fullName?: string; username?: string; }
interface Plan {
    id: number; patientName?: string; status: string; plannedDischargeDate?: string; diagnosis?: string;
    medicationInstructions?: string; careInstructions?: string; followUpPlan?: string; redFlags?: string;
    transportRequired?: boolean; billingCleared?: boolean;
}

const badge: Record<string, string> = {
    DRAFT: 'bg-slate-50 text-slate-700 border-slate-100',
    READY: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-100',
};

const DischargePlanner: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        patientId: '', plannedDischargeDate: '', status: 'DRAFT', diagnosis: '',
        medicationInstructions: '', careInstructions: '', followUpPlan: '', redFlags: '',
        transportRequired: false, billingCleared: false,
    });

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [patientsRes, plansRes] = await Promise.allSettled([
                api.get('/patients?size=100'),
                api.get(`/discharge-plans/doctor/${user.id}`),
            ]);
            if (patientsRes.status === 'fulfilled') {
                const raw = patientsRes.value.data?.data?.content || patientsRes.value.data?.data || [];
                setPatients(Array.isArray(raw) ? raw : []);
            }
            if (plansRes.status === 'fulfilled') setPlans(Array.isArray(plansRes.value.data?.data) ? plansRes.value.data.data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user?.id]);

    const stats = useMemo(() => ({
        draft: plans.filter(p => p.status === 'DRAFT').length,
        ready: plans.filter(p => p.status === 'READY').length,
        completed: plans.filter(p => p.status === 'COMPLETED').length,
        blocked: plans.filter(p => !p.billingCleared).length,
    }), [plans]);

    const createPlan = async () => {
        if (!user?.id || !form.patientId) {
            setMessage('Select a patient before creating a discharge plan.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/discharge-plans', { ...form, doctorId: user.id, patientId: Number(form.patientId) });
            setForm({ patientId: '', plannedDischargeDate: '', status: 'DRAFT', diagnosis: '', medicationInstructions: '', careInstructions: '', followUpPlan: '', redFlags: '', transportRequired: false, billingCleared: false });
            await fetchData();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to save discharge plan.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ClipboardCheck className="h-6 w-6 text-emerald-600" /> Discharge Planner</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Prepare patient discharge instructions, follow-up plans, and readiness checks.</p></div>
                <Button onClick={fetchData} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[['Draft', stats.draft], ['Ready', stats.ready], ['Completed', stats.completed], ['Billing Blocked', stats.blocked]].map(([label, value]) => <div key={label} className="stat-card"><p className="text-2xl font-bold text-[var(--text-color)]">{value}</p><p className="text-sm text-[var(--text-muted)]">{label}</p></div>)}
            </div>
            {message && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700">{message}</div>}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card><CardContent className="p-5">
                    <h2 className="text-base font-bold text-[var(--text-color)]">New Discharge Plan</h2>
                    <div className="mt-4 space-y-3">
                        <select value={form.patientId} onChange={e => setForm(c => ({ ...c, patientId: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                            <option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName || p.username || `Patient #${p.id}`}</option>)}
                        </select>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input type="date" value={form.plannedDischargeDate} onChange={e => setForm(c => ({ ...c, plannedDischargeDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <select value={form.status} onChange={e => setForm(c => ({ ...c, status: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['DRAFT', 'READY', 'COMPLETED'].map(s => <option key={s}>{s}</option>)}</select>
                        </div>
                        {['diagnosis', 'medicationInstructions', 'careInstructions', 'followUpPlan', 'redFlags'].map(key => <textarea key={key} value={form[key as keyof typeof form] as string} onChange={e => setForm(c => ({ ...c, [key]: e.target.value }))} rows={2} placeholder={key.replace(/([A-Z])/g, ' $1')} className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />)}
                        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--text-color)]">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.transportRequired} onChange={e => setForm(c => ({ ...c, transportRequired: e.target.checked }))} /> Transport required</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.billingCleared} onChange={e => setForm(c => ({ ...c, billingCleared: e.target.checked }))} /> Billing cleared</label>
                        </div>
                        <Button onClick={createPlan} isLoading={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> Save Plan</Button>
                    </div>
                </CardContent></Card>
                <Card><CardContent className="p-0">
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Plans</h2></div>
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div> : <div className="divide-y divide-[var(--border-color)]">{plans.map(plan => <div key={plan.id} className="p-5"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-[var(--text-color)]">{plan.patientName}</h3><span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge[plan.status]}`}>{plan.status}</span>{plan.transportRequired && <Truck className="h-4 w-4 text-amber-600" />}{!plan.billingCleared && <WalletCards className="h-4 w-4 text-red-600" />}</div><p className="mt-2 text-sm text-[var(--text-muted)]">{plan.diagnosis || 'No diagnosis recorded.'}</p>{plan.redFlags && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{plan.redFlags}</p>}</div>)}</div>}
                </CardContent></Card>
            </div>
        </div>
    );
};

export default DischargePlanner;
