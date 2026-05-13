import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    BellOff,
    Calendar,
    CheckCheck,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    Info,
    Loader2,
    Megaphone,
    RefreshCw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
    localOnly?: boolean;
}

interface AppointmentSnapshot {
    id: number;
    status?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    patient?: { fullName?: string };
    doctor?: { fullName?: string };
}

interface BillSnapshot {
    id: number;
    amount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    dueDate?: string;
    status?: string;
    patient?: { fullName?: string };
}

interface AdminStatsSnapshot {
    todayAppointments?: number;
    totalRevenue?: number;
    totalPatients?: number;
    totalDoctors?: number;
}

interface AdminUser {
    id: number;
    role: string;
    fullName?: string;
    isActive?: boolean;
}

type FeedFilter = 'ALL' | 'UNREAD' | 'APPOINTMENT' | 'BILL' | 'WARNING' | 'SUCCESS' | 'INFO';

const FILTERS: FeedFilter[] = ['ALL', 'UNREAD', 'APPOINTMENT', 'BILL', 'WARNING', 'SUCCESS', 'INFO'];

const typeIcon: Record<string, React.FC<{ className?: string }>> = {
    APPOINTMENT: Calendar,
    BILL: CreditCard,
    WARNING: AlertTriangle,
    SUCCESS: CheckCircle2,
    INFO: Info,
};

const typeColor: Record<string, string> = {
    APPOINTMENT: 'text-blue-600 bg-blue-100',
    BILL: 'text-amber-600 bg-amber-100',
    WARNING: 'text-red-600 bg-red-100',
    SUCCESS: 'text-emerald-600 bg-emerald-100',
    INFO: 'text-purple-600 bg-purple-100',
};

let localNotificationSeed = -1;
const createLocalId = () => {
    localNotificationSeed -= 1;
    return localNotificationSeed;
};

const normalizeType = (type?: string) => {
    const value = String(type || 'INFO').toUpperCase();
    if (value === 'APPOINTMENT' || value === 'BILL' || value === 'WARNING' || value === 'SUCCESS') {
        return value;
    }
    return 'INFO';
};

const toNumber = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const toDateSafe = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toTimeAgo = (dateStr: string) => {
    const parsed = toDateSafe(dateStr);
    if (!parsed) return 'recently';
    const diff = Date.now() - parsed.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const buildAdminActivityNotifications = (
    appointments: AppointmentSnapshot[],
    bills: BillSnapshot[],
    stats: AdminStatsSnapshot | null,
) => {
    const generated: NotificationItem[] = [];
    const nowIso = new Date().toISOString();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayAppointments = appointments.filter((appt) => {
        const date = toDateSafe(appt.appointmentDate);
        if (!date) return false;
        return date.getFullYear() === todayStart.getFullYear()
            && date.getMonth() === todayStart.getMonth()
            && date.getDate() === todayStart.getDate();
    }).length;

    if (todayAppointments > 0 || toNumber(stats?.todayAppointments) > 0) {
        const count = Math.max(todayAppointments, toNumber(stats?.todayAppointments));
        generated.push({
            id: createLocalId(),
            title: 'Today schedule snapshot',
            message: `${count} appointment${count > 1 ? 's are' : ' is'} lined up for today.`,
            type: 'APPOINTMENT',
            isRead: false,
            createdAt: nowIso,
            actionUrl: '/admin/appointments',
            localOnly: true,
        });
    }

    const unpaidBills = bills.filter((bill) => {
        const amount = toNumber(bill.amount);
        const paid = toNumber(bill.paidAmount);
        const balance = bill.balanceAmount !== undefined ? toNumber(bill.balanceAmount) : Math.max(0, amount - paid);
        return balance > 0;
    });

    const overdueBills = unpaidBills.filter((bill) => {
        const dueDate = toDateSafe(bill.dueDate);
        return dueDate && dueDate.getTime() < todayStart.getTime();
    });

    const pendingAmount = unpaidBills.reduce((sum, bill) => {
        if (bill.balanceAmount !== undefined) return sum + toNumber(bill.balanceAmount);
        return sum + Math.max(0, toNumber(bill.amount) - toNumber(bill.paidAmount));
    }, 0);

    if (pendingAmount > 0) {
        generated.push({
            id: createLocalId(),
            title: 'Billing attention required',
            message: `Pending collection is ₹${pendingAmount.toFixed(0)} across ${unpaidBills.length} bill${unpaidBills.length > 1 ? 's' : ''}.`,
            type: overdueBills.length > 0 ? 'WARNING' : 'BILL',
            isRead: false,
            createdAt: nowIso,
            actionUrl: '/admin/billing',
            localOnly: true,
        });
    }

    if (overdueBills.length > 0) {
        generated.push({
            id: createLocalId(),
            title: 'Overdue invoices detected',
            message: `${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's need' : ' needs'} follow-up.`,
            type: 'WARNING',
            isRead: false,
            createdAt: nowIso,
            actionUrl: '/admin/billing',
            localOnly: true,
        });
    }

    const recentAppointments = appointments
        .slice(0, 6)
        .map((appt) => {
            const status = String(appt.status || 'SCHEDULED').toUpperCase();
            const patient = appt.patient?.fullName || 'Patient';
            const doctor = appt.doctor?.fullName || 'Doctor';
            const summaryTime = [appt.appointmentDate, appt.appointmentTime].filter(Boolean).join(' ');
            const type = status === 'CANCELLED' ? 'WARNING' : status === 'COMPLETED' ? 'SUCCESS' : 'APPOINTMENT';
            return {
                id: createLocalId(),
                title: `Appointment #${appt.id} ${status.toLowerCase()}`,
                message: `${patient} with ${doctor}${summaryTime ? ` • ${summaryTime}` : ''}`,
                type,
                isRead: true,
                createdAt: toDateSafe(appt.appointmentDate)?.toISOString() || nowIso,
                actionUrl: '/admin/appointments',
                localOnly: true,
            } as NotificationItem;
        });

    const recentBills = bills
        .slice(0, 4)
        .map((bill) => {
            const paid = toNumber(bill.paidAmount);
            const amount = toNumber(bill.amount);
            const balance = bill.balanceAmount !== undefined ? toNumber(bill.balanceAmount) : Math.max(0, amount - paid);
            const status = balance > 0 ? 'pending payment' : 'paid';
            const type = balance > 0 ? 'BILL' : 'SUCCESS';
            return {
                id: createLocalId(),
                title: `Bill #${bill.id} ${status}`,
                message: `${bill.patient?.fullName || 'Patient'} • Balance ₹${Math.max(0, balance).toFixed(0)}`,
                type,
                isRead: true,
                createdAt: toDateSafe(bill.dueDate)?.toISOString() || nowIso,
                actionUrl: '/admin/billing',
                localOnly: true,
            } as NotificationItem;
        });

    generated.push(...recentAppointments, ...recentBills);
    return generated;
};

const Notifications: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [adminActivity, setAdminActivity] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<FeedFilter>('ALL');
    const [search, setSearch] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastTargetRole, setBroadcastTargetRole] = useState<'PATIENT' | 'DOCTOR' | 'ALL'>('ALL');
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState<'INFO' | 'WARNING' | 'SUCCESS'>('INFO');
    const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const isAdmin = user?.role === 'ADMIN';

    const fetchNotifications = useCallback(async (withSpinner = true) => {
        if (!user?.id) return;
        if (withSpinner) setLoading(true);
        setRefreshing(true);
        setActionMessage(null);

        try {
            const [notifRes, countRes] = await Promise.all([
                api.get(`/notifications/user/${user.id}?size=80`),
                api.get(`/notifications/user/${user.id}/unread-count`),
            ]);

            const raw = notifRes.data?.data?.content || notifRes.data?.data || [];
            const backendList: NotificationItem[] = (Array.isArray(raw) ? raw : []).map((item: Record<string, unknown>) => ({
                id: toNumber(item.id),
                title: String(item.title || 'Notification'),
                message: String(item.message || ''),
                type: normalizeType(String(item.type || 'INFO')),
                isRead: Boolean(item.isRead),
                createdAt: String(item.createdAt || new Date().toISOString()),
                actionUrl: item.actionUrl ? String(item.actionUrl) : undefined,
                localOnly: false,
            }));

            setNotifications(backendList);
            setUnreadCount(toNumber(countRes.data?.data?.count || backendList.filter((n) => !n.isRead).length));

            if (isAdmin) {
                const [appointmentsRes, billsRes, statsRes] = await Promise.allSettled([
                    api.get('/appointments?size=30&sort=appointmentDate,desc'),
                    api.get('/bills?size=30&sort=generatedAt,desc'),
                    api.get('/admin/stats'),
                ]);

                const appointmentsPayload = appointmentsRes.status === 'fulfilled'
                    ? (appointmentsRes.value.data?.data?.content || appointmentsRes.value.data?.data || [])
                    : [];
                const billsPayload = billsRes.status === 'fulfilled'
                    ? (billsRes.value.data?.data?.content || billsRes.value.data?.data || [])
                    : [];
                const statsPayload = statsRes.status === 'fulfilled'
                    ? (statsRes.value.data?.data || statsRes.value.data || null)
                    : null;

                const appointmentRows = Array.isArray(appointmentsPayload) ? appointmentsPayload as AppointmentSnapshot[] : [];
                const billRows = Array.isArray(billsPayload) ? billsPayload as BillSnapshot[] : [];
                const adminFeed = buildAdminActivityNotifications(appointmentRows, billRows, statsPayload);
                setAdminActivity(adminFeed);
            } else {
                setAdminActivity([]);
            }
        } catch {
            setNotifications([]);
            setUnreadCount(0);
            setAdminActivity([]);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [isAdmin, user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [fetchNotifications, user?.id]);

    useEffect(() => {
        if (!autoRefresh || !user?.id) return;
        const timer = setInterval(() => {
            void fetchNotifications(false);
        }, 30000);
        return () => clearInterval(timer);
    }, [autoRefresh, fetchNotifications, user?.id]);

    const mergedNotifications = useMemo(() => {
        const sorted = [...notifications, ...adminActivity].sort((a, b) => {
            const aTime = toDateSafe(a.createdAt)?.getTime() || 0;
            const bTime = toDateSafe(b.createdAt)?.getTime() || 0;
            return bTime - aTime;
        });

        const seen = new Set<string>();
        const deduped: NotificationItem[] = [];
        for (const item of sorted) {
            const key = `${item.title}|${item.message}|${normalizeType(item.type)}|${toDateSafe(item.createdAt)?.getTime() || 0}`;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push({ ...item, type: normalizeType(item.type) });
        }
        return deduped;
    }, [adminActivity, notifications]);

    const effectiveUnreadCount = useMemo(
        () => mergedNotifications.filter((n) => !n.isRead).length,
        [mergedNotifications],
    );

    const typeSummary = useMemo(() => {
        const counts: Record<string, number> = {
            ALL: mergedNotifications.length,
            UNREAD: mergedNotifications.filter((n) => !n.isRead).length,
            APPOINTMENT: 0,
            BILL: 0,
            WARNING: 0,
            SUCCESS: 0,
            INFO: 0,
        };
        for (const n of mergedNotifications) {
            const type = normalizeType(n.type);
            counts[type] = (counts[type] || 0) + 1;
        }
        return counts;
    }, [mergedNotifications]);

    const displayed = useMemo(() => {
        const term = search.trim().toLowerCase();
        return mergedNotifications.filter((n) => {
            const matchesSearch = !term
                || n.title.toLowerCase().includes(term)
                || n.message.toLowerCase().includes(term);
            if (!matchesSearch) return false;
            if (filter === 'ALL') return true;
            if (filter === 'UNREAD') return !n.isRead;
            return normalizeType(n.type) === filter;
        });
    }, [filter, mergedNotifications, search]);

    const navigateFromNotification = (notification: NotificationItem) => {
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            return;
        }

        const type = normalizeType(notification.type);
        if (user?.role === 'ADMIN') {
            if (type === 'APPOINTMENT') navigate('/admin/appointments');
            else if (type === 'BILL' || type === 'WARNING') navigate('/admin/billing');
            else navigate('/admin');
            return;
        }

        if (user?.role === 'DOCTOR') {
            if (type === 'APPOINTMENT') navigate('/doctor/appointments');
            else navigate('/doctor');
            return;
        }

        if (type === 'APPOINTMENT') navigate('/patient/appointments');
        else navigate('/patient');
    };

    const markRead = async (notification: NotificationItem) => {
        if (notification.isRead) return;
        if (notification.localOnly || notification.id <= 0) {
            setAdminActivity((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
            return;
        }
        try {
            await api.patch(`/notifications/${notification.id}/read`);
            setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
            setUnreadCount((current) => Math.max(0, current - 1));
        } catch {
            // ignore single-row failures
        }
    };

    const markAllRead = async () => {
        setActionMessage(null);
        try {
            if (unreadCount > 0 && user?.id) {
                await api.patch(`/notifications/user/${user.id}/read-all`);
            }
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
            setAdminActivity((prev) => prev.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(0);
        } catch {
            setActionMessage('Unable to mark all notifications as read.');
        }
    };

    const deleteNotification = async (notification: NotificationItem) => {
        setActionMessage(null);
        if (notification.localOnly || notification.id <= 0) {
            setAdminActivity((prev) => prev.filter((item) => item.id !== notification.id));
            return;
        }

        try {
            await api.delete(`/notifications/${notification.id}`);
            setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
            if (!notification.isRead) {
                setUnreadCount((current) => Math.max(0, current - 1));
            }
        } catch {
            setActionMessage('Unable to delete this notification.');
        }
    };

    const sendDigestToSelf = async () => {
        if (!user?.id) return;
        setActionMessage(null);
        try {
            const overdue = mergedNotifications.filter((n) => normalizeType(n.type) === 'WARNING').length;
            const appointments = mergedNotifications.filter((n) => normalizeType(n.type) === 'APPOINTMENT').length;
            const message = `Admin digest: ${appointments} appointment alerts and ${overdue} warning alerts are currently active.`;
            await api.post('/notifications', {
                userId: user.id,
                title: 'Admin activity digest',
                message,
                type: overdue > 0 ? 'WARNING' : 'INFO',
            });
            setActionMessage('Digest saved in your live notification feed.');
            await fetchNotifications(false);
        } catch (error: unknown) {
            setActionMessage(getApiErrorMessage(error, 'Unable to save digest right now.'));
        }
    };

    const sendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        const title = broadcastTitle.trim();
        const message = broadcastMessage.trim();
        if (!title || !message) {
            setActionMessage('Broadcast title and message are required.');
            return;
        }

        setBroadcastSubmitting(true);
        setActionMessage(null);
        try {
            const usersRes = await api.get('/admin/users?size=500&sort=username,asc');
            const listRaw = usersRes.data?.data?.content || usersRes.data?.data || [];
            const users: AdminUser[] = Array.isArray(listRaw) ? listRaw : [];
            const recipients = users.filter((u) =>
                u.id !== user?.id
                && (u.isActive ?? true)
                && (broadcastTargetRole === 'ALL' || String(u.role || '').toUpperCase() === broadcastTargetRole),
            );

            if (recipients.length === 0) {
                setActionMessage('No active recipients found for the selected role.');
                return;
            }

            const results = await Promise.allSettled(
                recipients.map((recipient) => api.post('/notifications', {
                    userId: recipient.id,
                    title,
                    message,
                    type: broadcastType,
                })),
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = recipients.length - successCount;

            await api.post('/notifications', {
                userId: user?.id,
                title: 'Broadcast report',
                message: `Announcement delivered to ${successCount}/${recipients.length} recipients${failedCount > 0 ? ` (${failedCount} failed)` : ''}.`,
                type: failedCount > 0 ? 'WARNING' : 'SUCCESS',
            });

            setActionMessage(`Broadcast delivered to ${successCount} recipient${successCount > 1 ? 's' : ''}.`);
            setBroadcastTitle('');
            setBroadcastMessage('');
            setShowBroadcast(false);
            await fetchNotifications(false);
        } catch (error: unknown) {
            setActionMessage(getApiErrorMessage(error, 'Broadcast failed. Please try again.'));
        } finally {
            setBroadcastSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                        <Bell className="h-7 w-7 text-blue-600" />
                        {effectiveUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {effectiveUnreadCount > 9 ? '9+' : effectiveUnreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Notifications</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {effectiveUnreadCount > 0
                                ? `${effectiveUnreadCount} unread notification${effectiveUnreadCount > 1 ? 's' : ''}`
                                : 'All caught up!'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => void fetchNotifications(false)} isLoading={refreshing}>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    {effectiveUnreadCount > 0 && (
                        <Button variant="outline" onClick={markAllRead} className="gap-2 text-sm">
                            <CheckCheck className="h-4 w-4" /> Mark All Read
                        </Button>
                    )}
                    {isAdmin && (
                        <>
                            <Button variant="outline" onClick={sendDigestToSelf} className="gap-2 text-sm">
                                <ClipboardList className="h-4 w-4" /> Save Digest
                            </Button>
                            <Button onClick={() => setShowBroadcast(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                <Megaphone className="h-4 w-4" /> Broadcast
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Alerts', value: typeSummary.ALL, color: 'text-slate-700' },
                    { label: 'Unread', value: typeSummary.UNREAD, color: 'text-blue-600' },
                    { label: 'Appointments', value: typeSummary.APPOINTMENT, color: 'text-emerald-600' },
                    { label: 'Billing / Warning', value: (typeSummary.BILL || 0) + (typeSummary.WARNING || 0), color: 'text-amber-600' },
                ].map((card) => (
                    <div key={card.label} className="stat-card text-center">
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search title or message..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh((prev) => !prev)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            autoRefresh
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-[var(--border-color)] hover:border-blue-300 text-[var(--text-muted)]'
                        }`}
                    >
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((value) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            filter === value
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-[var(--border-color)] hover:border-blue-300 text-[var(--text-muted)]'
                        }`}
                    >
                        {value} {typeSummary[value] ? `(${typeSummary[value]})` : ''}
                    </button>
                ))}
            </div>

            {actionMessage && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-4 py-3 text-sm">
                    {actionMessage}
                </div>
            )}

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : displayed.length === 0 ? (
                        <div className="text-center py-16">
                            <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>
                                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications found'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                {isAdmin
                                    ? 'Try refresh, change filters, or send a broadcast update.'
                                    : 'Notifications will appear here as activity occurs.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {displayed.map((notification) => {
                                const type = normalizeType(notification.type);
                                const Icon = typeIcon[type] || Info;
                                const color = typeColor[type] || typeColor.INFO;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start gap-4 px-5 py-4 transition-all ${
                                            !notification.isRead
                                                ? 'bg-blue-50/40 dark:bg-blue-900/10'
                                                : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/20'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-color)' }}>
                                                    {notification.title}
                                                    {!notification.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 align-middle" />}
                                                    {notification.localOnly && (
                                                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                                                            Insight
                                                        </span>
                                                    )}
                                                </p>
                                                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                    {toTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{notification.message}</p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => void markRead(notification)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCheck className="h-4 w-4 text-blue-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigateFromNotification(notification)}
                                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                title="Open related page"
                                            >
                                                <ArrowRight className="h-4 w-4 text-emerald-600" />
                                            </button>
                                            <button
                                                onClick={() => void deleteNotification(notification)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isAdmin && showBroadcast && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBroadcast(false)}>
                    <div
                        className="w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fadeIn"
                        style={{ background: 'var(--card-bg)' }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Broadcast Notification</h3>
                            <button onClick={() => setShowBroadcast(false)}>
                                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={sendBroadcast}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Recipient Role</label>
                                    <select
                                        value={broadcastTargetRole}
                                        onChange={(e) => setBroadcastTargetRole(e.target.value as 'PATIENT' | 'DOCTOR' | 'ALL')}
                                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)]"
                                    >
                                        <option value="ALL">All Users</option>
                                        <option value="DOCTOR">Doctors</option>
                                        <option value="PATIENT">Patients</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Priority</label>
                                    <select
                                        value={broadcastType}
                                        onChange={(e) => setBroadcastType(e.target.value as 'INFO' | 'WARNING' | 'SUCCESS')}
                                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)]"
                                    >
                                        <option value="INFO">Info</option>
                                        <option value="WARNING">Warning</option>
                                        <option value="SUCCESS">Success</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Title</label>
                                <Input
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="Ex: System maintenance window"
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Message</label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    className="w-full min-h-[95px] p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] text-sm"
                                    placeholder="Write the message to send..."
                                    maxLength={450}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowBroadcast(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" isLoading={broadcastSubmitting}>
                                    Send Broadcast
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
