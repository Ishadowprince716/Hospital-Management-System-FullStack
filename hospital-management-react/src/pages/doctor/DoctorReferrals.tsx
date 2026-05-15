import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRightLeft, CheckCircle2, Loader2, Plus, RefreshCw, Timer, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Patient { id: number; fullName?: string; username?: string; }
interface Referral {
    id: number; patientName?: string; specialty: string; priority: string; status: string; reason: string;
    preferredDate?: string; coordinatorNote?: string;
}

const tone: Record<string, string> = {
    ROUTINE: 'bg-blue-50 text-blue-700 border-blue-100',
    URGENT: 'bg-red-50 text-red-700 border-red-100',
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-100',
    SCHEDULED: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const DoctorReferrals: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({ patientId: '', specialty: 'Cardiology', priority: 'ROUTINE', preferredDate: '', reason: '', notes: '' });

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [patientsRes, referralsRes] = await Promise.allSettled([
                api.get('/patients?size=100'),
                api.get(`/referrals/doctor/${user.id}`),
            ]);
            if (patientsRes.status === 'fulfilled') {
                const raw = patientsRes.value.data?.data?.content || patientsRes.value.data?.data || [];
                setPatients(Array.isArray(raw) ? raw : []);
            }
            if (referralsRes.status === 'fulfilled') setReferrals(Array.isArray(referralsRes.value.data?.data) ? referralsRes.value.data.data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user?.id]);

    const stats = useMemo(() => ({
        requested: referrals.filter(r => r.status === 'REQUESTED').length,
        scheduled: referrals.filter(r => r.status === 'SCHEDULED').length,
        urgent: referrals.filter(r => r.priority === 'URGENT').length,
        completed: referrals.filter(r => r.status === 'COMPLETED').length,
    }), [referrals]);

    const createReferral = async () => {
        if (!user?.id || !form.patientId || !form.reason.trim()) {
            setMessage('Select a patient and enter referral reason.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/referrals', { ...form, patientId: Number(form.patientId), referringDoctorId: user.id });
            setForm({ patientId: '', specialty: 'Cardiology', priority: 'ROUTINE', preferredDate: '', reason: '', notes: '' });
            await fetchData();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to create referral.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]"><ArrowRightLeft className="h-6 w-6 text-indigo-600" /> Specialist Referrals</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Create referrals and track coordinator scheduling.</p></div>
                <Button onClick={fetchData} variant="outline" className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[[Timer, 'Requested', stats.requested], [Timer, 'Scheduled', stats.scheduled], [Zap, 'Urgent', stats.urgent], [CheckCircle2, 'Completed', stats.completed]].map(([Icon, label, value]) => { const I = Icon as typeof Timer; return <div key={label as string} className="stat-card"><I className="mb-2 h-5 w-5 text-indigo-600" /><p className="text-2xl font-bold text-[var(--text-color)]">{value as number}</p><p className="text-sm text-[var(--text-muted)]">{label as string}</p></div>; })}
            </div>
            {message && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700">{message}</div>}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card><CardContent className="p-5"><h2 className="text-base font-bold text-[var(--text-color)]">New Referral</h2><div className="mt-4 space-y-3">
                    <select value={form.patientId} onChange={e => setForm(c => ({ ...c, patientId: e.target.value }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName || p.username || `Patient #${p.id}`}</option>)}</select>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><select value={form.specialty} onChange={e => setForm(c => ({ ...c, specialty: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">{['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'ENT', 'Psychiatry', 'Physiotherapy'].map(s => <option key={s}>{s}</option>)}</select><select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>ROUTINE</option><option>URGENT</option></select><input type="date" value={form.preferredDate} onChange={e => setForm(c => ({ ...c, preferredDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" /></div>
                    <textarea value={form.reason} onChange={e => setForm(c => ({ ...c, reason: e.target.value }))} rows={4} placeholder="Referral reason and clinical context..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                    <textarea value={form.notes} onChange={e => setForm(c => ({ ...c, notes: e.target.value }))} rows={2} placeholder="Notes for coordinator..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                    <Button onClick={createReferral} isLoading={saving} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" /> Create Referral</Button>
                </div></CardContent></Card>
                <Card><CardContent className="p-0"><div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Referrals</h2></div>{loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div> : <div className="divide-y divide-[var(--border-color)]">{referrals.map(r => <div key={r.id} className="p-5"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-[var(--text-color)]">{r.patientName}</h3><span className={`rounded-full border px-2 py-1 text-xs font-bold ${tone[r.priority]}`}>{r.priority}</span><span className={`rounded-full border px-2 py-1 text-xs font-bold ${tone[r.status]}`}>{r.status}</span></div><p className="mt-2 text-sm text-[var(--text-muted)]">{r.specialty}: {r.reason}</p>{r.coordinatorNote && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm font-medium text-indigo-800">{r.coordinatorNote}</p>}</div>)}</div>}</CardContent></Card>
            </div>
        </div>
    );
};

export default DoctorReferrals;
