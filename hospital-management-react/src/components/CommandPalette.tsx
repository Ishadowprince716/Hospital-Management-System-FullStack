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
    LayoutGrid
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const CommandPalette: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const commonActions: Action[] = [
        {
            id: 'home',
            name: 'Home / Dashboard',
            shortcut: ['h'],
            keywords: 'dashboard index home',
            perform: () => navigate('/'),
            icon: <Home className="w-5 h-5" />,
        },
        {
            id: 'settings',
            name: 'Settings',
            shortcut: ['s'],
            keywords: 'config account profile settings',
            perform: () => navigate('/settings'),
            icon: <Settings className="w-5 h-5" />,
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
                    <KBarAnimator className="max-w-[600px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                        <div className="flex items-center px-4 py-3 border-b border-gray-100">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <KBarSearch className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-lg py-1" placeholder="Type a command or search..." />
                            <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 ml-2">ESC</div>
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
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        {item}
                    </div>
                ) : (
                    <div
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                            active ? 'bg-[var(--primary)] bg-opacity-10 border-l-4 border-[var(--primary)]' : 'border-l-4 border-transparent'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`${active ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${active ? 'text-[var(--primary)]' : 'text-gray-700'}`}>
                                    {item.name}
                                </span>
                                {item.keywords && (
                                    <span className="text-[10px] text-gray-400 truncate max-w-[300px]">
                                        {item.keywords}
                                    </span>
                                )}
                            </div>
                        </div>
                        {item.shortcut?.length ? (
                            <div className="flex gap-1">
                                {item.shortcut.map((s) => (
                                    <kbd key={s} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-mono shadow-sm">
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
