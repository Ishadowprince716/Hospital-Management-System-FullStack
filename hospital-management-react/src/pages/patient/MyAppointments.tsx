import React, { useEffect, useState } from 'react';
import { CalendarCheck, CalendarPlus, Clock, XCircle, CheckCircle2, AlertCircle, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../api';
import { Button } from '../../components/ui/Button';
import { formatDoctorName } from '../../utils/displayNames';
import {
    PatientAlert,
    PatientEmptyState,
    PatientLoader,
    PatientPageFrame,
    PatientPageHeader,
    PatientStatCard,
    patientCardClass,
} from '../../components/patient/PatientPanel';

interface Appointment {
    id: number;
    doctorName?: string;
    patientName?: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    reason: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toUpperCase();
    const map: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
        CONFIRMED:  { label: 'Confirmed',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200',  icon: CheckCircle2 },
        PENDING:    { label: 'Pending',    color: 'text-amber-600   bg-amber-50   border-amber-200',    icon: Clock },
        CANCELLED:  { label: 'Cancelled',  color: 'text-red-600     bg-red-50     border-red-200',      icon: XCircle },
        COMPLETED:  { label: 'Completed',  color: 'text-blue-600    bg-blue-50    border-blue-200',     icon: CheckCircle2 },
    };
    const info = map[s] || { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: AlertCircle };
    const Icon = info.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${info.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {info.label}
        </span>
    );
};

const MyAppointments: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/appointments/my?size=100');
            const data = res.data?.data?.content || res.data?.data || [];
            setAppointments(data);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load appointments.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await api.patch(`/appointments/${id}/cancel`);
            fetchAppointments();
        } catch {
            alert('Failed to cancel appointment. Please try again later.');
        }
    };

    const upcomingCount = appointments.filter(appt => ['CONFIRMED', 'PENDING', 'SCHEDULED'].includes((appt.status || '').toUpperCase())).length;
    const completedCount = appointments.filter(appt => (appt.status || '').toUpperCase() === 'COMPLETED').length;
    const cancelledCount = appointments.filter(appt => (appt.status || '').toUpperCase() === 'CANCELLED').length;

    return (
        <PatientPageFrame size="lg">
            <PatientPageHeader
                title="My Appointments"
                description="Review upcoming visits, join confirmed video calls, and cancel bookings when plans change."
                icon={CalendarCheck}
                tone="blue"
                action={
                    <Button onClick={() => navigate('/patient/book-appointment')} className="gap-2 bg-[var(--primary)] text-white">
                        <CalendarPlus className="h-4 w-4" />
                        Book New
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PatientStatCard label="Upcoming" value={upcomingCount} icon={CalendarCheck} tone="blue" helper="Confirmed or pending" />
                <PatientStatCard label="Completed" value={completedCount} icon={CheckCircle2} tone="emerald" helper="Past consultations" />
                <PatientStatCard label="Cancelled" value={cancelledCount} icon={XCircle} tone="rose" helper="No longer active" />
            </div>

            {error && (
                <PatientAlert icon={AlertCircle} tone="rose">{error}</PatientAlert>
            )}

            {loading ? (
                <PatientLoader label="Loading appointments" />
            ) : appointments.length === 0 ? (
                <PatientEmptyState
                    icon={CalendarCheck}
                    title="No appointments found"
                    description="Your appointments will appear here after you book a consultation."
                    action={
                        <Button onClick={() => navigate('/patient/book-appointment')} variant="outline">
                                Book your first appointment
                        </Button>
                    }
                />
            ) : (
                <div className={`${patientCardClass} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 text-[var(--text-muted)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Doctor</th>
                                        <th className="px-6 py-4 font-semibold">Date & Time</th>
                                        <th className="px-6 py-4 font-semibold">Reason</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {appointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[var(--text-color)]">{formatDoctorName(appt.doctorName, 'Unknown')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[var(--text-color)] font-medium">
                                                    {new Date(appt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-[var(--text-muted)] text-xs mt-0.5">
                                                    {appt.appointmentTime || 'TBD'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-muted)] max-w-xs truncate" title={appt.reason}>
                                                {appt.reason || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={appt.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {appt.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1 h-auto flex items-center gap-1.5"
                                                        onClick={() => navigate(`/telehealth/${appt.id}`)}
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                        Join Call
                                                    </Button>
                                                )}
                                                {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 h-auto"
                                                        onClick={() => handleCancel(appt.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </div>
            )}
        </PatientPageFrame>
    );
};

export default MyAppointments;
