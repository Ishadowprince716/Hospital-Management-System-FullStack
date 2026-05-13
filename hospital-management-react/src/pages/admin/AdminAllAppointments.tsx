import React, { useEffect, useState } from 'react';
import {
    CalendarCheck, Search, Loader2,
    CheckCircle2, Clock, XCircle, Eye, X, RefreshCw, Download
} from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatDoctorName } from '../../utils/displayNames';

interface Appointment {
    id: number;
    status: string;
    reason: string;
    appointmentDate: string;
    appointmentTime: string;
    patientId?: number;
    doctorId?: number;
    patientName?: string;
    patientPhoneNumber?: string;
    doctorName?: string;
    doctorSpecialization?: string;
    consultationFee?: number;
    paymentStatus?: string;
    patient?: { id: number; fullName: string; phoneNumber?: string };
    doctor?: { id: number; fullName: string; specialization?: string; consultationFee?: number };
}

const STATUS_OPTS = ['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'];

const statusCfg: Record<string, { cls: string; icon: React.FC<{ className?: string }> }> = {
    SCHEDULED: { cls: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock },
    CONFIRMED: { cls: 'text-orange-600 bg-orange-50 border-orange-200', icon: Clock },
    COMPLETED: { cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    CANCELLED: { cls: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
    PENDING:   { cls: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = (status || 'PENDING').toUpperCase();
    const cfg = statusCfg[s] || statusCfg.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
            <Icon className="h-3 w-3" />{s}
        </span>
    );
};

const isNonEmptyString = (value?: string | null) => Boolean(value && value.trim());

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, rows: unknown[][]) => {
    const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const getPatientName = (appointment: Appointment) =>
    appointment.patient?.fullName || appointment.patientName || (appointment.patientId ? `Patient #${appointment.patientId}` : 'Patient details pending');

const getPatientPhone = (appointment: Appointment) =>
    appointment.patient?.phoneNumber || appointment.patientPhoneNumber || '—';

const getDoctorName = (appointment: Appointment) => {
    const doctorName = appointment.doctor?.fullName || appointment.doctorName;
    return formatDoctorName(doctorName, appointment.doctorId ? `Dr. #${appointment.doctorId}` : 'Doctor details pending');
};

const getDoctorSpecialization = (appointment: Appointment) =>
    appointment.doctor?.specialization || appointment.doctorSpecialization || '—';

const getConsultationFeeLabel = (appointment: Appointment) => {
    const fee = appointment.consultationFee ?? appointment.doctor?.consultationFee;
    if (typeof fee !== 'number' || Number.isNaN(fee)) return '—';
    return `₹${fee}`;
};

const AdminAllAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAppointments = async (pg = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/appointments?size=20&page=${pg}&sort=appointmentDate,desc`);
            const data = res.data?.data;
            setAppointments(data?.content || data || []);
            setTotalPages(data?.totalPages || 1);
        } catch { setAppointments([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAppointments(page); }, [page]);

    // PATCH — update appointment status
    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            setAppointments(a => a.map(x => x.id === id ? { ...x, status } : x));
            if (selectedAppt?.id === id) setSelectedAppt(prev => prev ? { ...prev, status } : null);
        } catch { alert('Failed to update status.'); }
    };

    const filtered = appointments.filter(a => {
        const patientName = getPatientName(a).toLowerCase();
        const doctorName = (a.doctor?.fullName || a.doctorName || '').toLowerCase();
        const matchSearch = search === '' ||
            patientName.includes(search.toLowerCase()) ||
            doctorName.includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    const exportAppointments = () => {
        downloadCsv('hms-appointments.csv', [
            ['ID', 'Patient', 'Doctor', 'Specialization', 'Date', 'Time', 'Reason', 'Status', 'Fee', 'Payment'],
            ...filtered.map(appt => [
                appt.id,
                getPatientName(appt),
                getDoctorName(appt),
                getDoctorSpecialization(appt),
                appt.appointmentDate,
                appt.appointmentTime,
                appt.reason,
                appt.status,
                getConsultationFeeLabel(appt),
                appt.paymentStatus,
            ]),
        ]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <CalendarCheck className="h-6 w-6 text-blue-600" /> All Appointments
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hospital-wide appointment management — view, filter, and update statuses.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search patient or doctor..." className="pl-9 h-9 w-56"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => fetchAppointments(page)} isLoading={loading} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={exportAppointments} disabled={filtered.length === 0} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Scheduled', value: stats.scheduled, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Confirmed', value: stats.confirmed, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(s => (
                    <div key={s.label} className="stat-card text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_OPTS.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)] hover:border-blue-300'}`}
                        style={{ color: statusFilter === s ? 'white' : 'var(--text-muted)' }}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>No appointments found</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Appointments will appear here as patients book them.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800/50 border-b border-[var(--border-color)]" style={{ color: 'var(--text-muted)' }}>
                                    <tr>{['Patient', 'Doctor', 'Specialization', 'Date & Time', 'Status', 'Fee', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-4 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}</tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {filtered.map(appt => (
                                        <tr key={appt.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-color)' }}>{getPatientName(appt)}</td>
                                            <td className="px-5 py-4" style={{ color: 'var(--text-color)' }}>{getDoctorName(appt)}</td>
                                            <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{getDoctorSpecialization(appt)}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                                                    {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{appt.appointmentTime || '—'}</p>
                                            </td>
                                            <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
                                            <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                                                {getConsultationFeeLabel(appt)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setSelectedAppt(appt)}
                                                        className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-blue-400 transition-colors" title="View details">
                                                        <Eye className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                    </button>
                                                    {['SCHEDULED', 'CONFIRMED'].includes(appt.status) && (
                                                        <>
                                                            <button onClick={() => updateStatus(appt.id, 'COMPLETED')}
                                                                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors">
                                                                Complete
                                                            </button>
                                                            <button onClick={() => updateStatus(appt.id, 'CANCELLED')}
                                                                className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-medium transition-colors">
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <span className="text-sm px-3" style={{ color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            )}

            {/* Detail Modal */}
            {selectedAppt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppt(null)}>
                    <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn" style={{ background: 'var(--card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Appointment #{selectedAppt.id}</h3>
                            <button onClick={() => setSelectedAppt(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { l: 'Patient',     v: getPatientName(selectedAppt) },
                                { l: 'Phone',       v: getPatientPhone(selectedAppt) },
                                { l: 'Doctor',      v: getDoctorName(selectedAppt) },
                                { l: 'Department',  v: getDoctorSpecialization(selectedAppt) },
                                { l: 'Date',        v: selectedAppt.appointmentDate ? new Date(selectedAppt.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                                { l: 'Time',        v: selectedAppt.appointmentTime || '—' },
                                { l: 'Reason',      v: selectedAppt.reason || '—' },
                                { l: 'Fee',         v: getConsultationFeeLabel(selectedAppt) },
                                { l: 'Payment',     v: selectedAppt.paymentStatus || '—' },
                            ].map(row => (
                                <div key={row.l} className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.l}</span>
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: isNonEmptyString(row.v) ? 'var(--text-color)' : 'var(--text-muted)' }}
                                    >
                                        {row.v}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between py-1.5">
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Status</span>
                                <StatusBadge status={selectedAppt.status} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            {['SCHEDULED', 'CONFIRMED'].includes(selectedAppt.status) && (
                                <>
                                    <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                                        onClick={() => { updateStatus(selectedAppt.id, 'COMPLETED'); setSelectedAppt(null); }}>
                                        Mark Complete
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => { updateStatus(selectedAppt.id, 'CANCELLED'); setSelectedAppt(null); }}>
                                        Cancel Appt
                                    </Button>
                                </>
                            )}
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedAppt(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAllAppointments;
