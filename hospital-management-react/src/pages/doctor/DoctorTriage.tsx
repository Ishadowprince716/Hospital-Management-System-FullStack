import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Loader2, RefreshCw, ShieldAlert, Stethoscope } from 'lucide-react';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface Appointment {
    id: number;
    patientName?: string;
    patient?: { fullName?: string };
    appointmentDate?: string;
    appointmentTime?: string;
    status?: string;
    reason?: string;
    appointmentType?: string;
}

const urgentWords = ['chest', 'breath', 'severe', 'bleeding', 'fever', 'emergency', 'pain', 'dizzy'];

const scoreAppointment = (appointment: Appointment) => {
    const reason = (appointment.reason || '').toLowerCase();
    const status = (appointment.status || '').toUpperCase();
    let score = 1;
    urgentWords.forEach(word => {
        if (reason.includes(word)) score += 2;
    });
    if (status === 'PENDING') score += 2;
    if (status === 'CONFIRMED' || status === 'SCHEDULED') score += 1;
    return Math.min(score, 10);
};

const getPriority = (score: number) => {
    if (score >= 6) return { label: 'High', className: 'bg-red-50 text-red-700 border-red-100', icon: ShieldAlert };
    if (score >= 4) return { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertTriangle };
    return { label: 'Routine', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 };
};

const patientName = (appointment: Appointment) =>
    appointment.patient?.fullName || appointment.patientName || 'Unknown Patient';

const DoctorTriage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/appointments/my?size=100&sort=appointmentDate,asc');
            setAppointments(res.data?.data?.content || res.data?.data || []);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Unable to load triage queue.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const queue = useMemo(() => appointments
        .filter(appointment => ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes((appointment.status || '').toUpperCase()))
        .map(appointment => ({ ...appointment, triageScore: scoreAppointment(appointment) }))
        .sort((a, b) => b.triageScore - a.triageScore), [appointments]);

    const highPriority = queue.filter(item => item.triageScore >= 6).length;

    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <Stethoscope className="h-6 w-6 text-teal-600" />
                        Triage Queue
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Prioritize upcoming consultations by symptoms, status, and clinical urgency signals.</p>
                </div>
                <Button onClick={fetchAppointments} variant="outline" className="gap-2 self-start">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="stat-card">
                    <p className="text-2xl font-bold text-red-600">{highPriority}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">High Priority</p>
                </div>
                <div className="stat-card">
                    <p className="text-2xl font-bold text-teal-600">{queue.length}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Open Consults</p>
                </div>
                <div className="stat-card">
                    <p className="text-2xl font-bold text-blue-600">{appointments.filter(a => (a.status || '').toUpperCase() === 'COMPLETED').length}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Completed</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
            )}

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="py-16 text-center">
                            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-300" />
                            <p className="text-sm font-semibold text-[var(--text-color)]">No active triage items</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">Pending and scheduled appointments will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {queue.map(appointment => {
                                const priority = getPriority(appointment.triageScore);
                                const Icon = priority.icon;
                                return (
                                    <div key={appointment.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_170px_160px] lg:items-center">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-base font-bold text-[var(--text-color)]">{patientName(appointment)}</h2>
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold ${priority.className}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {priority.label}
                                                </span>
                                            </div>
                                            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{appointment.reason || 'No reason recorded.'}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-muted)]">
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                                    <CalendarClock className="h-3.5 w-3.5" />
                                                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Date TBD'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {appointment.appointmentTime || 'Time TBD'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Triage Score</p>
                                            <div className="mt-2 h-2 rounded-full bg-slate-100">
                                                <div className="h-2 rounded-full bg-teal-600" style={{ width: `${appointment.triageScore * 10}%` }} />
                                            </div>
                                            <p className="mt-1 text-sm font-bold text-[var(--text-color)]">{appointment.triageScore}/10</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/doctor/appointments'}
                                            className="justify-center"
                                        >
                                            Open Appointment
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorTriage;
