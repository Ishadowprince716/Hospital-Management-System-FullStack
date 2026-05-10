import React from 'react';
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
} from 'lucide-react';
import { getProfileImageUrl } from '../../utils/profileImage';

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
};

const getNavItems = (role: string): NavItem[] => {
    const base = role.toLowerCase();

    if (role === 'ADMIN') {
        return [
            { name: 'Overview',        path: `/admin`,              icon: LayoutDashboard, exact: true },
            { name: 'Doctors',         path: `/admin/doctors`,      icon: Stethoscope },
            { name: 'Patients',        path: `/admin/patients`,     icon: Users },
            { name: 'Appointments',    path: `/admin/appointments`, icon: CalendarCheck },
            { name: 'Analytics',       path: `/admin/analytics`,    icon: BarChart3 },
            { name: 'Billing',         path: `/admin/billing`,      icon: CreditCard },
            { name: 'Notifications',   path: `/admin/notifications`,icon: Bell },
            { name: 'Settings',        path: `/admin/settings`,     icon: Settings },
        ];
    }

    if (role === 'DOCTOR') {
        return [
            { name: 'Overview',          path: `/doctor`,                     icon: LayoutDashboard, exact: true },
            { name: 'My Appointments',   path: `/doctor/appointments`,        icon: CalendarCheck },
            { name: 'Patients',          path: `/doctor/patients`,            icon: Users },
            { name: 'Prescriptions',     path: `/doctor/prescriptions`,       icon: Pill },
            { name: 'Medical Records',   path: `/doctor/medical-records`,     icon: FileText },
            { name: 'Lab Orders',        path: `/doctor/lab-orders`,          icon: ClipboardList },
            { name: 'Availability',      path: `/doctor/availability`,        icon: Activity },
            { name: 'Messages',          path: `/doctor/messages`,            icon: MessageSquare },
            { name: 'Settings',          path: `/doctor/settings`,            icon: Settings },
        ];
    }

    // PATIENT (default)
    return [
        { name: 'Overview',           path: `/${base}`,                         icon: LayoutDashboard, exact: true },
        { name: 'My Appointments',    path: `/${base}/appointments`,             icon: CalendarCheck },
        { name: 'Book Appointment',   path: `/${base}/book-appointment`,         icon: CalendarPlus },
        { name: 'Medical Records',    path: `/${base}/medical-records`,          icon: FileText },
        { name: 'Medical Reports',    path: `/${base}/medical-reports`,          icon: Upload },
        { name: 'Prescriptions',      path: `/${base}/prescriptions`,            icon: Pill },
        { name: 'Billing',            path: `/${base}/billing`,                  icon: CreditCard },
        { name: 'Messages',           path: `/${base}/messages`,                 icon: MessageSquare },
        { name: 'Settings',           path: `/${base}/settings`,                 icon: Settings },
    ];
};

const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-600',
    DOCTOR: 'bg-teal-600',
    PATIENT: 'bg-blue-600',
};

const roleSoftStyles: Record<string, string> = {
    ADMIN: 'rgba(147,51,234,0.08)',
    DOCTOR: 'rgba(13,148,136,0.08)',
    PATIENT: 'rgba(37,99,235,0.08)',
};

const roleBorders: Record<string, string> = {
    ADMIN: 'rgba(147,51,234,0.16)',
    DOCTOR: 'rgba(13,148,136,0.16)',
    PATIENT: 'rgba(37,99,235,0.16)',
};

const Sidebar: React.FC<SidebarProps> = ({ userRole, mobileMenuOpen, setMobileMenuOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = getNavItems(userRole);
    const accentColor = roleColors[userRole] || 'bg-blue-600';
    const profileImage = getProfileImageUrl(user?.profilePictureUrl);

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
        `}
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)' }}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${accentColor} shadow-lg mr-3`}>
                        <Heart className="h-5 w-5 text-white fill-current" />
                    </div>
                    <div>
                        <span className="text-base font-bold" style={{ color: 'var(--text-color)' }}>MediCare</span>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>HMS</p>
                    </div>
                </div>

                {/* User badge */}
                <div
                    className="mx-3 mt-3 rounded-lg px-4 py-3"
                    style={{
                        background: roleSoftStyles[userRole] || roleSoftStyles.PATIENT,
                        border: `1px solid ${roleBorders[userRole] || roleBorders.PATIENT}`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt=""
                                className="h-8 w-8 rounded-full border border-[var(--border-color)] object-cover"
                            />
                        ) : (
                            <div className={`w-8 h-8 rounded-full ${accentColor} flex items-center justify-center text-white text-sm font-bold`}>
                                {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-color)' }}>
                                {user?.fullName || user?.username}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {userRole.charAt(0) + userRole.slice(1).toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                    isActive
                                        ? `${accentColor} text-white shadow-md`
                                        : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`
                            }
                            style={({ isActive }) => ({
                                color: isActive ? 'white' : 'var(--text-muted)',
                            })}
                        >
                            <item.icon className="mr-3 h-4 w-4 shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="border-t p-3" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
