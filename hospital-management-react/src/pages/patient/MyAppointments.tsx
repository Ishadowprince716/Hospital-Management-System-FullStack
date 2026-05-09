import React, { useEffect, useState } from 'react';
import { CalendarCheck, Clock, XCircle, CheckCircle2, AlertCircle, Loader2, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-color)]">My Appointments</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage and view your upcoming and past appointments.</p>
                </div>
                <Button onClick={() => window.location.href = '/patient/book-appointment'} className="bg-[var(--primary)] text-white">
                    + Book New
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl text-red-600 bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </div>
            )}

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-16">
                            <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-[var(--text-color)]">No appointments found</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">You haven't booked any appointments yet.</p>
                            <Button onClick={() => window.location.href = '/patient/book-appointment'} variant="outline">
                                Book your first appointment
                            </Button>
                        </div>
                    ) : (
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
                                                <div className="font-medium text-[var(--text-color)]">Dr. {appt.doctorName || 'Unknown'}</div>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyAppointments;
