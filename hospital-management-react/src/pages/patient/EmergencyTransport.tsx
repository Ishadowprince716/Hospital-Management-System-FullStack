import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Ambulance, Loader2, MapPin, Phone, Send, Siren, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface TransportRequest {
    id: number;
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

const statusTone: Record<string, string> = {
    REQUESTED: 'border-blue-100 bg-blue-50 text-blue-700',
    TRIAGED: 'border-amber-100 bg-amber-50 text-amber-700',
    DISPATCHED: 'border-purple-100 bg-purple-50 text-purple-700',
    ARRIVED: 'border-teal-100 bg-teal-50 text-teal-700',
    COMPLETED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-slate-100 bg-slate-50 text-slate-700',
};

const EmergencyTransport: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<TransportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        pickupLocation: '',
        destination: 'Hospital emergency entrance',
        contactPhone: '',
        transportType: 'AMBULANCE',
        severity: 'MODERATE',
        symptoms: '',
    });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/emergency-transport/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load transport requests.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        active: items.filter(item => !['COMPLETED', 'CANCELLED'].includes(item.status)).length,
        dispatched: items.filter(item => item.status === 'DISPATCHED').length,
        critical: items.filter(item => item.severity === 'CRITICAL').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.pickupLocation.trim() || !form.contactPhone.trim()) {
            setMessage('Pickup location and contact phone are required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/emergency-transport', {
                patientId: user.id,
                ...form,
            });
            setForm({ pickupLocation: '', destination: 'Hospital emergency entrance', contactPhone: '', transportType: 'AMBULANCE', severity: 'MODERATE', symptoms: '' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit transport request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Emergency Transport" description="Request ambulance or assisted transport and follow dispatcher updates in real time." icon={Ambulance} tone="rose" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Active" value={stats.active} icon={Siren} tone="rose" helper="Open transport cases" />
                <PatientStatCard label="Dispatched" value={stats.dispatched} icon={Ambulance} tone="purple" helper="Vehicle assigned" />
                <PatientStatCard label="Critical" value={stats.critical} icon={Zap} tone="amber" helper="High severity" />
            </div>

            <PatientAlert icon={Phone} tone="rose">For life-threatening symptoms, call your local emergency number immediately while submitting this request.</PatientAlert>
            {message && <PatientAlert icon={Ambulance} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">Request Transport</h2>
                    <div className="mt-4 space-y-3">
                        <textarea value={form.pickupLocation} onChange={e => setForm(c => ({ ...c, pickupLocation: e.target.value }))} rows={3} placeholder="Pickup location with landmark..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.destination} onChange={e => setForm(c => ({ ...c, destination: e.target.value }))} placeholder="Destination" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.contactPhone} onChange={e => setForm(c => ({ ...c, contactPhone: e.target.value }))} placeholder="Contact phone" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <select value={form.transportType} onChange={e => setForm(c => ({ ...c, transportType: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>AMBULANCE</option><option>WHEELCHAIR_VAN</option><option>ASSISTED_CAR</option></select>
                            <select value={form.severity} onChange={e => setForm(c => ({ ...c, severity: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>LOW</option><option>MODERATE</option><option>HIGH</option><option>CRITICAL</option></select>
                        </div>
                        <textarea value={form.symptoms} onChange={e => setForm(c => ({ ...c, symptoms: e.target.value }))} rows={4} placeholder="Symptoms, mobility needs, attendants, oxygen support, or other context..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2 bg-rose-600 hover:bg-rose-700"><Send className="h-4 w-4" /> Request Transport</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Transport Requests</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></div>
                    ) : items.length === 0 ? (
                        <PatientEmptyState icon={Ambulance} title="No transport requests" description="Emergency transport requests and dispatcher updates will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {items.map(item => (
                                <div key={item.id} className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[var(--text-color)]">{item.transportType.replace('_', ' ')}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[item.status] || statusTone.REQUESTED}`}>{item.status.replace('_', ' ')}</span>
                                        <span className="rounded-full border border-rose-100 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{item.severity}</span>
                                    </div>
                                    <p className="mt-2 flex items-start gap-2 text-sm text-[var(--text-muted)]"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {item.pickupLocation}</p>
                                    {(item.vehicleNumber || item.crewName || item.etaMinutes) && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800">{[item.vehicleNumber, item.crewName, item.etaMinutes ? `ETA ${item.etaMinutes} min` : ''].filter(Boolean).join(' - ')}</p>}
                                    {item.dispatcherNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.dispatcherNote}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default EmergencyTransport;
