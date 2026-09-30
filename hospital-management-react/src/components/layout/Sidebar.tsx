import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import {
    LayoutDashboard,
    CalendarCheck,
    CalendarPlus,
    FileText,
    Pill,
    CreditCard,
    MessageSquare,
    LogOut,
    Heart,
    Users,
    Stethoscope,
    ClipboardList,
    BarChart3,
    Settings,
    Bell,
    Activity,
    Upload,
    Package,
    BedDouble,
    ShieldCheck,
    HeartPulse,
    Headphones,
    MessageSquareHeart,
    ArrowRightLeft,
    CalendarClock,
    Ambulance,
    IdCard,
    Utensils,
    Sparkles,
    Search,
    ChevronRight,
} from 'lucide-react';
import { ProfileAvatar } from '../ui/ProfileAvatar';

interface SidebarProps {
    userRole: string;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

type NavItem = {
    name: string;
    path: string;
    icon: React.FC<{ className?: string }>;
    exact?: boolean;
    badge?: string;
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

const getNavGroups = (role: string): NavGroup[] => {
    const base = role.toLowerCase();

    if (role === 'ADMIN') {
        return [
            {
                title: 'Core Command',
                items: [
                    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
                    { name: 'Operations Center', path: '/admin/operations', icon: ShieldCheck, badge: 'Live' },
                    { name: 'Command Alerts', path: '/admin/command-alerts', icon: Bell },
                    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
                    { name: 'Bed Capacity', path: '/admin/beds', icon: BedDouble },
                ],
            },
            {
                title: 'Clinical Governance',
                items: [
                    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
                    { name: 'Patients', path: '/admin/patients', icon: Users },
                    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
                    { name: 'Waitlist Board', path: '/admin/waitlist', icon: CalendarClock },
                    { name: 'Handoff Monitor', path: '/admin/handoffs', icon: ClipboardList },
                    { name: 'Discharge Board', path: '/admin/discharge', icon: ClipboardList },
                    { name: 'Referral Desk', path: '/admin/referrals', icon: ArrowRightLeft },
                ],
            },
            {
                title: 'Logistics & Supply',
                items: [
                    { name: 'Transport Dispatch', path: '/admin/transport', icon: Ambulance },
                    { name: 'Visitor Passes', path: '/admin/visitors', icon: IdCard },
                    { name: 'Nutrition Desk', path: '/admin/nutrition', icon: Utensils },
                    { name: 'Housekeeping', path: '/admin/housekeeping', icon: Sparkles },
                    { name: 'Pharmacy Queue', path: '/admin/pharmacy', icon: Pill },
                    { name: 'Inventory Stock', path: '/admin/inventory', icon: Package },
                ],
            },
            {
                title: 'Finance & Risk',
                items: [
                    { name: 'Billing Center', path: '/admin/billing', icon: CreditCard },
                    { name: 'Insurance Desk', path: '/admin/insurance', icon: ShieldCheck },
                    { name: 'Risk Center', path: '/admin/risk', icon: ShieldCheck },
                    { name: 'Patient Experience', path: '/admin/experience', icon: MessageSquareHeart },
                    { name: 'Support Desk', path: '/admin/support', icon: Headphones },
                    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
                    { name: 'System Settings', path: '/admin/settings', icon: Settings },
                ],
            },
        ];
    }

    if (role === 'DOCTOR') {
        return [
            {
                title: 'Clinical Desk',
                items: [
                    { name: 'Overview', path: '/doctor', icon: LayoutDashboard, exact: true },
                    { name: 'My Appointments', path: '/doctor/appointments', icon: CalendarCheck },
                    { name: 'My Patients', path: '/doctor/patients', icon: Users },
                    { name: 'Triage Queue', path: '/doctor/triage', icon: ShieldCheck, badge: 'Urgent' },
                    { name: 'Safety Reports', path: '/doctor/safety', icon: ShieldCheck },
                ],
            },
            {
                title: 'Patient Orders & EMR',
                items: [
                    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
                    { name: 'Medical Records', path: '/doctor/medical-records', icon: FileText },
                    { name: 'Lab Orders', path: '/doctor/lab-orders', icon: ClipboardList },
                    { name: 'Clinical Handoffs', path: '/doctor/handoffs', icon: ClipboardList },
                    { name: 'Discharge Planner', path: '/doctor/discharge', icon: ClipboardList },
                    { name: 'Referrals', path: '/doctor/referrals', icon: ArrowRightLeft },
                ],
            },
            {
                title: 'Practice & Comms',
                items: [
                    { name: 'Availability', path: '/doctor/availability', icon: Activity },
                    { name: 'Messages & Alerts', path: '/doctor/messages', icon: MessageSquare },
                    { name: 'Settings', path: '/doctor/settings', icon: Settings },
                ],
            },
        ];
    }

    // PATIENT
    return [
        {
            title: 'My Health Journey',
            items: [
                { name: 'Overview', path: `/${base}`, icon: LayoutDashboard, exact: true },
                { name: 'My Appointments', path: `/${base}/appointments`, icon: CalendarCheck },
                { name: 'Book Appointment', path: `/${base}/book-appointment`, icon: CalendarPlus, badge: 'Book' },
                { name: 'Waitlist Status', path: `/${base}/waitlist`, icon: CalendarClock },
                { name: 'Care Plan', path: `/${base}/care-plan`, icon: HeartPulse },
                { name: 'Vitals Tracker', path: `/${base}/vitals`, icon: Activity },
            ],
        },
        {
            title: 'Records & Rx',
            items: [
                { name: 'Medical Records', path: `/${base}/medical-records`, icon: FileText },
                { name: 'Medical Reports', path: `/${base}/medical-reports`, icon: Upload },
                { name: 'Prescriptions', path: `/${base}/prescriptions`, icon: Pill },
                { name: 'Medication Refills', path: `/${base}/refills`, icon: Pill },
                { name: 'Discharge Info', path: `/${base}/discharge`, icon: ClipboardList },
            ],
        },
        {
            title: 'Hospital Services',
            items: [
                { name: 'Emergency Transport', path: `/${base}/transport`, icon: Ambulance },
                { name: 'Visitor Passes', path: `/${base}/visitors`, icon: IdCard },
                { name: 'Dietary Meals', path: `/${base}/meals`, icon: Utensils },
                { name: 'Room Services', path: `/${base}/room-services`, icon: Sparkles },
                { name: 'Referrals', path: `/${base}/referrals`, icon: ArrowRightLeft },
            ],
        },
        {
            title: 'Billing & Support',
            items: [
                { name: 'Billing & Invoices', path: `/${base}/billing`, icon: CreditCard },
                { name: 'Insurance Preauth', path: `/${base}/insurance`, icon: ShieldCheck },
                { name: 'Support Center', path: `/${base}/support`, icon: Headphones },
                { name: 'Patient Feedback', path: `/${base}/feedback`, icon: MessageSquareHeart },
                { name: 'Messages', path: `/${base}/messages`, icon: MessageSquare },
                { name: 'Settings', path: `/${base}/settings`, icon: Settings },
            ],
        },
    ];
};

const roleColors: Record<string, string> = {
    ADMIN: 'bg-violet-600 shadow-violet-600/30',
    DOCTOR: 'bg-teal-600 shadow-teal-600/30',
    PATIENT: 'bg-blue-600 shadow-blue-600/30',
};

const roleGlowColors: Record<string, string> = {
    ADMIN: 'rgba(124, 58, 237, 0.15)',
    DOCTOR: 'rgba(13, 148, 136, 0.15)',
    PATIENT: 'rgba(37, 99, 235, 0.15)',
};

const roleBorders: Record<string, string> = {
    ADMIN: 'rgba(147, 51, 234, 0.2)',
    DOCTOR: 'rgba(13, 148, 136, 0.2)',
    PATIENT: 'rgba(37, 99, 235, 0.2)',
};

const Sidebar: React.FC<SidebarProps> = ({ userRole, mobileMenuOpen, setMobileMenuOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navGroups = getNavGroups(userRole);
    const accentClass = roleColors[userRole] || 'bg-blue-600 shadow-blue-600/30';
    const glowColor = roleGlowColors[userRole] || 'rgba(37, 99, 235, 0.15)';
    const borderColor = roleBorders[userRole] || 'rgba(37, 99, 235, 0.2)';

    // Filter nav items by search query if user types in quick filter
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return navGroups;
        const q = searchQuery.toLowerCase();
        return navGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.name.toLowerCase().includes(q)),
            }))
            .filter((group) => group.items.length > 0);
    }, [navGroups, searchQuery]);

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}
            style={{
                background: 'linear-gradient(180deg, var(--sidebar-bg) 0%, color-mix(in srgb, var(--sidebar-bg) 94%, var(--primary) 6%) 100%)',
                borderRight: '1px solid var(--border-color)',
                boxShadow: '10px 0 35px rgba(15,23,42,0.04)',
            }}
        >
            <div className="flex flex-col h-full">
                {/* ── Brand Header ── */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${accentClass} text-white shadow-md ring-2 ring-white/20 dark:ring-white/10`}>
                            <Heart className="h-5 w-5 fill-current" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-color)' }}>MediCare</span>
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">OS Pro</span>
                            </div>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Hospital Intelligence</p>
                        </div>
                    </div>
                </div>

                {/* ── User Profile Card ── */}
                <div
                    className="mx-3 mt-2 rounded-xl p-2.5 shadow-sm transition-all"
                    style={{
                        background: glowColor,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <ProfileAvatar
                                profilePictureUrl={user?.profilePictureUrl}
                                name={user?.fullName || user?.username}
                                className="h-8 w-8 rounded-lg border border-white/50 text-xs shadow-sm dark:border-slate-800"
                                fallbackClassName={accentClass}
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[var(--sidebar-bg)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate leading-tight" style={{ color: 'var(--text-color)' }}>
                                {user?.fullName || user?.username}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1 rounded bg-white/40 dark:bg-slate-800/40" style={{ color: 'var(--text-muted)' }}>
                                    {userRole}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Quick Filter Bar ── */}
                <div className="px-3 pt-2 pb-1">
                    <div className="relative flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter menu..."
                            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 text-xs text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Grouped Navigation Links ── */}
                <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-2.5">
                    {filteredGroups.map((group) => (
                        <div key={group.title} className="space-y-0.5">
                            <p className="px-2.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {group.title}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.exact}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                                isActive
                                                    ? `${accentClass} text-white shadow-md font-bold`
                                                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                                            }`
                                        }
                                        style={({ isActive }) => ({
                                            color: isActive ? 'white' : 'var(--text-muted)',
                                        })}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="flex items-center min-w-0">
                                                    <item.icon className={`mr-2.5 h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                                                    <span className="truncate">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    {item.badge && (
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                            isActive
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <ChevronRight className="h-3.5 w-3.5 text-white/80" />
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* ── System Status & Logout ── */}
                <div className="border-t p-2.5 space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="px-2 py-1 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-500">Core Network</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            99.98% Live
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/40"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out Session
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
