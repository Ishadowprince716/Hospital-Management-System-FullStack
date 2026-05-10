import React, { useEffect, useState } from 'react';
import { CalendarCheck, Clock, XCircle, CheckCircle2, AlertCircle, Loader2, Eye, ChevronDown, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Patient { id: number; fullName: string; phoneNumber?: string; bloodGroup?: string; }
interface Appointment {
    id: number; patient?: Patient; patientId?: number; patientName?: string; patientAge?: number; patientGender?: string; appointmentDate: string;
    appointmentTime: string; status: string; reason: string;
    appointmentType: string; consultationFee?: number;
}

const getPatientName = (appointment: Appointment) =>
    appointment.patient?.fullName || appointment.patientName || 'Unknown Patient';

const getPatientInitial = (appointment: Appointment) =>
    getPatientName(appointment).charAt(0).toUpperCase() || 'P';

const getStatus = (appointment: Appointment) => (appointment.status || '').toUpperCase();

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, string> = {
        SCHEDULED: 'text-blue-600 bg-blue-50 border-blue-200',
        COMPLETED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        CANCELLED: 'text-red-600 bg-red-50 border-red-200',
        NO_SHOW: 'text-gray-600 bg-gray-50 border-gray-200',
        PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
        CONFIRMED: 'text-teal-600 bg-teal-50 border-teal-200',
    };
    const s = (status || '').toUpperCase();
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[s] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>{s.replace('_', ' ')}</span>;
};

const DoctorAppointments: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [filter, setFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/appointments/my?size=100&sort=appointmentDate,desc');
            setAppointments(res.data?.data?.content || res.data?.data || []);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load appointments.'));
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            await api.patch(`/appointments/${id}/status?status=${newStatus}`);
            setAppointments(a => a.map(x => x.id === id ? { ...x, status: newStatus } : x));
            if (selected?.id === id) setSelected(p => p ? { ...p, status: newStatus } : null);
        } catch { alert('Failed to update status.'); }
        finally { setUpdatingId(null); }
    };

    const filtered = filter === 'ALL' ? appointments : appointments.filter(a => getStatus(a) === filter);
    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => ['SCHEDULED', 'PENDING', 'CONFIRMED'].includes(getStatus(a))).length,
        completed: appointments.filter(a => getStatus(a) === 'COMPLETED').length,
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}><CalendarCheck className="h-6 w-6 text-teal-600" /> My Appointments</h1><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage patient appointments and update their status.</p></div>

            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Total', value: stats.total }, { label: 'Upcoming', value: stats.scheduled }, { label: 'Completed', value: stats.completed }].map(s => (
                    <div key={s.label} className="stat-card text-center"><p className="text-2xl font-bold text-teal-600">{s.value}</p><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p></div>
                ))}
            </div>

            {error && <div className="flex items-center gap-2 p-4 rounded-xl text-red-600 bg-red-50 border border-red-200"><AlertCircle className="h-5 w-5 shrink-0" /> {error}</div>}

            <div className="flex gap-2">
                {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === s ? 'bg-teal-600 text-white border-teal-600' : 'border-[var(--border-color)] hover:border-teal-400'}`} style={{ color: filter === s ? 'white' : 'var(--text-muted)' }}>{s}</button>
                ))}
            </div>

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div> : filtered.length === 0 ? (
                        <div className="text-center py-16"><CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No appointments found.</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>{['Patient', 'Date & Time', 'Reason', 'Status', 'Actions'].map(h => <th key={h} className={`px-6 py-4 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filtered.map(appt => (
                                        <tr key={appt.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center">{getPatientInitial(appt)}</div>
                                                    <div><p className="font-medium" style={{ color: 'var(--text-color)' }}>{getPatientName(appt)}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{appt.appointmentType || 'General'}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium" style={{ color: 'var(--text-color)' }}>{appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</p>
                                                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock className="h-3 w-3" /> {appt.appointmentTime || 'TBD'}</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>{appt.reason || '—'}</td>
                                            <td className="px-6 py-4"><StatusBadge status={appt.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {['SCHEDULED', 'CONFIRMED', 'PENDING'].includes(getStatus(appt)) && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-teal-600 text-white hover:bg-teal-700 px-3 py-1.5 h-auto flex items-center gap-1.5 text-xs font-medium rounded-lg"
                                                            onClick={() => navigate(`/telehealth/${appt.id}`)}
                                                        >
                                                            <Video className="w-3.5 h-3.5" />
                                                            Start Call
                                                        </Button>
                                                    )}
                                                    <button onClick={() => setSelected(appt)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700" title="View"><Eye className="h-4 w-4 text-blue-600" /></button>
                                                    <div className="relative group">
                                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-color)] hover:border-teal-400 transition-colors" style={{ color: 'var(--text-color)' }} disabled={updatingId === appt.id}>
                                                            {updatingId === appt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronDown className="h-3 w-3" />} Update
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-lg border border-[var(--border-color)] z-10 hidden group-hover:block" style={{ background: 'var(--card-bg)' }}>
                                                            {['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                                                                <button key={s} onClick={() => handleStatusChange(appt.id, s)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-xl last:rounded-b-xl" style={{ color: 'var(--text-color)' }}>{s.replace('_', ' ')}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn" style={{ background: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Appointment Details</h3><button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100"><XCircle className="h-5 w-5 text-gray-400" /></button></div>
                        <div className="space-y-2">
                            {[{ label: 'Patient', value: getPatientName(selected) }, { label: 'Phone', value: selected.patient?.phoneNumber || '—' }, { label: 'Blood Group', value: selected.patient?.bloodGroup || '—' }, { label: 'Date', value: selected.appointmentDate ? new Date(selected.appointmentDate).toLocaleDateString() : '—' }, { label: 'Time', value: selected.appointmentTime || '—' }, { label: 'Type', value: selected.appointmentType || 'General' }, { label: 'Reason', value: selected.reason || '—' }, { label: 'Fee', value: selected.consultationFee ? `₹${selected.consultationFee}` : '—' }].map(r => (
                                <div key={r.label} className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.label}</span><span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{r.value}</span></div>
                            ))}
                            <div className="flex justify-between py-2"><span className="text-sm" style={{ color: 'var(--text-muted)' }}>Status</span><StatusBadge status={selected.status} /></div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            {getStatus(selected) !== 'COMPLETED' && <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleStatusChange(selected.id, 'COMPLETED'); setSelected(null); }}><CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete</Button>}
                            <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
