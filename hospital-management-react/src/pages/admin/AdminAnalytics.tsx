import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Stethoscope, CalendarCheck, DollarSign, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AnalyticsData {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    totalRevenue: number;
    appointmentsByStatus?: Record<string, number>;
    appointmentsByMonth?: Record<string, number>;
    revenueByMonth?: Record<string, number>;
    revenueByDepartment?: Record<string, number>;
    patientAgeDistribution?: Record<string, number>;
}

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
    message?: string;
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toNumber = (value: unknown): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const unwrapApiData = <T,>(raw: ApiEnvelope<T> | T): T => {
    if (raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)) {
        return ((raw as ApiEnvelope<T>).data ?? {}) as T;
    }
    return raw as T;
};

const normalizeMonthLabel = (monthKey: string): string => {
    const cleaned = (monthKey || '').trim();
    if (!cleaned) return '';

    const shortByName = MONTHS.find((m) => m.toLowerCase() === cleaned.slice(0, 3).toLowerCase());
    if (shortByName) return shortByName;

    const yearMonthMatch = cleaned.match(/^(\d{4})-(\d{1,2})$/);
    if (yearMonthMatch) {
        const monthIndex = Number(yearMonthMatch[2]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            return MONTHS[monthIndex];
        }
    }

    const monthNumber = Number(cleaned);
    if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        return MONTHS[monthNumber - 1];
    }

    return cleaned;
};

const normalizeMonthlySeries = (source?: Record<string, number>, valueKey: 'appointments' | 'revenue' = 'appointments') => {
    const normalized = new Map<string, number>();
    for (const [key, value] of Object.entries(source || {})) {
        const label = normalizeMonthLabel(key);
        if (!label) continue;
        normalized.set(label, toNumber(value));
    }
    return MONTHS.map((month) => ({ month, [valueKey]: normalized.get(month) ?? 0 }));
};

const toChartData = (map?: Record<string, number>, labelKey = 'name', valueKey = 'value') =>
    Object.entries(map || {}).map(([k, v]) => ({ [labelKey]: k, [valueKey]: toNumber(v) }));

const ensureAnalyticsDefaults = (raw?: Partial<AnalyticsData> | null): AnalyticsData => ({
    totalPatients: toNumber(raw?.totalPatients),
    totalDoctors: toNumber(raw?.totalDoctors),
    totalAppointments: toNumber(raw?.totalAppointments),
    totalRevenue: toNumber(raw?.totalRevenue),
    appointmentsByStatus: (raw?.appointmentsByStatus || {}) as Record<string, number>,
    appointmentsByMonth: (raw?.appointmentsByMonth || {}) as Record<string, number>,
    revenueByMonth: (raw?.revenueByMonth || {}) as Record<string, number>,
    revenueByDepartment: (raw?.revenueByDepartment || {}) as Record<string, number>,
    patientAgeDistribution: (raw?.patientAgeDistribution || {}) as Record<string, number>,
});

const AdminAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true); setError(null);
        try {
            // GET /api/admin/analytics/dashboard
            const res = await api.get('/admin/analytics/dashboard');
            const payload = unwrapApiData<AnalyticsData>(res.data);
            setData(ensureAnalyticsDefaults(payload));
        } catch {
            // Fallback: GET /api/admin/stats
            try {
                const res2 = await api.get('/admin/stats');
                const payload = unwrapApiData<AnalyticsData>(res2.data);
                setData(ensureAnalyticsDefaults(payload));
            } catch {
                setError('Could not load analytics. The analytics service may not have data yet.');
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    const appointmentsByStatus = toChartData(data?.appointmentsByStatus, 'status', 'count');
    const apptByMonth = normalizeMonthlySeries(data?.appointmentsByMonth, 'appointments');
    const revenueByMonth = normalizeMonthlySeries(data?.revenueByMonth, 'revenue');
    const revenueByDept = toChartData(data?.revenueByDepartment, 'department', 'revenue');
    const ageDistribution = toChartData(data?.patientAgeDistribution, 'range', 'count');

    const demoAppointments = apptByMonth;
    const demoRevenue = revenueByMonth;
    const demoStatus = appointmentsByStatus.length > 0 ? appointmentsByStatus : [
        { status: 'SCHEDULED', count: data?.totalAppointments || 0 },
        { status: 'COMPLETED', count: 0 }, { status: 'CANCELLED', count: 0 },
    ];
    const hasStatusData = demoStatus.some(item => toNumber(item.count) > 0);

    const kpiCards = [
        { label: 'Total Patients', value: data?.totalPatients ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Total Doctors', value: data?.totalDoctors ?? 0, icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
        { label: 'Total Appointments', value: data?.totalAppointments ?? 0, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Total Revenue', value: `₹${toNumber(data?.totalRevenue).toFixed(0)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading analytics data...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <TrendingUp className="h-6 w-6 text-purple-600" /> Analytics Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hospital performance metrics and trends at a glance.</p>
                </div>
                <Button variant="outline" onClick={fetchAnalytics} className="gap-2 text-sm">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl text-amber-600 bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kpiCards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`stat-card flex items-center gap-4 border ${card.border}`}>
                            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointments by Month (Bar) */}
                <Card className="border-[var(--border-color)] shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Appointments by Month
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={demoAppointments} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                <Bar dataKey="appointments" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Trend (Line) */}
                <Card className="border-[var(--border-color)] shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Revenue Trend (₹)
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Appointment Status Pie */}
                <Card className="border-[var(--border-color)] shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Appointment Status
                        </h3>
                        {hasStatusData ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={demoStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                                        {demoStatus.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] rounded-xl border-2 border-dashed border-[var(--border-color)]">
                                <div className="text-center">
                                    <CalendarCheck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No appointment status data yet</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Book or sync appointments to populate this chart</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Department (Bar) */}
                <Card className="border-[var(--border-color)] shadow-sm lg:col-span-2">
                    <CardContent className="p-5">
                        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Revenue by Department
                        </h3>
                        {revenueByDept.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={revenueByDept} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                    <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] rounded-xl border-2 border-dashed border-[var(--border-color)]">
                                <div className="text-center">
                                    <TrendingUp className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No department revenue data yet</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Data populates as doctors complete appointments</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Patient Age Distribution */}
            {ageDistribution.length > 0 && (
                <Card className="border-[var(--border-color)] shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Patient Age Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={ageDistribution} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminAnalytics;
