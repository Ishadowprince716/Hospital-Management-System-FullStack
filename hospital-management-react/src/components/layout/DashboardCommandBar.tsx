import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Activity,
    BarChart3,
    CalendarCheck,
    CalendarPlus,
    CreditCard,
    FileText,
    MessageSquare,
    RefreshCw,
    Search,
    Settings,
    ShieldCheck,
    Stethoscope,
    Users,
    Wifi,
    WifiOff,
    type LucideIcon,
} from 'lucide-react';
import type { RootState } from '../../store';
import { API_ORIGIN } from '../../api';

type ApiState = 'checking' | 'online' | 'offline';

type QuickAction = {
    label: string;
    path: string;
    icon: LucideIcon;
    tone: string;
};

const roleHome: Record<string, string> = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    PATIENT: '/patient',
};

const quickActionsByRole: Record<string, QuickAction[]> = {
    ADMIN: [
        { label: 'Appointments', path: '/admin/appointments', icon: CalendarCheck, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope, tone: 'text-teal-600 bg-teal-50 border-teal-100' },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
        { label: 'Billing', path: '/admin/billing', icon: CreditCard, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    ],
    DOCTOR: [
        { label: 'Schedule', path: '/doctor/appointments', icon: CalendarCheck, tone: 'text-teal-600 bg-teal-50 border-teal-100' },
        { label: 'Patients', path: '/doctor/patients', icon: Users, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Records', path: '/doctor/medical-records', icon: FileText, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
        { label: 'Availability', path: '/doctor/availability', icon: Activity, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    ],
    PATIENT: [
        { label: 'Book', path: '/patient/book-appointment', icon: CalendarPlus, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Visits', path: '/patient/appointments', icon: CalendarCheck, tone: 'text-teal-600 bg-teal-50 border-teal-100' },
        { label: 'Records', path: '/patient/medical-records', icon: FileText, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
        { label: 'Billing', path: '/patient/billing', icon: CreditCard, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
    ],
};

const sectionLabels: Record<string, string> = {
    admin: 'Admin command center',
    doctor: 'Clinical workspace',
    patient: 'Patient care portal',
    appointments: 'Appointments',
    doctors: 'Doctors',
    patients: 'Patients',
    analytics: 'Analytics',
    billing: 'Billing',
    notifications: 'Notifications',
    messages: 'Messages',
    settings: 'Settings',
    prescriptions: 'Prescriptions',
    availability: 'Availability',
    'medical-records': 'Medical records',
    'medical-reports': 'Medical reports',
    'book-appointment': 'Booking',
};

const getCurrentSection = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || parts[0] || 'dashboard';
    return sectionLabels[last] || last.replace(/-/g, ' ');
};

const DashboardCommandBar: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const [apiState, setApiState] = useState<ApiState>('checking');
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);
    const [now, setNow] = useState(() => new Date());

    const role = user?.role || 'PATIENT';
    const actions = quickActionsByRole[role] || quickActionsByRole.PATIENT;
    const homePath = roleHome[role] || '/patient';

    const currentSection = useMemo(() => getCurrentSection(location.pathname), [location.pathname]);

    useEffect(() => {
        const updateOnline = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
        return () => {
            window.removeEventListener('online', updateOnline);
            window.removeEventListener('offline', updateOnline);
        };
    }, []);

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const checkApi = async () => {
            try {
                const response = await fetch(`${API_ORIGIN}/ready`, { cache: 'no-store' });
                if (!cancelled) setApiState(response.ok ? 'online' : 'offline');
            } catch {
                if (!cancelled) setApiState('offline');
            }
        };

        checkApi();
        const id = window.setInterval(checkApi, 60_000);
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, []);

    const apiLabel = apiState === 'checking' ? 'Checking API' : apiState === 'online' ? 'API online' : 'API offline';
    const ApiIcon = apiState === 'offline' || !isOnline ? WifiOff : Wifi;

    return (
        <section className="mb-5 rounded-lg border border-[var(--border-color)] bg-[var(--card-elevated)] px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(homePath)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm font-bold text-[var(--text-color)] transition hover:border-[var(--border-strong)] hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                        {currentSection}
                    </button>
                    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${apiState === 'offline' || !isOnline ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        <ApiIcon className="h-4 w-4" />
                        {isOnline ? apiLabel : 'Browser offline'}
                    </div>
                    <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] sm:inline-flex">
                        <RefreshCw className="h-3.5 w-3.5" />
                        {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(role === 'ADMIN' ? '/admin/notifications' : role === 'DOCTOR' ? '/doctor/messages' : '/patient/messages')}
                        className="hidden items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-color)] md:inline-flex"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Messages
                    </button>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] lg:inline-flex">
                        <Search className="h-3.5 w-3.5" />
                        Press Ctrl K for commands
                    </div>
                    {actions.map((action) => {
                        const Icon = action.icon;
                        const isActive = location.pathname === action.path;
                        return (
                            <button
                                key={action.path}
                                type="button"
                                onClick={() => navigate(action.path)}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-sm ${isActive ? action.tone : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-color)]'}`}
                            >
                                <Icon className="h-4 w-4" />
                                {action.label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => navigate(`${homePath}/settings`)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-color)]"
                        title="Settings"
                        aria-label="Settings"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default DashboardCommandBar;
