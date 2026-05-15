import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import type { RootState } from './store';
import { Loader2 } from 'lucide-react';

// ─── Eagerly Loaded ───
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import WebSocketListener from './components/WebSocketListener';
import CommandPalette from './components/CommandPalette';
import { Toaster } from 'react-hot-toast';
import RouteErrorBoundary from './components/system/RouteErrorBoundary';

// ─── Lazy Loaded Pages (Code Splitting) ───
const Overview = lazy(() => import('./pages/dashboard/Overview'));

// Patient
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const MedicalRecords = lazy(() => import('./pages/patient/MedicalRecords'));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions'));
const MedicalReports = lazy(() => import('./pages/patient/MedicalReports'));
const PatientBilling = lazy(() => import('./pages/patient/PatientBilling'));
const CarePlan = lazy(() => import('./pages/patient/CarePlan'));
const VitalsTracker = lazy(() => import('./pages/patient/VitalsTracker'));
const SupportCenter = lazy(() => import('./pages/patient/SupportCenter'));
const PatientFeedback = lazy(() => import('./pages/patient/PatientFeedback'));
const DischargeInstructions = lazy(() => import('./pages/patient/DischargeInstructions'));
const PatientReferrals = lazy(() => import('./pages/patient/PatientReferrals'));
const InsurancePreauth = lazy(() => import('./pages/patient/InsurancePreauth'));
const MedicationRefills = lazy(() => import('./pages/patient/MedicationRefills'));
const AppointmentWaitlist = lazy(() => import('./pages/patient/AppointmentWaitlist'));
const EmergencyTransport = lazy(() => import('./pages/patient/EmergencyTransport'));
const VisitorPasses = lazy(() => import('./pages/patient/VisitorPasses'));
const DietaryMeals = lazy(() => import('./pages/patient/DietaryMeals'));
const RoomServices = lazy(() => import('./pages/patient/RoomServices'));

// Doctor
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorMyPatients = lazy(() => import('./pages/doctor/DoctorMyPatients'));
const DoctorPrescriptions = lazy(() => import('./pages/doctor/DoctorPrescriptions'));
const DoctorMedicalRecords = lazy(() => import('./pages/doctor/DoctorMedicalRecords'));
const DoctorLabOrders = lazy(() => import('./pages/doctor/DoctorLabOrders'));
const DoctorAvailability = lazy(() => import('./pages/doctor/DoctorAvailability'));
const DoctorTriage = lazy(() => import('./pages/doctor/DoctorTriage'));
const SafetyReports = lazy(() => import('./pages/doctor/SafetyReports'));
const ClinicalHandoffs = lazy(() => import('./pages/doctor/ClinicalHandoffs'));
const DischargePlanner = lazy(() => import('./pages/doctor/DischargePlanner'));
const DoctorReferrals = lazy(() => import('./pages/doctor/DoctorReferrals'));

// Admin
const ManageDoctors = lazy(() => import('./pages/admin/ManageDoctors'));
const ManagePatients = lazy(() => import('./pages/admin/ManagePatients'));
const AdminAllAppointments = lazy(() => import('./pages/admin/AdminAllAppointments'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminBilling = lazy(() => import('./pages/admin/AdminBilling'));
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard'));
const BedHeatmap = lazy(() => import('./pages/admin/BedHeatmap'));
const OperationsCenter = lazy(() => import('./pages/admin/OperationsCenter'));
const SupportDesk = lazy(() => import('./pages/admin/SupportDesk'));
const PatientExperience = lazy(() => import('./pages/admin/PatientExperience'));
const RiskCenter = lazy(() => import('./pages/admin/RiskCenter'));
const HandoffMonitor = lazy(() => import('./pages/admin/HandoffMonitor'));
const DischargeBoard = lazy(() => import('./pages/admin/DischargeBoard'));
const ReferralDesk = lazy(() => import('./pages/admin/ReferralDesk'));
const InsuranceDesk = lazy(() => import('./pages/admin/InsuranceDesk'));
const PharmacyQueue = lazy(() => import('./pages/admin/PharmacyQueue'));
const WaitlistBoard = lazy(() => import('./pages/admin/WaitlistBoard'));
const TransportDispatch = lazy(() => import('./pages/admin/TransportDispatch'));
const VisitorDesk = lazy(() => import('./pages/admin/VisitorDesk'));
const NutritionDesk = lazy(() => import('./pages/admin/NutritionDesk'));
const HousekeepingBoard = lazy(() => import('./pages/admin/HousekeepingBoard'));
const CommandAlerts = lazy(() => import('./pages/admin/CommandAlerts'));

// Shared
const Notifications = lazy(() => import('./pages/shared/Notifications'));
const SystemSettings = lazy(() => import('./pages/shared/SystemSettings'));
const TelehealthStart = lazy(() => import('./pages/shared/TelehealthStart'));
const VideoCall = lazy(() => import('./pages/shared/VideoCall'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Loading Fallback ───
const PageLoader = () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
    </div>
);

const withBoundary = (element: React.ReactElement) => (
    <RouteErrorBoundary>{element}</RouteErrorBoundary>
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
                        <Route path="/"         element={!isAuthenticated ? withBoundary(<LandingPage />) : <Navigate to={getHomeRedirect()} />} />
                        <Route path="/login"    element={!isAuthenticated ? withBoundary(<Login />)    : <Navigate to={getHomeRedirect()} />} />
                        <Route path="/register" element={!isAuthenticated ? withBoundary(<Register />) : <Navigate to={getHomeRedirect()} />} />

                        {/* ── Patient Routes ── */}
                        <Route
                            path="/patient"
                            element={
                                <ProtectedRoute roles={['PATIENT']}>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index                    element={withBoundary(<Overview />)} />
                            <Route path="appointments"      element={withBoundary(<MyAppointments />)} />
                            <Route path="book-appointment"  element={withBoundary(<BookAppointment />)} />
                            <Route path="waitlist"          element={withBoundary(<AppointmentWaitlist />)} />
                            <Route path="transport"         element={withBoundary(<EmergencyTransport />)} />
                            <Route path="visitors"          element={withBoundary(<VisitorPasses />)} />
                            <Route path="meals"             element={withBoundary(<DietaryMeals />)} />
                            <Route path="room-services"     element={withBoundary(<RoomServices />)} />
                            <Route path="medical-records"   element={withBoundary(<MedicalRecords />)} />
                            <Route path="medical-reports"   element={withBoundary(<MedicalReports />)} />
                            <Route path="prescriptions"     element={withBoundary(<PatientPrescriptions />)} />
                            <Route path="billing"           element={withBoundary(<PatientBilling />)} />
                            <Route path="care-plan"         element={withBoundary(<CarePlan />)} />
                            <Route path="vitals"            element={withBoundary(<VitalsTracker />)} />
                            <Route path="support"           element={withBoundary(<SupportCenter />)} />
                            <Route path="feedback"          element={withBoundary(<PatientFeedback />)} />
                            <Route path="discharge"         element={withBoundary(<DischargeInstructions />)} />
                            <Route path="referrals"         element={withBoundary(<PatientReferrals />)} />
                            <Route path="insurance"         element={withBoundary(<InsurancePreauth />)} />
                            <Route path="refills"           element={withBoundary(<MedicationRefills />)} />
                            <Route path="messages"          element={withBoundary(<Notifications />)} />
                            <Route path="settings"          element={withBoundary(<SystemSettings />)} />
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
                            <Route index                    element={withBoundary(<Overview />)} />
                            <Route path="appointments"      element={withBoundary(<DoctorAppointments />)} />
                            <Route path="patients"          element={withBoundary(<DoctorMyPatients />)} />
                            <Route path="prescriptions"     element={withBoundary(<DoctorPrescriptions />)} />
                            <Route path="medical-records"   element={withBoundary(<DoctorMedicalRecords />)} />
                            <Route path="lab-orders"        element={withBoundary(<DoctorLabOrders />)} />
                            <Route path="availability"      element={withBoundary(<DoctorAvailability />)} />
                            <Route path="triage"            element={withBoundary(<DoctorTriage />)} />
                            <Route path="safety"            element={withBoundary(<SafetyReports />)} />
                            <Route path="handoffs"          element={withBoundary(<ClinicalHandoffs />)} />
                            <Route path="discharge"         element={withBoundary(<DischargePlanner />)} />
                            <Route path="referrals"         element={withBoundary(<DoctorReferrals />)} />
                            <Route path="messages"          element={withBoundary(<Notifications />)} />
                            <Route path="settings"          element={withBoundary(<SystemSettings />)} />
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
                            <Route index                    element={withBoundary(<Overview />)} />
                            <Route path="doctors"           element={withBoundary(<ManageDoctors />)} />
                            <Route path="patients"          element={withBoundary(<ManagePatients />)} />
                            <Route path="appointments"      element={withBoundary(<AdminAllAppointments />)} />
                            <Route path="waitlist"          element={withBoundary(<WaitlistBoard />)} />
                            <Route path="transport"         element={withBoundary(<TransportDispatch />)} />
                            <Route path="visitors"          element={withBoundary(<VisitorDesk />)} />
                            <Route path="nutrition"         element={withBoundary(<NutritionDesk />)} />
                            <Route path="housekeeping"      element={withBoundary(<HousekeepingBoard />)} />
                            <Route path="command-alerts"    element={withBoundary(<CommandAlerts />)} />
                            <Route path="analytics"         element={withBoundary(<AdminAnalytics />)} />
                            <Route path="billing"           element={withBoundary(<AdminBilling />)} />
                            <Route path="inventory"         element={withBoundary(<InventoryDashboard />)} />
                            <Route path="beds"              element={withBoundary(<BedHeatmap />)} />
                            <Route path="operations"        element={withBoundary(<OperationsCenter />)} />
                            <Route path="support"           element={withBoundary(<SupportDesk />)} />
                            <Route path="experience"        element={withBoundary(<PatientExperience />)} />
                            <Route path="risk"              element={withBoundary(<RiskCenter />)} />
                            <Route path="handoffs"          element={withBoundary(<HandoffMonitor />)} />
                            <Route path="discharge"         element={withBoundary(<DischargeBoard />)} />
                            <Route path="referrals"         element={withBoundary(<ReferralDesk />)} />
                            <Route path="insurance"         element={withBoundary(<InsuranceDesk />)} />
                            <Route path="pharmacy"          element={withBoundary(<PharmacyQueue />)} />
                            <Route path="notifications"     element={withBoundary(<Notifications />)} />
                            <Route path="settings"          element={withBoundary(<SystemSettings />)} />
                            </Route>

                            {/* ── Telehealth ── */}
                            <Route path="/telehealth" element={
                            <ProtectedRoute>
                                {withBoundary(<TelehealthStart />)}
                            </ProtectedRoute>
                            } />
                            <Route path="/telehealth/:appointmentId" element={
                            <ProtectedRoute>
                                {withBoundary(<VideoCall />)}
                            </ProtectedRoute>
                            } />

                            {/* ── 404 ── */}
                        <Route path="*"  element={withBoundary(<NotFound />)} />
                    </Routes>
                </Suspense>
            </CommandPalette>
        </Router>
    );
}

export default App;
