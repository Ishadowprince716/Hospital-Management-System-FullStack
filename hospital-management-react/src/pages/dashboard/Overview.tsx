import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api from '../../api';
import {
    Users, CalendarCheck, Activity, CreditCard,
    TrendingUp, Stethoscope, FileText,
    AlertCircle, Loader2
} from 'lucide-react';

// --- Types ---
interface DashboardDTO {
    totalPatients: number;
    totalDoctors: number;
    todayAppointments: number;
    totalRevenue: number;
}

interface Appointment {
    id: number;
    doctorName?: string;
    patientName?: string;
    appointmentDate: string;
    reason: string;
    status: string;
}

interface StatCard {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
    change?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'CONFIRMED': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold tracking-wider">CONFIRMED</span>;
        case 'PENDING': return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold tracking-wider">PENDING</span>;
        case 'CANCELLED': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold tracking-wider">CANCELLED</span>;
        case 'COMPLETED': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-wider">COMPLETED</span>;
        default: return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-wider">{status}</span>;
    }
};

// --- Main Dashboard ---
const Overview: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const role = user?.role || 'PATIENT';

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [apptLoading, setApptLoading] = useState(true);
    const [adminStats, setAdminStats] = useState<DashboardDTO | null>(null);
    const [error, setError] = useState<string | null>(null);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Fetch appointments
    useEffect(() => {
        const fetchAppointments = async () => {
            setApptLoading(true);
            try {
                let url = '/appointments/my';
                if (role === 'ADMIN') url = '/appointments/all';
                if (role === 'DOCTOR') url = '/appointments/doctor';
                const res = await api.get(url);
                const data = res.data?.data || res.data || [];
                setAppointments(Array.isArray(data) ? data.slice(0, 5) : []);
            } catch {
                setAppointments([]);
            } finally {
                setApptLoading(false);
            }
        };
        fetchAppointments();
    }, [role]);

    // Fetch admin stats
    useEffect(() => {
        if (role !== 'ADMIN') { setStatsLoading(false); return; }
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setAdminStats(res.data?.data || {});
            } catch {
                setError('Could not load statistics.');
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, [role]);

    // --- Stat Cards by Role ---
    const getStatCards = (): StatCard[] => {
        if (role === 'ADMIN') {
            return [
                { label: 'Total Patients',     value: adminStats?.totalPatients     ?? '—', icon: Users,         color: 'text-blue-600',    bg: 'bg-blue-50',    change: '+12%' },
                { label: 'Total Doctors',      value: adminStats?.totalDoctors      ?? '—', icon: Stethoscope,   color: 'text-teal-600',    bg: 'bg-teal-50',    change: '+3%' },
                { label: 'Appointments Today', value: adminStats?.todayAppointments ?? '—', icon: CalendarCheck, color: 'text-purple-600',  bg: 'bg-purple-50',  change: '' },
                { label: 'Revenue (₹)',        value: adminStats?.totalRevenue       ?? '—', icon: CreditCard,    color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+8%' },
            ];
        }
        if (role === 'DOCTOR') {
            return [
                { label: 'My Patients',           value: '—', icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50' },
                { label: 'Today\'s Appointments', value: '—', icon: CalendarCheck, color: 'text-teal-600',   bg: 'bg-teal-50' },
                { label: 'Pending Reviews',       value: '—', icon: FileText,      color: 'text-amber-600',  bg: 'bg-amber-50' },
                { label: 'Active Cases',          value: '—', icon: Activity,      color: 'text-purple-600', bg: 'bg-purple-50' },
            ];
        }
        // PATIENT
        return [
            { label: 'Upcoming Appointments', value: appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length, icon: CalendarCheck, color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'Total Appointments',    value: appointments.length,                                                                  icon: Activity,      color: 'text-teal-600',    bg: 'bg-teal-50' },
            { label: 'Prescriptions',         value: '—',                                                                                  icon: FileText,      color: 'text-purple-600',  bg: 'bg-purple-50' },
            { label: 'Pending Bills',         value: '—',                                                                                  icon: CreditCard,    color: 'text-amber-600',   bg: 'bg-amber-50' },
        ];
    };

    const statCards = getStatCards();

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                        {greeting()}, {user?.fullName?.split(' ')[0] || user?.username}! 👋
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                    System Online
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-amber-600 bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="stat-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                {stat.change && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                        <TrendingUp className="h-3 w-3" /> {stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                                {statsLoading && role === 'ADMIN' ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                ) : stat.value}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Appointments */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>
                        {role === 'ADMIN' ? 'Recent Appointments' : 'My Appointments'}
                    </h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                        Last 5
                    </span>
                </div>

                {apptLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                        <CalendarCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No appointments found.</p>
                        {role === 'PATIENT' && (
                            <a href="/patient/book-appointment"
                                className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Book your first appointment →
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                                    <th className="pb-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>
                                        {role === 'PATIENT' ? 'Doctor' : 'Patient'}
                                    </th>
                                    <th className="pb-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                                    <th className="pb-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Reason</th>
                                    <th className="pb-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                {appointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 font-medium" style={{ color: 'var(--text-color)' }}>
                                            {role === 'PATIENT' ? (appt.doctorName || 'Dr. —') : (appt.patientName || '—')}
                                        </td>
                                        <td className="py-3" style={{ color: 'var(--text-muted)' }}>
                                            {appt.appointmentDate
                                                ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="py-3 max-w-[180px] truncate" style={{ color: 'var(--text-muted)' }}>
                                            {appt.reason || '—'}
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={appt.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {role === 'PATIENT' && (
                        <>
                            <a href="/patient/book-appointment"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-medium text-center" style={{ color: 'var(--text-color)' }}>Book Appointment</span>
                            </a>
                            <a href="/patient/medical-records"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                    <FileText className="h-5 w-5 text-teal-600" />
                                </div>
                                <span className="text-xs font-medium text-center" style={{ color: 'var(--text-color)' }}>Medical Records</span>
                            </a>
                            <a href="/patient/prescriptions"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium text-center" style={{ color: 'var(--text-color)' }}>Prescriptions</span>
                            </a>
                            <a href="/patient/billing"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                    <CreditCard className="h-5 w-5 text-amber-600" />
                                </div>
                                <span className="text-xs font-medium text-center" style={{ color: 'var(--text-color)' }}>View Bills</span>
                            </a>
                        </>
                    )}
                    {role === 'ADMIN' && (
                        <>
                            <a href="/admin/doctors"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                    <Stethoscope className="h-5 w-5 text-teal-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Manage Doctors</span>
                            </a>
                            <a href="/admin/patients"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Manage Patients</span>
                            </a>
                            <a href="/admin/analytics"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <Activity className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Analytics</span>
                            </a>
                            <a href="/admin/billing"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                    <CreditCard className="h-5 w-5 text-amber-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Billing</span>
                            </a>
                        </>
                    )}
                    {role === 'DOCTOR' && (
                        <>
                            <a href="/doctor/appointments"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                                    <CalendarCheck className="h-5 w-5 text-teal-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Appointments</span>
                            </a>
                            <a href="/doctor/patients"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>My Patients</span>
                            </a>
                            <a href="/doctor/prescriptions"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Prescriptions</span>
                            </a>
                            <a href="/doctor/availability"
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer group"
                                style={{ borderColor: 'var(--border-color)' }}>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Availability</span>
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;
