import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import type { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import api from '../../api';
import { getProfileImageUrl } from '../../utils/profileImage';

interface NavbarProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

// ─── Live unread badge — polls every 30s ────────────────────────────────────
function useUnreadCount(userId?: number) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const fetch = async () => {
            try {
                const res = await api.get(`/notifications/user/${userId}/unread-count`);
                setCount(res.data?.data?.count || 0);
            } catch { /* silent */ }
        };

        fetch(); // immediate
        const id = setInterval(fetch, 30_000); // every 30 seconds
        return () => clearInterval(id);
    }, [userId]);

    return count;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
    '/patient': { title: 'Patient Overview', subtitle: 'Your care timeline, appointments, and health shortcuts.' },
    '/patient/appointments': { title: 'My Appointments', subtitle: 'Track visits, cancellations, and video consultations.' },
    '/patient/book-appointment': { title: 'Book Appointment', subtitle: 'Choose a doctor, date, time, and visit reason.' },
    '/patient/medical-records': { title: 'Medical Records', subtitle: 'Diagnoses, treatment notes, and visit history.' },
    '/patient/medical-reports': { title: 'Medical Reports', subtitle: 'Lab files, report downloads, and AI-assisted insights.' },
    '/patient/prescriptions': { title: 'Prescriptions', subtitle: 'Medication plans and doctor instructions.' },
    '/patient/billing': { title: 'Billing & Payments', subtitle: 'Invoices, balances, and payment status.' },
    '/patient/messages': { title: 'Messages & Alerts', subtitle: 'Notifications and care updates from the portal.' },
    '/patient/settings': { title: 'Settings', subtitle: 'Profile, security, and portal preferences.' },
    '/doctor': { title: 'Doctor Overview', subtitle: 'Today\'s schedule, patient activity, and clinical shortcuts.' },
    '/doctor/appointments': { title: 'My Appointments', subtitle: 'Review visits, update statuses, and start consultations.' },
    '/doctor/patients': { title: 'My Patients', subtitle: 'Patients connected through your appointment history.' },
    '/doctor/prescriptions': { title: 'Prescriptions', subtitle: 'Create medication plans and track active prescriptions.' },
    '/doctor/medical-records': { title: 'Medical Records', subtitle: 'Write visit notes, diagnoses, and treatment plans.' },
    '/doctor/lab-orders': { title: 'Lab Orders', subtitle: 'Order tests and monitor pending results.' },
    '/doctor/availability': { title: 'Availability', subtitle: 'Manage weekly working hours and booking windows.' },
    '/doctor/messages': { title: 'Messages & Alerts', subtitle: 'Notifications and patient care updates.' },
    '/doctor/settings': { title: 'Settings', subtitle: 'Profile, security, and portal preferences.' },
};

const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const unreadCount = useUnreadCount(user?.id);
    const navigate = useNavigate();
    const location = useLocation();
    const meta = pageMeta[location.pathname] || {
        title: 'MediCare HMS',
        subtitle: `${(user?.role || 'User').toLowerCase()} portal`,
    };

    const roleColor: Record<string, string> = {
        ADMIN:   'from-purple-500 to-purple-700',
        DOCTOR:  'from-teal-500 to-teal-700',
        PATIENT: 'from-blue-500 to-blue-700',
    };
    const gradient = roleColor[user?.role || 'PATIENT'] || roleColor.PATIENT;
    const profileImage = getProfileImageUrl(user?.profilePictureUrl);

    const notifPath: Record<string, string> = {
        ADMIN:   '/admin/notifications',
        DOCTOR:  '/doctor/messages',
        PATIENT: '/patient/messages',
    };

    const settingsPath: Record<string, string> = {
        ADMIN:   '/admin/settings',
        DOCTOR:  '/doctor/settings',
        PATIENT: '/patient/settings',
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 h-16 border-b border-[var(--border-color)] bg-[var(--card-bg)]/95 backdrop-blur transition-all duration-300">
            <div className="px-4 h-full flex items-center justify-between">

                {/* Left: Mobile toggle + page title */}
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none dark:hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-base font-bold leading-tight sm:text-lg" style={{ color: 'var(--text-color)' }}>
                                {meta.title}
                            </h1>
                            <span className="hidden rounded-full px-2 py-0.5 text-xs font-semibold capitalize sm:inline-flex"
                                style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}>
                                {(user?.role || '').toLowerCase()}
                            </span>
                        </div>
                        <p className="hidden truncate text-xs lg:block" style={{ color: 'var(--text-muted)' }}>
                            {meta.subtitle}
                        </p>
                    </div>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-2">

                    {/* 🔔 Live Notification Bell */}
                    <button
                        onClick={() => navigate(notifPath[user?.role || 'PATIENT'] || '/patient/messages')}
                        className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" style={{ color: 'var(--text-color)' }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* 🌙/☀️ Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark'
                            ? <Sun className="h-5 w-5 text-amber-400" />
                            : <Moon className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                        }
                    </button>

                    {/* User profile chip */}
                    <button
                        onClick={() => navigate(settingsPath[user?.role || 'PATIENT'] || '/patient/settings')}
                        className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)] hover:opacity-80 transition-opacity"
                        title="Settings"
                    >
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-color)' }}>
                                {user?.fullName || user?.username}
                            </p>
                            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                                {(user?.role || '').toLowerCase()}
                            </p>
                        </div>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt=""
                                className="h-9 w-9 rounded-lg border border-[var(--border-color)] object-cover shadow-md"
                            />
                        ) : (
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
