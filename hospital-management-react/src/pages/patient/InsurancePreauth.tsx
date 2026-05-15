import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, FileCheck2, Loader2, Send, ShieldCheck, WalletCards, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface Preauth {
    id: number;
    insuranceProvider: string;
    policyNumber?: string;
    treatment: string;
    estimatedAmount?: number;
    status: string;
    priority: string;
    notes?: string;
    adminNote?: string;
    requiredDocuments?: string;
    updatedAt?: string;
}

const InsurancePreauth: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<Preauth[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({ insuranceProvider: '', policyNumber: '', treatment: '', estimatedAmount: '', priority: 'NORMAL', notes: '' });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/insurance-preauth/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load insurance requests.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        submitted: items.filter(i => i.status === 'SUBMITTED').length,
        approved: items.filter(i => i.status === 'APPROVED').length,
        urgent: items.filter(i => i.priority === 'URGENT').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.insuranceProvider.trim() || !form.treatment.trim()) {
            setMessage('Insurance provider and treatment are required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/insurance-preauth', {
                patientId: user.id,
                ...form,
                estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : null,
            });
            setForm({ insuranceProvider: '', policyNumber: '', treatment: '', estimatedAmount: '', priority: 'NORMAL', notes: '' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit insurance request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Insurance Preauthorization" description="Submit treatment preauthorization requests and track payer review, required documents, and approval status." icon={ShieldCheck} tone="blue" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Submitted" value={stats.submitted} icon={WalletCards} tone="blue" helper="Under intake" />
                <PatientStatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="emerald" helper="Ready for billing" />
                <PatientStatCard label="Urgent" value={stats.urgent} icon={Zap} tone="rose" helper="Priority review" />
            </div>
            {message && <PatientAlert icon={ShieldCheck} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">New Request</h2>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.insuranceProvider} onChange={e => setForm(c => ({ ...c, insuranceProvider: e.target.value }))} placeholder="Insurance provider" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.policyNumber} onChange={e => setForm(c => ({ ...c, policyNumber: e.target.value }))} placeholder="Policy number" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.treatment} onChange={e => setForm(c => ({ ...c, treatment: e.target.value }))} placeholder="Treatment / procedure" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="number" value={form.estimatedAmount} onChange={e => setForm(c => ({ ...c, estimatedAmount: e.target.value }))} placeholder="Estimated amount" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                        </div>
                        <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                        <textarea value={form.notes} onChange={e => setForm(c => ({ ...c, notes: e.target.value }))} rows={4} placeholder="Clinical/billing context, planned date, or document notes..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Submit Request</Button>
                    </div>
                </div>
                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Requests</h2></div>
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : items.length === 0 ? <PatientEmptyState icon={FileCheck2} title="No insurance requests" description="Submitted preauthorization requests will appear here." /> : <div className="divide-y divide-[var(--border-color)]">{items.map(item => <div key={item.id} className="p-5"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-[var(--text-color)]">{item.treatment}</h3><span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{item.status}</span><span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">{item.priority}</span></div><p className="mt-2 text-sm text-[var(--text-muted)]">{item.insuranceProvider} {item.estimatedAmount ? `• ₹${Number(item.estimatedAmount).toLocaleString('en-IN')}` : ''}</p>{item.requiredDocuments && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-800">{item.requiredDocuments}</p>}{item.adminNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.adminNote}</p>}</div>)}</div>}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default InsurancePreauth;
