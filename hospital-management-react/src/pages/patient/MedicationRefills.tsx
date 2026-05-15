import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Clock3, Loader2, PackageCheck, Pill, Send, Truck, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface RefillRequest {
    id: number;
    medicationName: string;
    dosage?: string;
    lastPrescriptionRef?: string;
    quantity?: string;
    preferredPickupDate?: string;
    deliveryOption: string;
    status: string;
    priority: string;
    notes?: string;
    pharmacistNote?: string;
    updatedAt?: string;
}

const statusTone: Record<string, string> = {
    REQUESTED: 'border-blue-100 bg-blue-50 text-blue-700',
    IN_REVIEW: 'border-amber-100 bg-amber-50 text-amber-700',
    READY: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    DISPENSED: 'border-slate-100 bg-slate-50 text-slate-700',
    DENIED: 'border-red-100 bg-red-50 text-red-700',
};

const MedicationRefills: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<RefillRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        medicationName: '',
        dosage: '',
        lastPrescriptionRef: '',
        quantity: '',
        preferredPickupDate: '',
        deliveryOption: 'PICKUP',
        priority: 'NORMAL',
        notes: '',
    });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/medication-refills/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load refill requests.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        active: items.filter(item => !['DISPENSED', 'DENIED'].includes(item.status)).length,
        ready: items.filter(item => item.status === 'READY').length,
        urgent: items.filter(item => item.priority === 'URGENT').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.medicationName.trim()) {
            setMessage('Medication name is required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/medication-refills', {
                patientId: user.id,
                ...form,
                preferredPickupDate: form.preferredPickupDate || null,
            });
            setForm({ medicationName: '', dosage: '', lastPrescriptionRef: '', quantity: '', preferredPickupDate: '', deliveryOption: 'PICKUP', priority: 'NORMAL', notes: '' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit refill request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Medication Refills" description="Request prescription refills, choose pickup or delivery, and track pharmacy status." icon={Pill} tone="emerald" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Active" value={stats.active} icon={Clock3} tone="blue" helper="In pharmacy workflow" />
                <PatientStatCard label="Ready" value={stats.ready} icon={PackageCheck} tone="emerald" helper="Available to collect" />
                <PatientStatCard label="Urgent" value={stats.urgent} icon={Zap} tone="rose" helper="Priority requests" />
            </div>

            {message && <PatientAlert icon={Pill} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">Request Refill</h2>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.medicationName} onChange={e => setForm(c => ({ ...c, medicationName: e.target.value }))} placeholder="Medication name" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.dosage} onChange={e => setForm(c => ({ ...c, dosage: e.target.value }))} placeholder="Dosage e.g. 500mg" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.quantity} onChange={e => setForm(c => ({ ...c, quantity: e.target.value }))} placeholder="Quantity / duration" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.lastPrescriptionRef} onChange={e => setForm(c => ({ ...c, lastPrescriptionRef: e.target.value }))} placeholder="Prescription ref" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="date" value={form.preferredPickupDate} onChange={e => setForm(c => ({ ...c, preferredPickupDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <select value={form.deliveryOption} onChange={e => setForm(c => ({ ...c, deliveryOption: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>PICKUP</option><option>DELIVERY</option></select>
                        </div>
                        <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                        <textarea value={form.notes} onChange={e => setForm(c => ({ ...c, notes: e.target.value }))} rows={4} placeholder="Symptoms, remaining doses, delivery address, or special handling..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Send Request</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Refill Requests</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
                    ) : items.length === 0 ? (
                        <PatientEmptyState icon={Pill} title="No refill requests" description="Your medication refill activity will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {items.map(item => (
                                <div key={item.id} className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[var(--text-color)]">{item.medicationName}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[item.status] || statusTone.REQUESTED}`}>{item.status.replace('_', ' ')}</span>
                                        <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">{item.priority}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">{[item.dosage, item.quantity, item.deliveryOption].filter(Boolean).join(' • ')}</p>
                                    {item.preferredPickupDate && <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">Preferred date: {item.preferredPickupDate}</p>}
                                    {item.pharmacistNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.pharmacistNote}</p>}
                                    {item.deliveryOption === 'DELIVERY' && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700"><Truck className="h-4 w-4" /> Delivery requested</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default MedicationRefills;
