import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import PatientBilling from './pages/patient/PatientBilling';
import MedicalRecords from './pages/patient/MedicalRecords';
import AdminBilling from './pages/admin/AdminBilling';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorLabOrders from './pages/doctor/DoctorLabOrders';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import Notifications from './pages/shared/Notifications';
import DoctorMyPatients from './pages/doctor/DoctorMyPatients';
import SystemSettings from './pages/shared/SystemSettings';
import AdminAllAppointments from './pages/admin/AdminAllAppointments';
import { initializeAuth } from './store/slices/authSlice';
import type { RootState } from './store';

// ─── Placeholder page component ──────────────────────────────────────────────
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
    <div className="space-y-4 animate-fadeIn">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{title}</h1>
        <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏗️</span>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Coming Soon</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                This section is under development. Check back soon!
            </p>
        </div>
    </div>
);

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
};

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    const getHomeRedirect = () => {
        if (!user) return '/login';
        if (user.role === 'ADMIN')   return '/admin';
        if (user.role === 'DOCTOR')  return '/doctor';
        return '/patient';
    };

    return (
        <Router>
            <Routes>
                {/* ── Public ── */}
                <Route path="/login"    element={!isAuthenticated ? <Login />    : <Navigate to={getHomeRedirect()} />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getHomeRedirect()} />} />

                {/* ── Patient Routes ── */}
                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute roles={['PATIENT']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index                    element={<Overview />} />
                    <Route path="appointments"      element={<MyAppointments />} />
                    <Route path="book-appointment"  element={<BookAppointment />} />
                    <Route path="medical-records"   element={<MedicalRecords />} />
                    <Route path="medical-reports"   element={<ComingSoon title="Medical Reports" />} />
                    <Route path="prescriptions"     element={<ComingSoon title="Prescriptions" />} />
                    <Route path="billing"           element={<PatientBilling />} />
                    <Route path="messages"          element={<Notifications />} />
                    <Route path="settings"          element={<SystemSettings />} />
                </Route>

                {/* ── Doctor Routes ── */}
                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute roles={['DOCTOR']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index                    element={<Overview />} />
                    <Route path="appointments"      element={<DoctorAppointments />} />
                    <Route path="patients"          element={<DoctorMyPatients />} />
                    <Route path="prescriptions"     element={<DoctorPrescriptions />} />
                    <Route path="medical-records"   element={<DoctorMedicalRecords />} />
                    <Route path="lab-orders"        element={<DoctorLabOrders />} />
                    <Route path="availability"      element={<DoctorAvailability />} />
                    <Route path="messages"          element={<Notifications />} />
                    <Route path="settings"          element={<SystemSettings />} />
                </Route>

                {/* ── Admin Routes ── */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index                    element={<Overview />} />
                    <Route path="doctors"           element={<ManageDoctors />} />
                    <Route path="patients"          element={<ManagePatients />} />
                    <Route path="appointments"      element={<AdminAllAppointments />} />
                    <Route path="analytics"         element={<AdminAnalytics />} />
                    <Route path="billing"           element={<AdminBilling />} />
                    <Route path="notifications"     element={<Notifications />} />
                    <Route path="settings"          element={<SystemSettings />} />
                </Route>

                {/* ── Root + 404 ── */}
                <Route path="/"  element={<Navigate to={isAuthenticated ? getHomeRedirect() : '/login'} replace />} />
                <Route path="*"  element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
