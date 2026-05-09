import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, Loader2, BellOff, Info, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const typeIcon: Record<string, React.FC<{ className?: string }>> = {
    APPOINTMENT: Calendar,
    WARNING:     AlertTriangle,
    SUCCESS:     CheckCircle2,
    INFO:        Info,
};
const typeColor: Record<string, string> = {
    APPOINTMENT: 'text-blue-600 bg-blue-100',
    WARNING:     'text-amber-600 bg-amber-100',
    SUCCESS:     'text-emerald-600 bg-emerald-100',
    INFO:        'text-purple-600 bg-purple-100',
};

const Notifications: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get(`/notifications/user/${user?.id}?size=50`),
                api.get(`/notifications/user/${user?.id}/unread-count`),
            ]);
            setNotifications(notifRes.data?.data?.content || notifRes.data?.data || []);
            setUnreadCount(countRes.data?.data?.count || 0);
        } catch { setNotifications([]); }
        finally { setLoading(false); }
    }, [user?.id]);

    useEffect(() => { if (user?.id) fetchNotifications(); }, [fetchNotifications]);

    // PATCH — mark single as read
    const markRead = async (id: number) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch { /* silent */ }
    };

    // PATCH — mark all as read
    const markAllRead = async () => {
        try {
            await api.patch(`/notifications/user/${user?.id}/read-all`);
            setNotifications(n => n.map(x => ({ ...x, isRead: true })));
            setUnreadCount(0);
        } catch { alert('Failed to mark all as read.'); }
    };

    // DELETE — remove notification
    const deleteNotif = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`);
            const was = notifications.find(n => n.id === id);
            setNotifications(n => n.filter(x => x.id !== id));
            if (was && !was.isRead) setUnreadCount(c => Math.max(0, c - 1));
        } catch { /* silent */ }
    };

    const displayed = filter === 'UNREAD'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)   return 'just now';
        if (mins < 60)  return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)   return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="h-7 w-7 text-blue-600" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Notifications</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllRead} className="gap-2 text-sm">
                            <CheckCheck className="h-4 w-4" /> Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['ALL', 'UNREAD'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'border-[var(--border-color)] hover:border-blue-300'}`}
                        style={{ color: filter === f ? 'white' : 'var(--text-muted)' }}>
                        {f} {f === 'UNREAD' && unreadCount > 0 && `(${unreadCount})`}
                    </button>
                ))}
            </div>

            <Card className="border-[var(--border-color)] shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : displayed.length === 0 ? (
                        <div className="text-center py-16">
                            <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-base font-medium" style={{ color: 'var(--text-color)' }}>
                                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                {filter === 'UNREAD' ? 'Switch to All to see past notifications.' : 'Notifications will appear here as activity occurs.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-color)]">
                            {displayed.map(notif => {
                                const type = (notif.type || 'INFO').toUpperCase();
                                const Icon = typeIcon[type] || Info;
                                const color = typeColor[type] || typeColor.INFO;
                                return (
                                    <div key={notif.id}
                                        className={`flex items-start gap-4 px-5 py-4 transition-all ${!notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/20'}`}>
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold leading-snug ${!notif.isRead ? 'text-[var(--text-color)]' : ''}`}
                                                    style={{ color: 'var(--text-color)' }}>
                                                    {notif.title}
                                                    {!notif.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 align-middle" />}
                                                </p>
                                                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(notif.createdAt)}</span>
                                            </div>
                                            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{notif.message}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!notif.isRead && (
                                                <button onClick={() => markRead(notif.id)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="Mark as read">
                                                    <CheckCheck className="h-4 w-4 text-blue-600" />
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotif(notif.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
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
        </div>
    );
};

export default Notifications;
