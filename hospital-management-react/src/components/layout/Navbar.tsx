import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Moon, Sun, Search, ChevronRight } from 'lucide-react';
import { useKBar } from 'kbar';
import type { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import api from '../../api';
import { ProfileAvatar } from '../ui/ProfileAvatar';

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

const pageMeta: Record<string, { title: string; subtitle: string; category?: string }> = {
    '/patient': { title: 'Patient Overview', subtitle: 'Your care timeline, appointments, and health shortcuts.', category: 'Portal' },
    '/patient/appointments': { title: 'My Appointments', subtitle: 'Track visits, cancellations, and video consultations.', category: 'Care' },
    '/patient/book-appointment': { title: 'Book Appointment', subtitle: 'Choose a doctor, date, time, and visit reason.', category: 'Care' },
    '/patient/waitlist': { title: 'Appointment Waitlist', subtitle: 'Monitor standby slots and queue notifications.', category: 'Care' },
    '/patient/care-plan': { title: 'Active Care Plan', subtitle: 'Recovery goals, vital milestones, and provider care guidelines.', category: 'Care' },
    '/patient/vitals': { title: 'Vitals Tracker', subtitle: 'Log blood pressure, glucose, oxygen, and heart metrics.', category: 'Care' },
    '/patient/medical-records': { title: 'Medical Records', subtitle: 'Diagnoses, treatment notes, and visit history.', category: 'Records' },
    '/patient/medical-reports': { title: 'Medical Reports', subtitle: 'Lab files, report downloads, and AI-assisted insights.', category: 'Records' },
    '/patient/prescriptions': { title: 'Prescriptions', subtitle: 'Medication plans and doctor instructions.', category: 'Records' },
    '/patient/refills': { title: 'Medication Refills', subtitle: 'Request pharmacy refills and delivery status.', category: 'Records' },
    '/patient/discharge': { title: 'Discharge Instructions', subtitle: 'Post-visit recovery guidance and care follow-up.', category: 'Records' },
    '/patient/transport': { title: 'Emergency Transport', subtitle: 'Request emergency ambulance transit to hospital ward.', category: 'Services' },
    '/patient/visitors': { title: 'Visitor Passes', subtitle: 'Register visiting family members and guest slots.', category: 'Services' },
    '/patient/meals': { title: 'Dietary Meals', subtitle: 'Nutritional food orders during in-patient hospital stay.', category: 'Services' },
    '/patient/room-services': { title: 'Room Services', subtitle: 'Housekeeping, room amenities, and nurse requests.', category: 'Services' },
    '/patient/billing': { title: 'Billing & Payments', subtitle: 'Invoices, balances, and payment status.', category: 'Finance' },
    '/patient/insurance': { title: 'Insurance Preauth', subtitle: 'Submit health insurance claims and check approval status.', category: 'Finance' },
    '/patient/support': { title: 'Support Center', subtitle: 'Get prompt assistance from patient concierge.', category: 'Help' },
    '/patient/feedback': { title: 'Patient Feedback', subtitle: 'Rate your hospital care experience and doctor consultation.', category: 'Help' },
    '/patient/messages': { title: 'Messages & Alerts', subtitle: 'Notifications and care updates from the portal.', category: 'Comms' },
    '/patient/settings': { title: 'Settings', subtitle: 'Profile, security, and portal preferences.', category: 'Account' },

    '/doctor': { title: 'Doctor Overview', subtitle: 'Today\'s schedule, patient activity, and clinical shortcuts.', category: 'Clinical' },
    '/doctor/appointments': { title: 'My Appointments', subtitle: 'Review visits, update statuses, and start consultations.', category: 'Clinical' },
    '/doctor/patients': { title: 'My Patients', subtitle: 'Patients connected through your appointment history.', category: 'Clinical' },
    '/doctor/triage': { title: 'Triage Queue', subtitle: 'Prioritize acute cases based on AI symptom triage.', category: 'Clinical' },
    '/doctor/safety': { title: 'Safety Reports', subtitle: 'Review clinical safety logs and incident audits.', category: 'Clinical' },
    '/doctor/prescriptions': { title: 'Prescriptions', subtitle: 'Create medication plans and track active prescriptions.', category: 'Orders' },
    '/doctor/medical-records': { title: 'Medical Records', subtitle: 'Write visit notes, diagnoses, and treatment plans.', category: 'Orders' },
    '/doctor/lab-orders': { title: 'Lab Orders', subtitle: 'Order tests and monitor pending results.', category: 'Orders' },
    '/doctor/handoffs': { title: 'Clinical Handoffs', subtitle: 'SBAR shift handoffs and care transfers.', category: 'Orders' },
    '/doctor/discharge': { title: 'Discharge Planner', subtitle: 'Plan patient discharge criteria and medication reconciliation.', category: 'Orders' },
    '/doctor/referrals': { title: 'Referral Orders', subtitle: 'Direct cross-department specialist referrals.', category: 'Orders' },
    '/doctor/availability': { title: 'Availability', subtitle: 'Manage weekly working hours and booking windows.', category: 'Practice' },
    '/doctor/messages': { title: 'Messages & Alerts', subtitle: 'Notifications and patient care updates.', category: 'Comms' },
    '/doctor/settings': { title: 'Settings', subtitle: 'Profile, security, and portal preferences.', category: 'Account' },

    '/admin': { title: 'Admin Overview', subtitle: 'Hospital operations, capacity, revenue, and user governance.', category: 'Governance' },
    '/admin/operations': { title: 'Operations Center', subtitle: 'Hospital command telemetry, bed occupancy, and alert monitoring.', category: 'Core' },
    '/admin/command-alerts': { title: 'Command Alerts', subtitle: 'Real-time hospital distress alerts and system incidents.', category: 'Core' },
    '/admin/analytics': { title: 'Analytics Dashboard', subtitle: 'Performance metrics, trends, and hospital health signals.', category: 'Core' },
    '/admin/beds': { title: 'Bed Capacity', subtitle: 'Ward availability, occupancy, and capacity planning.', category: 'Core' },
    '/admin/doctors': { title: 'Doctor Management', subtitle: 'Review providers, specialties, access status, and profile quality.', category: 'Clinical' },
    '/admin/patients': { title: 'Patient Management', subtitle: 'Monitor patient access, records readiness, and contact details.', category: 'Clinical' },
    '/admin/appointments': { title: 'Appointment Control', subtitle: 'Track visits, payment status, and operational follow-through.', category: 'Clinical' },
    '/admin/waitlist': { title: 'Waitlist Board', subtitle: 'Manage specialty department queues and patient waitlists.', category: 'Clinical' },
    '/admin/handoffs': { title: 'Handoff Monitor', subtitle: 'Hospital-wide clinical shift handover compliance.', category: 'Clinical' },
    '/admin/discharge': { title: 'Discharge Board', subtitle: 'Track inpatient discharge pipelines and ward turnaround.', category: 'Clinical' },
    '/admin/referrals': { title: 'Referral Desk', subtitle: 'Coordinate incoming and outgoing specialist referrals.', category: 'Clinical' },
    '/admin/transport': { title: 'Transport Dispatch', subtitle: 'Dispatch ambulance fleets and monitor live transit status.', category: 'Services' },
    '/admin/visitors': { title: 'Visitor Desk', subtitle: 'Monitor guest logs, visiting hours, and security clearances.', category: 'Services' },
    '/admin/nutrition': { title: 'Nutrition Desk', subtitle: 'Review dietary kitchens and inpatient dietary requirements.', category: 'Services' },
    '/admin/housekeeping': { title: 'Housekeeping Board', subtitle: 'Sanitation queues, terminal room cleaning, and turnaround times.', category: 'Services' },
    '/admin/pharmacy': { title: 'Pharmacy Queue', subtitle: 'Dispense inpatient prescriptions and manage pharmacy dispatch.', category: 'Services' },
    '/admin/inventory': { title: 'Inventory Control', subtitle: 'Medicine stock, low inventory alerts, and supply readiness.', category: 'Services' },
    '/admin/billing': { title: 'Billing Center', subtitle: 'Invoices, collections, balances, and payment operations.', category: 'Finance' },
    '/admin/insurance': { title: 'Insurance Desk', subtitle: 'TPAs, claims adjudication, and preauthorization tracking.', category: 'Finance' },
    '/admin/risk': { title: 'Risk Center', subtitle: 'Clinical incident reports, risk scoring, and governance audits.', category: 'Audit' },
    '/admin/experience': { title: 'Patient Experience', subtitle: 'Net promoter score, satisfaction surveys, and care reviews.', category: 'Audit' },
    '/admin/support': { title: 'Support Desk', subtitle: 'Resolve escalated patient tickets and provider inquiries.', category: 'Audit' },
    '/admin/notifications': { title: 'Notification Center', subtitle: 'Broadcast updates and review hospital activity alerts.', category: 'Governance' },
    '/admin/settings': { title: 'System Settings', subtitle: 'Account, security, and hospital-wide configuration.', category: 'Governance' },
};

const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const unreadCount = useUnreadCount(user?.id);
    const navigate = useNavigate();
    const location = useLocation();

    // Safely attempt useKBar for instant command launcher
    let openKBar: (() => void) | undefined;
    try {
        const kbar = useKBar();
        openKBar = () => kbar?.query?.toggle();
    } catch {
        openKBar = undefined;
    }

    const meta = pageMeta[location.pathname] || {
        title: 'MediCare HMS',
        subtitle: `${(user?.role || 'User').toLowerCase()} portal`,
        category: 'Workspace',
    };

    const roleColor: Record<string, string> = {
        ADMIN:   'from-purple-500 to-indigo-600',
        DOCTOR:  'from-teal-500 to-emerald-600',
        PATIENT: 'from-blue-500 to-cyan-600',
    };
    const gradient = roleColor[user?.role || 'PATIENT'] || roleColor.PATIENT;

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
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 h-16 border-b border-[var(--border-color)] bg-[var(--card-elevated)]/90 shadow-[0_4px_20px_rgba(15,23,42,0.03)] backdrop-blur-2xl transition-all duration-300">
            <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">

                {/* Left: Mobile toggle + Breadcrumb & Title */}
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        className="md:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="min-w-0">
                        {/* Micro-Breadcrumb */}
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                            <span>MediCare</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                            <span className="capitalize font-bold text-[var(--primary)]">{meta.category || (user?.role || '').toLowerCase()}</span>
                        </div>

                        {/* Title & Role Pill */}
                        <div className="flex items-center gap-2 mt-0.5">
                            <h1 className="truncate text-base font-black leading-tight tracking-tight sm:text-lg" style={{ color: 'var(--text-color)' }}>
                                {meta.title}
                            </h1>
                            <span
                                className="hidden rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider md:inline-flex"
                                style={{ background: 'var(--primary-soft)', borderColor: 'var(--ring)', color: 'var(--primary)' }}
                            >
                                {(user?.role || '').toLowerCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">

                    {/* ⌘K Command Palette Quick Launcher */}
                    <button
                        type="button"
                        onClick={() => {
                            if (openKBar) {
                                openKBar();
                            } else {
                                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                            }
                        }}
                        className="hidden lg:flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-[var(--primary)] hover:text-[var(--text-color)] transition-all shadow-sm"
                        title="Search anything (Ctrl+K or ⌘K)"
                    >
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span>Command search...</span>
                        <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-500">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Live System Beacon */}
                    <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold">Online</span>
                    </div>

                    {/* 🔔 Live Notification Bell */}
                    <button
                        onClick={() => navigate(notifPath[user?.role || 'PATIENT'] || '/patient/messages')}
                        className="relative rounded-xl border border-transparent p-2 transition-all hover:border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" style={{ color: 'var(--text-color)' }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* 🌙/☀️ Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark'
                            ? <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
                            : <Moon className="h-5 w-5 text-slate-600" />
                        }
                    </button>

                    {/* User profile chip */}
                    <button
                        onClick={() => navigate(settingsPath[user?.role || 'PATIENT'] || '/patient/settings')}
                        className="flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] py-1 pl-2.5 pr-1.5 transition-all hover:border-[var(--primary)] shadow-sm"
                        title="Open account profile & settings"
                    >
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-color)' }}>
                                {user?.fullName || user?.username}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                {(user?.role || '').toLowerCase()}
                            </p>
                        </div>
                        <div className="relative">
                            <ProfileAvatar
                                profilePictureUrl={user?.profilePictureUrl}
                                name={user?.fullName || user?.username}
                                className="h-8 w-8 rounded-lg border border-[var(--border-color)] text-xs shadow"
                                fallbackClassName={`bg-gradient-to-br ${gradient}`}
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
