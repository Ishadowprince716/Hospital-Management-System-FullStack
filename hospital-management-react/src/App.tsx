import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import type { RootState } from './store';
import { Loader2 } from 'lucide-react';

// ─── Eagerly Loaded ───
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import WebSocketListener from './components/WebSocketListener';
import CommandPalette from './components/CommandPalette';
import { Toaster } from 'react-hot-toast';

// ─── Lazy Loaded Pages (Code Splitting) ───
const Overview = lazy(() => import('./pages/dashboard/Overview'));

// Patient
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const MedicalRecords = lazy(() => import('./pages/patient/MedicalRecords'));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions'));
const MedicalReports = lazy(() => import('./pages/patient/MedicalReports'));
const PatientBilling = lazy(() => import('./pages/patient/PatientBilling'));

// Doctor
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorMyPatients = lazy(() => import('./pages/doctor/DoctorMyPatients'));
const DoctorPrescriptions = lazy(() => import('./pages/doctor/DoctorPrescriptions'));
const DoctorMedicalRecords = lazy(() => import('./pages/doctor/DoctorMedicalRecords'));
const DoctorLabOrders = lazy(() => import('./pages/doctor/DoctorLabOrders'));
const DoctorAvailability = lazy(() => import('./pages/doctor/DoctorAvailability'));

// Admin
const ManageDoctors = lazy(() => import('./pages/admin/ManageDoctors'));
const ManagePatients = lazy(() => import('./pages/admin/ManagePatients'));
const AdminAllAppointments = lazy(() => import('./pages/admin/AdminAllAppointments'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'));
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard'));
const BedHeatmap = lazy(() => import('./pages/admin/BedHeatmap'));

// Shared
const Notifications = lazy(() => import('./pages/shared/Notifications'));
const SystemSettings = lazy(() => import('./pages/shared/SystemSettings'));
const VideoCall = lazy(() => import('./pages/shared/VideoCall'));

// ─── Loading Fallback ───
const PageLoader = () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
    </div>
);

// ─── Protected Route ───
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
};

// ─── App Component ───
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
            <Toaster position="top-right" />
            <CommandPalette>
                <WebSocketListener />
                <Suspense fallback={<PageLoader />}>
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
                            <Route path="medical-reports"   element={<MedicalReports />} />
                            <Route path="prescriptions"     element={<PatientPrescriptions />} />
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
                            <Route path="inventory"         element={<InventoryDashboard />} />
                            <Route path="beds"              element={<BedHeatmap />} />
                            <Route path="notifications"     element={<Notifications />} />
                            <Route path="settings"          element={<SystemSettings />} />
                            </Route>

                            {/* ── Telehealth ── */}
                            <Route path="/telehealth/:appointmentId" element={
                            <ProtectedRoute>
                                <VideoCall />
                            </ProtectedRoute>
                            } />

                            {/* ── Root + 404 ── */}                        <Route path="/"  element={<Navigate to={isAuthenticated ? getHomeRedirect() : '/login'} replace />} />
                        <Route path="*"  element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </CommandPalette>
        </Router>
    );
}

export default App;
