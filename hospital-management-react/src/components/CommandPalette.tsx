import React from 'react';
import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    useMatches,
    KBarResults,
    type Action,
} from 'kbar';
import { useNavigate } from 'react-router-dom';
import { 
    Home, 
    Calendar, 
    Users, 
    Settings, 
    Search,
    LogOut,
    PlusCircle,
    Activity,
    CreditCard,
    Package,
    LayoutGrid,
    Bell,
    Stethoscope
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const CommandPalette: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const roleBase = user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor' : user?.role === 'PATIENT' ? '/patient' : '';
    const homePath = roleBase || '/';
    const settingsPath = roleBase ? `${roleBase}/settings` : '/login';
    const notificationsPath = user?.role === 'ADMIN'
        ? '/admin/notifications'
        : user?.role === 'DOCTOR'
            ? '/doctor/messages'
            : user?.role === 'PATIENT'
                ? '/patient/messages'
                : '/login';

    const commonActions: Action[] = [
        {
            id: 'home',
            name: 'Home / Dashboard',
            shortcut: ['h'],
            keywords: 'dashboard index home',
            perform: () => navigate(homePath),
            icon: <Home className="w-5 h-5" />,
        },
        {
            id: 'settings',
            name: 'Settings',
            shortcut: ['s'],
            keywords: 'config account profile settings',
            perform: () => navigate(settingsPath),
            icon: <Settings className="w-5 h-5" />,
        },
        {
            id: 'notifications',
            name: 'Messages & Notifications',
            shortcut: ['n'],
            keywords: 'messages alerts notifications inbox',
            perform: () => navigate(notificationsPath),
            icon: <Bell className="w-5 h-5" />,
        },
        {
            id: 'logout',
            name: 'Logout',
            shortcut: ['l', 'o'],
            keywords: 'signout exit logout',
            perform: () => {
                dispatch(logout());
                navigate('/login');
            },
            icon: <LogOut className="w-5 h-5" />,
        },
    ];

    const patientActions: Action[] = [
        {
            id: 'book-appointment',
            name: 'Book New Appointment',
            shortcut: ['b', 'a'],
            keywords: 'book create appointment doctor visit',
            perform: () => navigate('/patient/book-appointment'),
            icon: <PlusCircle className="w-5 h-5" />,
        },
        {
            id: 'my-appointments',
            name: 'My Appointments',
            shortcut: ['a'],
            keywords: 'view appointments visits schedule',
            perform: () => navigate('/patient/appointments'),
            icon: <Calendar className="w-5 h-5" />,
        },
        {
            id: 'medical-records',
            name: 'My Medical Records',
            shortcut: ['m', 'r'],
            keywords: 'history health records medical',
            perform: () => navigate('/patient/medical-records'),
            icon: <Activity className="w-5 h-5" />,
        },
        {
            id: 'patient-billing',
            name: 'Billing & Payments',
            shortcut: ['b', 'p'],
            keywords: 'invoice payment billing bills',
            perform: () => navigate('/patient/billing'),
            icon: <CreditCard className="w-5 h-5" />,
        },
    ];

    const doctorActions: Action[] = [
        {
            id: 'doctor-appointments',
            name: 'Today\'s Schedule',
            shortcut: ['d', 'a'],
            keywords: 'appointments today schedule patient list',
            perform: () => navigate('/doctor/appointments'),
            icon: <Calendar className="w-5 h-5" />,
        },
        {
            id: 'my-patients',
            name: 'Manage Patients',
            shortcut: ['p'],
            keywords: 'patients list records database',
            perform: () => navigate('/doctor/patients'),
            icon: <Users className="w-5 h-5" />,
        },
        {
            id: 'doctor-prescriptions',
            name: 'Prescriptions',
            shortcut: ['r', 'x'],
            keywords: 'medicine prescription treatment plan',
            perform: () => navigate('/doctor/prescriptions'),
            icon: <Activity className="w-5 h-5" />,
        },
        {
            id: 'doctor-availability',
            name: 'Availability',
            shortcut: ['a', 'v'],
            keywords: 'schedule availability working hours booking slots',
            perform: () => navigate('/doctor/availability'),
            icon: <Stethoscope className="w-5 h-5" />,
        },
    ];

    const adminActions: Action[] = [
        {
            id: 'manage-doctors',
            name: 'Manage Doctors',
            shortcut: ['m', 'd'],
            keywords: 'doctors medical staff management',
            perform: () => navigate('/admin/doctors'),
            icon: <Users className="w-5 h-5" />,
        },
        {
            id: 'admin-analytics',
            name: 'Hospital Analytics',
            shortcut: ['a', 'n'],
            keywords: 'stats data revenue growth performance',
            perform: () => navigate('/admin/analytics'),
            icon: <Activity className="w-5 h-5" />,
        },
        {
            id: 'all-billing',
            name: 'Financial Overview / Billing',
            shortcut: ['f', 'b'],
            keywords: 'money billing payments revenue invoices',
            perform: () => navigate('/admin/billing'),
            icon: <CreditCard className="w-5 h-5" />,
        },
        {
            id: 'inventory-dashboard',
            name: 'Pharmacy / Inventory',
            shortcut: ['i'],
            keywords: 'medicine pharmacy stock inventory supply',
            perform: () => navigate('/admin/inventory'),
            icon: <Package className="w-5 h-5" />,
        },
        {
            id: 'bed-heatmap',
            name: 'Bed Heatmap / Capacity',
            shortcut: ['b'],
            keywords: 'ward bed occupancy capacity heatmap',
            perform: () => navigate('/admin/beds'),
            icon: <LayoutGrid className="w-5 h-5" />,
        },
    ];

    // Build actions list based on role
    let actions = [...commonActions];
    if (user?.role === 'PATIENT') actions = [...actions, ...patientActions];
    if (user?.role === 'DOCTOR')  actions = [...actions, ...doctorActions];
    if (user?.role === 'ADMIN')   actions = [...actions, ...adminActions];

    return (
        <KBarProvider actions={actions}>
            <KBarPortal>
                <KBarPositioner className="bg-black/40 backdrop-blur-sm z-[9999]">
                    <KBarAnimator className="w-full max-w-[620px] overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-elevated)] shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center border-b border-[var(--border-color)] px-4 py-3">
                            <Search className="mr-3 h-5 w-5 text-[var(--text-soft)]" />
                            <KBarSearch className="w-full border-none bg-transparent py-1 text-lg text-[var(--text-color)] outline-none placeholder:text-[var(--text-soft)]" placeholder="Type a command or search..." />
                            <div className="ml-2 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">ESC</div>
                        </div>
                        <RenderResults />
                    </KBarAnimator>
                </KBarPositioner>
            </KBarPortal>
            {children}
        </KBarProvider>
    );
};

function RenderResults() {
    const { results } = useMatches();

    return (
        <KBarResults
            items={results}
            onRender={({ item, active }) =>
                typeof item === 'string' ? (
                    <div className="bg-slate-50/70 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] dark:bg-slate-900/40">
                        {item}
                    </div>
                ) : (
                    <div
                        className={`flex cursor-pointer items-center justify-between border-l-4 px-4 py-3 transition-colors ${
                            active ? 'border-[var(--primary)] bg-teal-50/70 dark:bg-teal-950/20' : 'border-transparent'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${active ? 'text-[var(--primary)]' : 'text-[var(--text-soft)]'}`}>
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${active ? 'text-[var(--primary)]' : 'text-[var(--text-color)]'}`}>
                                    {item.name}
                                </span>
                                {item.keywords && (
                                    <span className="max-w-[300px] truncate text-[10px] text-[var(--text-soft)]">
                                        {item.keywords}
                                    </span>
                                )}
                            </div>
                        </div>
                        {item.shortcut?.length ? (
                            <div className="flex gap-1">
                                {item.shortcut.map((s) => (
                                    <kbd key={s} className="rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                        {s.toUpperCase()}
                                    </kbd>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )
            }
        />
    );
}

export default CommandPalette;
