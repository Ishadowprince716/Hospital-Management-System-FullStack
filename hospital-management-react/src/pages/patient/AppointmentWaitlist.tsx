import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarClock, CheckCircle2, Clock3, Loader2, Send, Stethoscope, Zap } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { PatientAlert, PatientEmptyState, PatientPageFrame, PatientPageHeader, PatientStatCard, patientCardClass } from '../../components/patient/PatientPanel';
import { formatDoctorName } from '../../utils/displayNames';

interface Doctor {
    id: number;
    fullName: string;
    specialization?: string;
}

interface WaitlistEntry {
    id: number;
    doctorName?: string;
    specialty?: string;
    currentAppointmentDate?: string;
    desiredStartDate: string;
    desiredEndDate?: string;
    timePreference?: string;
    priority: string;
    status: string;
    reason?: string;
    coordinatorNote?: string;
}

const statusTone: Record<string, string> = {
    WAITING: 'border-blue-100 bg-blue-50 text-blue-700',
    MATCHED: 'border-amber-100 bg-amber-50 text-amber-700',
    SCHEDULED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-slate-100 bg-slate-50 text-slate-700',
    EXPIRED: 'border-red-100 bg-red-50 text-red-700',
};

const AppointmentWaitlist: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        doctorId: '',
        specialty: '',
        currentAppointmentDate: '',
        desiredStartDate: '',
        desiredEndDate: '',
        timePreference: 'ANYTIME',
        priority: 'NORMAL',
        reason: '',
    });

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [waitlistRes, doctorsRes] = await Promise.all([
                api.get(`/appointment-waitlist/patient/${user.id}`),
                api.get('/doctors?size=50'),
            ]);
            setEntries(Array.isArray(waitlistRes.data?.data) ? waitlistRes.data.data : []);
            const doctorList = doctorsRes.data?.data?.content || doctorsRes.data?.data || [];
            setDoctors(Array.isArray(doctorList) ? doctorList : []);
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to load waitlist data.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user?.id]);

    const stats = useMemo(() => ({
        waiting: entries.filter(entry => entry.status === 'WAITING').length,
        matched: entries.filter(entry => entry.status === 'MATCHED').length,
        urgent: entries.filter(entry => entry.priority === 'URGENT').length,
    }), [entries]);

    const selectedDoctor = doctors.find(doctor => String(doctor.id) === form.doctorId);

    const submit = async () => {
        if (!user?.id || !form.desiredStartDate) {
            setMessage('Desired start date is required.');
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/appointment-waitlist', {
                patientId: user.id,
                doctorId: form.doctorId ? Number(form.doctorId) : null,
                specialty: form.specialty || selectedDoctor?.specialization || 'General Medicine',
                currentAppointmentDate: form.currentAppointmentDate || null,
                desiredStartDate: form.desiredStartDate,
                desiredEndDate: form.desiredEndDate || null,
                timePreference: form.timePreference,
                priority: form.priority,
                reason: form.reason,
            });
            setForm({ doctorId: '', specialty: '', currentAppointmentDate: '', desiredStartDate: '', desiredEndDate: '', timePreference: 'ANYTIME', priority: 'NORMAL', reason: '' });
            await fetchData();
        } catch (err: unknown) {
            setMessage(getApiErrorMessage(err, 'Unable to submit waitlist request.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PatientPageFrame size="xl">
            <PatientPageHeader title="Appointment Waitlist" description="Request an earlier appointment window and track coordinator matching progress." icon={CalendarClock} tone="blue" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Waiting" value={stats.waiting} icon={Clock3} tone="blue" helper="Open requests" />
                <PatientStatCard label="Matched" value={stats.matched} icon={CheckCircle2} tone="amber" helper="Slot found" />
                <PatientStatCard label="Urgent" value={stats.urgent} icon={Zap} tone="rose" helper="Priority requests" />
            </div>

            {message && <PatientAlert icon={CalendarClock} tone={message.startsWith('Unable') ? 'rose' : 'amber'}>{message}</PatientAlert>}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className={`${patientCardClass} p-5`}>
                    <h2 className="text-base font-bold text-[var(--text-color)]">Join Waitlist</h2>
                    <div className="mt-4 space-y-3">
                        <select value={form.doctorId} onChange={e => setForm(c => ({ ...c, doctorId: e.target.value, specialty: doctors.find(d => String(d.id) === e.target.value)?.specialization || c.specialty }))} className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]">
                            <option value="">Any doctor in specialty</option>
                            {doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{formatDoctorName(doctor.fullName)}{doctor.specialization ? ` - ${doctor.specialization}` : ''}</option>)}
                        </select>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={form.specialty} onChange={e => setForm(c => ({ ...c, specialty: e.target.value }))} placeholder="Specialty" className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="date" value={form.currentAppointmentDate} onChange={e => setForm(c => ({ ...c, currentAppointmentDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="date" value={form.desiredStartDate} onChange={e => setForm(c => ({ ...c, desiredStartDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                            <input type="date" value={form.desiredEndDate} onChange={e => setForm(c => ({ ...c, desiredEndDate: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <select value={form.timePreference} onChange={e => setForm(c => ({ ...c, timePreference: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>ANYTIME</option><option>MORNING</option><option>AFTERNOON</option><option>EVENING</option></select>
                            <select value={form.priority} onChange={e => setForm(c => ({ ...c, priority: e.target.value }))} className="h-10 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--text-color)]"><option>NORMAL</option><option>URGENT</option></select>
                        </div>
                        <textarea value={form.reason} onChange={e => setForm(c => ({ ...c, reason: e.target.value }))} rows={4} placeholder="Reason for earlier appointment..." className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-color)]" />
                        <Button onClick={submit} isLoading={saving} className="gap-2"><Send className="h-4 w-4" /> Submit Waitlist Request</Button>
                    </div>
                </div>

                <div className={`${patientCardClass} overflow-hidden`}>
                    <div className="border-b border-[var(--border-color)] p-5"><h2 className="text-base font-bold text-[var(--text-color)]">My Waitlist Requests</h2></div>
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : entries.length === 0 ? (
                        <PatientEmptyState icon={Stethoscope} title="No waitlist requests" description="Earlier appointment requests will appear here." />
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {entries.map(entry => (
                                <div key={entry.id} className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-[var(--text-color)]">{entry.specialty || 'General Medicine'}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusTone[entry.status] || statusTone.WAITING}`}>{entry.status.replace('_', ' ')}</span>
                                        <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">{entry.priority}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">{entry.doctorName ? formatDoctorName(entry.doctorName) : 'Any available doctor'} • {entry.timePreference || 'ANYTIME'}</p>
                                    <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">Desired: {entry.desiredStartDate}{entry.desiredEndDate ? ` to ${entry.desiredEndDate}` : ''}</p>
                                    {entry.coordinatorNote && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{entry.coordinatorNote}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PatientPageFrame>
    );
};

export default AppointmentWaitlist;
