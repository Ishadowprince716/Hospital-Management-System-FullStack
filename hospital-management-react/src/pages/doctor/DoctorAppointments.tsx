import React, { useEffect, useState } from 'react';
import { CalendarCheck, Clock, XCircle, CheckCircle2, AlertCircle, Loader2, Eye, BellRing, Headphones, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { requestTelehealthNotificationPermission, unlockTelehealthAudio } from '../../utils/telehealthAlerts';

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
const canCall = (appointment: Appointment) => ['SCHEDULED', 'CONFIRMED', 'PENDING'].includes(getStatus(appointment));

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
    const [alertsReady, setAlertsReady] = useState(localStorage.getItem('telehealthAudioEnabled') === 'true');

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}><CalendarCheck className="h-6 w-6 text-teal-600" /> My Appointments</h1><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage patient appointments and update their status.</p></div>
                <Button
                    variant="outline"
                    className="gap-2 self-start"
                    onClick={async () => {
                        await unlockTelehealthAudio();
                        await requestTelehealthNotificationPermission();
                        setAlertsReady(true);
                    }}
                >
                    <BellRing className="h-4 w-4" />
                    {alertsReady ? 'Call Alerts On' : 'Enable Call Alerts'}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[{ label: 'Total', value: stats.total }, { label: 'Upcoming', value: stats.scheduled }, { label: 'Telehealth Ready', value: appointments.filter(canCall).length }, { label: 'Completed', value: stats.completed }].map(s => (
                    <div key={s.label} className="stat-card text-center"><p className="text-2xl font-bold text-teal-600">{s.value}</p><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p></div>
                ))}
            </div>

            {error && <div className="flex items-center gap-2 p-4 rounded-xl text-red-600 bg-red-50 border border-red-200"><AlertCircle className="h-5 w-5 shrink-0" /> {error}</div>}

            <div className="flex gap-2">
                {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === s ? 'bg-teal-600 text-white border-teal-600' : 'border-[var(--border-color)] hover:border-teal-400'}`} style={{ color: filter === s ? 'white' : 'var(--text-muted)' }}>{s}</button>
                ))}
            </div>

            <Card className="overflow-visible border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div> : filtered.length === 0 ? (
                        <div className="text-center py-16"><CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No appointments found.</p></div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="w-full min-w-[960px] text-sm">
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
                                            <td className="px-6 py-4 max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
                                                <p className="truncate" title={appt.reason || ''}>{appt.reason || '—'}</p>
                                                {canCall(appt) && (
                                                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700 ring-1 ring-cyan-100">
                                                        <Headphones className="h-3 w-3" />
                                                        Online room ready
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={appt.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex min-w-[300px] items-center justify-end gap-2">
                                                    {canCall(appt) && (
                                                        <Button
                                                            size="sm"
                                                            className="h-9 gap-1.5 rounded-xl bg-teal-600 px-3 text-xs font-bold text-white shadow-lg shadow-teal-100 hover:bg-teal-700"
                                                            onClick={() => navigate(`/telehealth/${appt.id}`)}
                                                        >
                                                            <PhoneCall className="h-3.5 w-3.5" />
                                                            Start Call
                                                        </Button>
                                                    )}
                                                    <button onClick={() => setSelected(appt)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100" title="View appointment details"><Eye className="h-4 w-4" /></button>
                                                    <label className="sr-only" htmlFor={`status-${appt.id}`}>Update appointment status</label>
                                                    <select
                                                        id={`status-${appt.id}`}
                                                        value={getStatus(appt)}
                                                        disabled={updatingId === appt.id}
                                                        onChange={(event) => handleStatusChange(appt.id, event.target.value)}
                                                        className="h-9 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-xs font-bold text-[var(--text-color)] outline-none transition hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                                                    >
                                                        {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                                                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                        ))}
                                                    </select>
                                                    {updatingId === appt.id && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
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
