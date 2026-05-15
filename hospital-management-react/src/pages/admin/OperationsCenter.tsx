import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    BedDouble,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    Loader2,
    Package,
    RefreshCw,
    ShieldCheck,
    TrendingUp,
    Users,
} from 'lucide-react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface DashboardDTO {
    totalPatients?: number;
    totalDoctors?: number;
    todayAppointments?: number;
    totalRevenue?: number;
}

interface Appointment {
    id: number;
    patientName?: string;
    doctorName?: string;
    appointmentDate?: string;
    status?: string;
    reason?: string;
}

interface InventoryItem {
    id: number;
    name: string;
    category?: string;
    currentStock?: number;
    minThreshold?: number;
}

interface Bed {
    id: number;
    bedNumber?: string;
    status?: string;
    wardName?: string;
}

const unwrapList = <T,>(payload: unknown): T[] => {
    const data = payload && typeof payload === 'object' && 'data' in payload ? (payload as { data?: unknown }).data : payload;
    if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as { content?: unknown }).content)) {
        return (data as { content: T[] }).content;
    }
    return Array.isArray(data) ? data as T[] : [];
};

const OperationsCenter: React.FC = () => {
    const [stats, setStats] = useState<DashboardDTO>({});
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOperations = useCallback(async () => {
        setLoading(true);
        const [statsResult, appointmentsResult, inventoryResult, bedsResult] = await Promise.allSettled([
            api.get('/admin/stats'),
            api.get('/appointments/all?size=50&sort=appointmentDate,desc'),
            api.get('/inventory/low-stock'),
            api.get('/beds'),
        ]);

        if (statsResult.status === 'fulfilled') setStats(statsResult.value.data?.data || {});
        if (appointmentsResult.status === 'fulfilled') setAppointments(unwrapList<Appointment>(appointmentsResult.value.data));
        if (inventoryResult.status === 'fulfilled') setLowStock(unwrapList<InventoryItem>(inventoryResult.value.data));
        if (bedsResult.status === 'fulfilled') setBeds(unwrapList<Bed>(bedsResult.value.data));
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void fetchOperations(), 0);
        return () => window.clearTimeout(timer);
    }, [fetchOperations]);

    const openAppointments = appointments.filter(appointment =>
        ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes((appointment.status || '').toUpperCase())
    );
    const occupiedBeds = beds.filter(bed => (bed.status || '').toUpperCase() === 'OCCUPIED').length;
    const bedOccupancy = beds.length ? Math.round((occupiedBeds / beds.length) * 100) : 0;
    const revenue = typeof stats.totalRevenue === 'number' ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '—';

    const riskItems = useMemo(() => [
        {
            title: 'Appointment queue',
            value: openAppointments.length,
            helper: 'Active bookings need staff attention',
            tone: openAppointments.length > 10 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
            icon: CalendarCheck,
        },
        {
            title: 'Low stock supplies',
            value: lowStock.length,
            helper: 'Items below reorder threshold',
            tone: lowStock.length > 0 ? 'text-red-700 bg-red-50 border-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
            icon: Package,
        },
        {
            title: 'Bed occupancy',
            value: `${bedOccupancy}%`,
            helper: `${occupiedBeds} of ${beds.length || 0} beds occupied`,
            tone: bedOccupancy > 85 ? 'text-red-700 bg-red-50 border-red-100' : 'text-blue-700 bg-blue-50 border-blue-100',
            icon: BedDouble,
        },
    ], [bedOccupancy, beds.length, lowStock.length, occupiedBeds, openAppointments.length]);

    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-color)]">
                        <ShieldCheck className="h-6 w-6 text-teal-600" />
                        Operations Center
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Live executive view for patient flow, capacity, revenue, and supply risks.</p>
                </div>
                <Button onClick={fetchOperations} variant="outline" className="gap-2 self-start">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Patients', value: stats.totalPatients ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Doctors', value: stats.totalDoctors ?? '—', icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Today Appointments', value: stats.todayAppointments ?? '—', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Revenue', value: revenue, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="stat-card">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                                <Icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-color)]">{loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : item.value}</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {riskItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.title} className={`border ${item.tone}`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold">{item.title}</p>
                                        <p className="mt-2 text-3xl font-black">{item.value}</p>
                                        <p className="mt-1 text-xs font-medium opacity-80">{item.helper}</p>
                                    </div>
                                    <Icon className="h-6 w-6 shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] p-5">
                            <div>
                                <h2 className="text-base font-bold text-[var(--text-color)]">Patient Flow Watchlist</h2>
                                <p className="text-sm text-[var(--text-muted)]">Latest active appointment activity.</p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-teal-600" /></div>
                            ) : openAppointments.slice(0, 6).length === 0 ? (
                                <p className="p-6 text-sm text-[var(--text-muted)]">No active appointments in the queue.</p>
                            ) : openAppointments.slice(0, 6).map(appointment => (
                                <div key={appointment.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_140px] sm:items-center">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-[var(--text-color)]">{appointment.patientName || 'Unknown Patient'}</p>
                                        <p className="truncate text-xs text-[var(--text-muted)]">{appointment.reason || 'No reason recorded'} with {appointment.doctorName || 'doctor TBD'}</p>
                                    </div>
                                    <span className="inline-flex justify-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                        {(appointment.status || 'PENDING').replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] p-5">
                            <div>
                                <h2 className="text-base font-bold text-[var(--text-color)]">Supply Alerts</h2>
                                <p className="text-sm text-[var(--text-muted)]">Procurement priorities.</p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="divide-y divide-[var(--border-color)]">
                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-teal-600" /></div>
                            ) : lowStock.slice(0, 6).length === 0 ? (
                                <p className="p-6 text-sm text-[var(--text-muted)]">Inventory is healthy right now.</p>
                            ) : lowStock.slice(0, 6).map(item => (
                                <div key={item.id} className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-sm font-bold text-[var(--text-color)]">{item.name}</p>
                                        <span className="text-xs font-black text-red-600">{item.currentStock ?? 0}/{item.minThreshold ?? 0}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">{item.category || 'General supply'}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OperationsCenter;
