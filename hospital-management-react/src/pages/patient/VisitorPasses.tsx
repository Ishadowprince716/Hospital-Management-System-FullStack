import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BadgeCheck, Clock3, IdCard, Loader2, QrCode, Send, ShieldAlert, UserRoundCheck, Users } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';

interface VisitorPass {
    id: number;
    visitorName: string;
    visitorPhone: string;
    relationship?: string;
    visitDate: string;
    timeWindow?: string;
    purpose?: string;
    status: string;
    riskLevel: string;
    passCode?: string;
    frontDeskNote?: string;
}

const statusTone: Record<string, string> = {
    REQUESTED: 'border-blue-100 bg-blue-50 text-blue-700',
    APPROVED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    CHECKED_IN: 'border-purple-100 bg-purple-50 text-purple-700',
    CHECKED_OUT: 'border-slate-100 bg-slate-50 text-slate-700',
    DENIED: 'border-red-100 bg-red-50 text-red-700',
};

const VisitorPasses: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [items, setItems] = useState<VisitorPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        visitorName: '',
        visitorPhone: '',
        relationship: '',
        visitDate: '',
        timeWindow: 'ANYTIME',
        purpose: '',
    });

    const fetchItems = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/visitor-passes/patient/${user.id}`);
            setItems(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load visitor passes.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [user?.id]);

    const stats = useMemo(() => ({
        requested: items.filter(item => item.status === 'REQUESTED').length,
        approved: items.filter(item => item.status === 'APPROVED').length,
        checkedIn: items.filter(item => item.status === 'CHECKED_IN').length,
    }), [items]);

    const submit = async () => {
        if (!user?.id || !form.visitorName.trim() || !form.visitorPhone.trim() || !form.visitDate) {
            setMessage('Visitor name, phone, and visit date are required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/visitor-passes', {
                patientId: user.id,
                ...form,
                riskLevel: 'STANDARD',
            });
            setForm({ visitorName: '', visitorPhone: '', relationship: '', visitDate: '', timeWindow: 'ANYTIME', purpose: '' });
            await fetchItems();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit visitor pass request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Visitor Passes" description="Request visitor access, view approvals, and share pass codes with approved visitors." icon={IdCard} tone="teal" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Requested" value={stats.requested} icon={Clock3} tone="blue" helper="Awaiting review" />
                <PatientStatCard label="Approved" value={stats.approved} icon={BadgeCheck} tone="emerald" helper="Pass ready" />
                <PatientStatCard label="Checked In" value={stats.checkedIn} icon={UserRoundCheck} tone="purple" helper="Currently visiting" />
            </div>

            {message && <PatientAlert icon={IdCard} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">Request Visitor Pass</h2>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.visitorName} onChange={e => setForm(c => ({ ...c, visitorName: e.target.value }))} placeholder="Visitor name" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.visitorPhone} onChange={e => setForm(c => ({ ...c, visitorPhone: e.target.value }))} placeholder="Visitor phone" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input value={form.relationship} onChange={e => setForm(c => ({ ...c, relationship: e.target.value }))} placeholder="Relationship" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="date" value={form.visitDate} onChange={e => setForm(c => ({ ...c, visitDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                        </div>
                        <select value={form.timeWindow} onChange={e => setForm(c => ({ ...c, timeWindow: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>ANYTIME</option><option>MORNING</option><option>AFTERNOON</option><option>EVENING</option></select>
                        <textarea value={form.purpose} onChange={e => setForm(c => ({ ...c, purpose: e.target.value }))} rows={4} placeholder="Purpose of visit or special access notes..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Submit Pass Request</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Visitor Passes</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
                    ) : items.length === 0 ? (
                        <PatientEmptyState icon={Users} title="No visitor passes" description="Visitor pass requests and approvals will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {items.map(item => (
                                <div key={item.id} className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[var(--text-color)]">{item.visitorName}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[item.status] || statusTone.REQUESTED}`}>{item.status.replace('_', ' ')}</span>
                                        {item.riskLevel === 'RESTRICTED' && <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-xs font-bold text-red-700"><ShieldAlert className="h-3.5 w-3.5" /> RESTRICTED</span>}
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">{item.relationship || 'Visitor'} • {item.visitDate} • {item.timeWindow || 'ANYTIME'}</p>
                                    {item.passCode && <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><QrCode className="h-4 w-4" /> {item.passCode}</p>}
                                    {item.frontDeskNote && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800">{item.frontDeskNote}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default VisitorPasses;
