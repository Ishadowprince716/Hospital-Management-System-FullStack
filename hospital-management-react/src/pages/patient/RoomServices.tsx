import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bed, CheckCircle2, Clock3, Loader2, Send, Sparkles, Trash2, Wrench, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface HousekeepingRequest {
    id: number;
    roomNumber: string;
    requestType: string;
    priority: string;
    status: string;
    description?: string;
    assignedStaff?: string;
    completionNote?: string;
    completedAt?: string;
}

const statusTone: Record<string, string> = {
    REQUESTED: 'border-blue-100 bg-blue-50 text-blue-700',
    ASSIGNED: 'border-amber-100 bg-amber-50 text-amber-700',
    IN_PROGRESS: 'border-purple-100 bg-purple-50 text-purple-700',
    COMPLETED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-slate-100 bg-slate-50 text-slate-700',
};

const requestIcons: Record<string, typeof Sparkles> = {
    CLEANING: Sparkles,
    LINEN: Bed,
    WASTE_PICKUP: Trash2,
    MAINTENANCE: Wrench,
};

const RoomServices: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<HousekeepingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({ roomNumber: '', requestType: 'CLEANING', priority: 'NORMAL', description: '' });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/housekeeping/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load room service requests.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        active: items.filter(item => !['COMPLETED', 'CANCELLED'].includes(item.status)).length,
        assigned: items.filter(item => item.status === 'ASSIGNED').length,
        completed: items.filter(item => item.status === 'COMPLETED').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.roomNumber.trim()) {
            setMessage('Room or bed number is required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/housekeeping', {
                patientId: user.id,
                ...form,
            });
            setForm({ roomNumber: '', requestType: 'CLEANING', priority: 'NORMAL', description: '' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit room service request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Room Services" description="Request cleaning, linen, waste pickup, or maintenance support for your room." icon={Sparkles} tone="teal" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Active" value={stats.active} icon={Clock3} tone="blue" helper="Open requests" />
                <PatientStatCard label="Assigned" value={stats.assigned} icon={Sparkles} tone="amber" helper="Staff assigned" />
                <PatientStatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="emerald" helper="Resolved" />
            </div>

            {message && <PatientAlert icon={Sparkles} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">New Room Service Request</h2>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.roomNumber} onChange={e => setForm(c => ({ ...c, roomNumber: e.target.value }))} placeholder="Room / bed number" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <select value={form.requestType} onChange={e => setForm(c => ({ ...c, requestType: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>CLEANING</option><option>LINEN</option><option>WASTE_PICKUP</option><option>MAINTENANCE</option></select>
                        </div>
                        <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                        <textarea value={form.description} onChange={e => setForm(c => ({ ...c, description: e.target.value }))} rows={5} placeholder="Describe what is needed..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Submit Request</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Room Service Requests</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                    ) : items.length === 0 ? (
                        <PatientEmptyState icon={Sparkles} title="No room service requests" description="Housekeeping and room support updates will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {items.map(item => {
                                const Icon = requestIcons[item.requestType] || Sparkles;
                                return (
                                    <div key={item.id} className="p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Icon className="h-4 w-4 text-teal-600" />
                                            <h3 className="text-sm font-bold text-[var(--text-color)]">{item.requestType.replace('_', ' ')}</h3>
                                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[item.status] || statusTone.REQUESTED}`}>{item.status.replace('_', ' ')}</span>
                                            {item.priority === 'URGENT' && <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-xs font-bold text-red-700"><Zap className="h-3.5 w-3.5" /> URGENT</span>}
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-muted)]">Room {item.roomNumber}{item.assignedStaff ? ` - Assigned to ${item.assignedStaff}` : ''}</p>
                                        {item.description && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.description}</p>}
                                        {item.completionNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{item.completionNote}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default RoomServices;
