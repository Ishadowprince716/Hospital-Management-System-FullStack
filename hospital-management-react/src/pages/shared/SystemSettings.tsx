import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Activity,
    AlertCircle,
    BadgeCheck,
    BadgeIndianRupee,
    Bell,
    BriefcaseMedical,
    Building2,
    Camera,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Database,
    Eye,
    EyeOff,
    HeartPulse,
    IdCard,
    Lock,
    Mail,
    MapPin,
    MonitorCheck,
    Phone,
    RefreshCw,
    Save,
    Server,
    Settings,
    Shield,
    Smartphone,
    Stethoscope,
    Trash2,
    Upload,
    User,
    UserCheck,
    Video,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { updateCurrentUser } from '../../store/slices/authSlice';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

type Tab = 'profile' | 'security' | 'notifications' | 'system';

interface AdminSystemSettings {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    telehealthEnabled: boolean;
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    maxAppointmentsPerDoctorPerDay: number;
    appointmentReminderHours: number;
    billingGraceDays: number;
    supportEmail: string;
    emergencyBannerMessage: string;
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
    health?: Record<string, unknown>;
}

interface ProfileDetails {
    id?: number;
    username?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    fullName?: string;
    isActive?: boolean;
    provider?: string;
    profilePictureUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    allergies?: string;
    currentMedications?: string;
    specialization?: string;
    qualification?: string;
    experienceYears?: number | string;
    consultationFee?: number | string;
    department?: string;
    licenseNumber?: string;
    availableDays?: string;
    availableTimeStart?: string;
    availableTimeEnd?: string;
    rating?: number;
    totalPatients?: number;
}

type PatientProfileForm = {
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    address: string;
    emergencyContactName: string;
    emergencyContact: string;
    insuranceProvider: string;
    insuranceNumber: string;
    allergies: string;
    currentMedications: string;
};

type DoctorProfileForm = {
    specialization: string;
    qualification: string;
    department: string;
    licenseNumber: string;
    experienceYears: string;
    consultationFee: string;
    availableDays: string;
    availableTimeStart: string;
    availableTimeEnd: string;
};

const emptyPatientProfile: PatientProfileForm = {
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContactName: '',
    emergencyContact: '',
    insuranceProvider: '',
    insuranceNumber: '',
    allergies: '',
    currentMedications: '',
};

const emptyDoctorProfile: DoctorProfileForm = {
    specialization: '',
    qualification: '',
    department: '',
    licenseNumber: '',
    experienceYears: '',
    consultationFee: '',
    availableDays: '',
    availableTimeStart: '',
    availableTimeEnd: '',
};

const defaultSystemSettings: AdminSystemSettings = {
    maintenanceMode: false,
    allowRegistration: true,
    telehealthEnabled: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    maxAppointmentsPerDoctorPerDay: 20,
    appointmentReminderHours: 24,
    billingGraceDays: 7,
    supportEmail: 'support@medicare-hms.local',
    emergencyBannerMessage: '',
};

const toBoolean = (value: unknown, fallback: boolean) =>
    typeof value === 'boolean' ? value : fallback;

const toNumber = (value: unknown, fallback: number) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const unwrapSystemSettings = (raw: unknown): AdminSystemSettings => {
    const envelope = raw as { data?: Partial<AdminSystemSettings> };
    const data = (envelope?.data || raw || {}) as Partial<AdminSystemSettings>;
    return {
        maintenanceMode: toBoolean(data.maintenanceMode, defaultSystemSettings.maintenanceMode),
        allowRegistration: toBoolean(data.allowRegistration, defaultSystemSettings.allowRegistration),
        telehealthEnabled: toBoolean(data.telehealthEnabled, defaultSystemSettings.telehealthEnabled),
        emailNotificationsEnabled: toBoolean(data.emailNotificationsEnabled, defaultSystemSettings.emailNotificationsEnabled),
        smsNotificationsEnabled: toBoolean(data.smsNotificationsEnabled, defaultSystemSettings.smsNotificationsEnabled),
        maxAppointmentsPerDoctorPerDay: toNumber(data.maxAppointmentsPerDoctorPerDay, defaultSystemSettings.maxAppointmentsPerDoctorPerDay),
        appointmentReminderHours: toNumber(data.appointmentReminderHours, defaultSystemSettings.appointmentReminderHours),
        billingGraceDays: toNumber(data.billingGraceDays, defaultSystemSettings.billingGraceDays),
        supportEmail: data.supportEmail || defaultSystemSettings.supportEmail,
        emergencyBannerMessage: data.emergencyBannerMessage || '',
        lastUpdatedBy: data.lastUpdatedBy,
        lastUpdatedAt: data.lastUpdatedAt,
        health: data.health,
    };
};

const textValue = (value: unknown) => (value === null || value === undefined ? '' : String(value));

const formatDate = (value?: string) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value?: string) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const displayValue = (value?: string | number | null) => {
    const text = textValue(value);
    return text.trim() || 'Not added';
};

const selectClassName = 'h-11 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3.5 py-2 text-sm text-[var(--text-color)] shadow-[var(--shadow-sm)] focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--ring)] transition-all duration-200';
const textAreaClassName = 'min-h-24 w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3.5 py-2 text-sm text-[var(--text-color)] shadow-[var(--shadow-sm)] placeholder:text-[var(--text-soft)] focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--ring)] transition-all duration-200';

const SystemSettings: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const isAdmin = user?.role === 'ADMIN';
    const [tab, setTab] = useState<Tab>('profile');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const seededUserIdRef = useRef<number | null>(null);

    // Profile form
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl || '');
    const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(user as ProfileDetails | null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [patientProfile, setPatientProfile] = useState<PatientProfileForm>(emptyPatientProfile);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfileForm>(emptyDoctorProfile);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Security form
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // System settings (admin)
    const [systemSettings, setSystemSettings] = useState<AdminSystemSettings>(defaultSystemSettings);
    const [systemLoading, setSystemLoading] = useState(false);
    const [systemSaving, setSystemSaving] = useState(false);
    const [systemMsg, setSystemMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Notification prefs
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);
    const [apptReminders, setApptReminders] = useState(true);

    const hydrateProfileForm = useCallback((profile: ProfileDetails | null) => {
        if (!profile) return;

        setProfileDetails(profile);
        setFullName(textValue(profile.fullName));
        setEmail(textValue(profile.email));
        setPhone(textValue(profile.phoneNumber));
        setProfilePictureUrl(textValue(profile.profilePictureUrl));
        setPatientProfile({
            dateOfBirth: textValue(profile.dateOfBirth),
            gender: textValue(profile.gender),
            bloodGroup: textValue(profile.bloodGroup),
            address: textValue(profile.address),
            emergencyContactName: textValue(profile.emergencyContactName),
            emergencyContact: textValue(profile.emergencyContact),
            insuranceProvider: textValue(profile.insuranceProvider),
            insuranceNumber: textValue(profile.insuranceNumber),
            allergies: textValue(profile.allergies),
            currentMedications: textValue(profile.currentMedications),
        });
        setDoctorProfile({
            specialization: textValue(profile.specialization),
            qualification: textValue(profile.qualification),
            department: textValue(profile.department),
            licenseNumber: textValue(profile.licenseNumber),
            experienceYears: textValue(profile.experienceYears),
            consultationFee: textValue(profile.consultationFee),
            availableDays: textValue(profile.availableDays),
            availableTimeStart: textValue(profile.availableTimeStart),
            availableTimeEnd: textValue(profile.availableTimeEnd),
        });
    }, []);

    const loadProfile = useCallback(async () => {
        if (!user?.id) return;
        setProfileLoading(true);
        setSaveError(null);
        try {
            const res = await api.get(`/users/${user.id}`);
            hydrateProfileForm((res.data?.data || res.data) as ProfileDetails);
        } catch (err: unknown) {
            setSaveError(getApiErrorMessage(err, 'Unable to load full profile details.'));
        } finally {
            setProfileLoading(false);
        }
    }, [hydrateProfileForm, user?.id]);

    useEffect(() => {
        if (!user?.id || seededUserIdRef.current === user.id) return;
        seededUserIdRef.current = user.id;
        hydrateProfileForm(user as ProfileDetails | null);
    }, [hydrateProfileForm, user]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const updatePatientProfile = (key: keyof PatientProfileForm, value: string) => {
        setPatientProfile(prev => ({ ...prev, [key]: value }));
    };

    const updateDoctorProfile = (key: keyof DoctorProfileForm, value: string) => {
        setDoctorProfile(prev => ({ ...prev, [key]: value }));
    };

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveError(null);
        try {
            const payload: Record<string, string> = { fullName, email, phoneNumber: phone };
            if (user?.role === 'PATIENT') Object.assign(payload, patientProfile);
            if (user?.role === 'DOCTOR') Object.assign(payload, doctorProfile);

            const res = await api.patch(`/users/${user?.id}`, payload);
            const updatedProfile = (res.data?.data || { ...profileDetails, ...payload }) as ProfileDetails;
            hydrateProfileForm(updatedProfile);
            dispatch(updateCurrentUser({
                fullName: updatedProfile.fullName || fullName,
                email: updatedProfile.email || email,
                phoneNumber: updatedProfile.phoneNumber || phone,
                profilePictureUrl: updatedProfile.profilePictureUrl || profilePictureUrl,
            }));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            setSaveError(getApiErrorMessage(err, 'Failed to update profile.'));
        } finally { setSaving(false); }
    };

    const uploadProfilePicture = async (file: File) => {
        if (!user?.id) return;
        if (!file.type.startsWith('image/')) {
            setSaveError('Please choose a valid image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setSaveError('Profile picture must be 2 MB or smaller.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setPhotoUploading(true);
        setSaveError(null);
        try {
            const res = await api.post(`/users/${user.id}/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const nextUrl = res.data?.data?.profilePictureUrl || '';
            setProfilePictureUrl(nextUrl);
            setProfileDetails(prev => prev ? { ...prev, profilePictureUrl: nextUrl } : prev);
            dispatch(updateCurrentUser({ profilePictureUrl: nextUrl }));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            setSaveError(getApiErrorMessage(err, 'Failed to upload profile picture.'));
        } finally {
            setPhotoUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeProfilePicture = async () => {
        if (!user?.id) return;
        setPhotoUploading(true);
        setSaveError(null);
        try {
            await api.patch(`/users/${user.id}`, { profilePictureUrl: '' });
            setProfilePictureUrl('');
            setProfileDetails(prev => prev ? { ...prev, profilePictureUrl: '' } : prev);
            dispatch(updateCurrentUser({ profilePictureUrl: '' }));
        } catch (err: unknown) {
            setSaveError(getApiErrorMessage(err, 'Failed to remove profile picture.'));
        } finally {
            setPhotoUploading(false);
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
        if (newPwd.length < 6) { setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
        setPwdSaving(true); setPwdMsg(null);
        try {
            await api.patch(`/users/${user?.id}/change-password`, { currentPassword: currentPwd, newPassword: newPwd });
            setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (err: unknown) {
            setPwdMsg({ type: 'error', text: getApiErrorMessage(err, 'Failed to change password.') });
        } finally { setPwdSaving(false); }
    };

    const updateSystemSetting = <K extends keyof AdminSystemSettings>(key: K, value: AdminSystemSettings[K]) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
    };

    const loadSystemSettings = useCallback(async () => {
        if (!isAdmin) return;
        setSystemLoading(true);
        setSystemMsg(null);
        try {
            const res = await api.get('/admin/settings');
            setSystemSettings(unwrapSystemSettings(res.data));
        } catch (err: unknown) {
            setSystemMsg({ type: 'error', text: getApiErrorMessage(err, 'Unable to load admin system settings.') });
        } finally {
            setSystemLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            void loadSystemSettings();
        }
    }, [isAdmin, loadSystemSettings]);

    const saveSystemSettings = async () => {
        setSystemSaving(true);
        setSystemMsg(null);

        if (systemSettings.maxAppointmentsPerDoctorPerDay < 1 || systemSettings.maxAppointmentsPerDoctorPerDay > 200) {
            setSystemSaving(false);
            setSystemMsg({ type: 'error', text: 'Max appointments must be between 1 and 200.' });
            return;
        }
        if (systemSettings.appointmentReminderHours < 1 || systemSettings.appointmentReminderHours > 168) {
            setSystemSaving(false);
            setSystemMsg({ type: 'error', text: 'Reminder hours must be between 1 and 168.' });
            return;
        }
        if (systemSettings.billingGraceDays < 0 || systemSettings.billingGraceDays > 90) {
            setSystemSaving(false);
            setSystemMsg({ type: 'error', text: 'Billing grace days must be between 0 and 90.' });
            return;
        }

        try {
            const res = await api.put('/admin/settings', systemSettings);
            setSystemSettings(unwrapSystemSettings(res.data));
            setSystemMsg({ type: 'success', text: 'System settings saved to the backend.' });
        } catch (err: unknown) {
            setSystemMsg({ type: 'error', text: getApiErrorMessage(err, 'Unable to save system settings.') });
        } finally {
            setSystemSaving(false);
        }
    };

    const healthCards = useMemo(() => {
        const health = systemSettings.health || {};
        return [
            { label: 'API Status', value: String(health.status || 'OPERATIONAL'), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Database', value: String(health.database || 'Connected'), icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Auth', value: String(health.auth || 'JWT active'), icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Users', value: String(health.totalUsers ?? '0'), icon: User, color: 'text-slate-700', bg: 'bg-slate-100' },
        ];
    }, [systemSettings.health]);

    const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
        { id: 'profile',       label: 'Profile',      icon: User },
        { id: 'security',      label: 'Security',     icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        ...(isAdmin ? [{ id: 'system' as Tab, label: 'System', icon: Shield }] : []),
    ];
    const effectiveProfile = profileDetails || (user as ProfileDetails | null);
    const role = effectiveProfile?.role || user?.role || 'USER';
    const joinedDate = formatDate(effectiveProfile?.createdAt);
    const lastUpdatedDate = formatDateTime(effectiveProfile?.updatedAt);
    const requiredProfileFields = useMemo(() => {
        const baseFields = [fullName, email, phone, profilePictureUrl];
        if (role === 'PATIENT') {
            return [
                ...baseFields,
                patientProfile.dateOfBirth,
                patientProfile.bloodGroup,
                patientProfile.address,
                patientProfile.emergencyContact,
            ];
        }
        if (role === 'DOCTOR') {
            return [
                ...baseFields,
                doctorProfile.specialization,
                doctorProfile.qualification,
                doctorProfile.department,
                doctorProfile.licenseNumber,
            ];
        }
        return [...baseFields, effectiveProfile?.username];
    }, [
        doctorProfile.department,
        doctorProfile.licenseNumber,
        doctorProfile.qualification,
        doctorProfile.specialization,
        effectiveProfile?.username,
        email,
        fullName,
        patientProfile.address,
        patientProfile.bloodGroup,
        patientProfile.dateOfBirth,
        patientProfile.emergencyContact,
        phone,
        profilePictureUrl,
        role,
    ]);
    const profileCompletion = Math.round(
        (requiredProfileFields.filter(value => textValue(value).trim()).length / requiredProfileFields.length) * 100
    );
    const roleTitle = role === 'ADMIN' ? 'Root Administrator' : role === 'DOCTOR' ? 'Clinical Provider' : 'Patient Member';
    const profileSummary = role === 'DOCTOR'
        ? displayValue(doctorProfile.specialization || doctorProfile.department)
        : role === 'PATIENT'
            ? displayValue([patientProfile.bloodGroup, patientProfile.gender].filter(Boolean).join(' • '))
            : 'Hospital operations access';
    const accountFacts = [
        { label: 'User ID', value: user?.id ? `HMS-${String(user.id).padStart(4, '0')}` : 'Not available', icon: IdCard },
        { label: 'Account Type', value: roleTitle, icon: BadgeCheck },
        { label: 'Joined', value: joinedDate, icon: CalendarDays },
        { label: 'Auth Provider', value: displayValue(effectiveProfile?.provider || 'LOCAL'), icon: Shield },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Settings className="h-6 w-6 text-gray-600" /> Settings
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account, security, and system preferences.</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-xl border border-[var(--border-color)] w-fit" style={{ background: 'var(--sidebar-bg)' }}>
                {TABS.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                            style={{ color: tab === t.id ? undefined : 'var(--text-muted)' }}>
                            <Icon className="h-4 w-4" />{t.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Profile Tab ── */}
            {tab === 'profile' && (
                <div className="space-y-5 animate-fadeIn">
                    <Card className="overflow-hidden border-[var(--border-color)] shadow-sm">
                        <CardContent className="p-0">
                            <div className="border-b border-[var(--border-color)] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-5 text-white sm:p-6">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="relative shrink-0">
                                            <ProfileAvatar
                                                profilePictureUrl={profilePictureUrl}
                                                name={fullName || user?.username}
                                                className="h-24 w-24 rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-lg"
                                                fallbackClassName="bg-gradient-to-br from-teal-400 to-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white text-slate-900 shadow-lg transition-transform hover:scale-105"
                                                title="Change profile picture"
                                                aria-label="Change profile picture"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-normal text-teal-100">
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    {effectiveProfile?.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                                <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-normal text-blue-100">
                                                    {roleTitle}
                                                </span>
                                            </div>
                                            <h2 className="truncate text-2xl font-bold sm:text-3xl">{fullName || user?.username || 'HMS User'}</h2>
                                            <p className="mt-1 text-sm text-slate-200">{profileSummary}</p>
                                            <p className="mt-1 text-xs text-slate-300">@{user?.username || 'username'} • {displayValue(email)}</p>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-normal text-slate-300">Profile completeness</p>
                                                <p className="mt-1 text-2xl font-bold">{profileCompletion}%</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                                                isLoading={profileLoading}
                                                onClick={loadProfile}
                                            >
                                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                                Refresh
                                            </Button>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-white/15">
                                            <div
                                                className="h-full rounded-full bg-teal-300 transition-all"
                                                style={{ width: `${profileCompletion}%` }}
                                            />
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                            Complete role details help appointments, telehealth, billing, and support teams identify you faster.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
                                {accountFacts.map(fact => {
                                    const Icon = fact.icon;
                                    return (
                                        <div key={fact.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold" style={{ color: 'var(--text-color)' }}>{fact.value}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fact.label}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
                        <Card className="border-[var(--border-color)] shadow-sm">
                            <CardContent className="p-5 sm:p-6">
                                <form onSubmit={saveProfile} className="space-y-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Profile Details</h2>
                                            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                Keep your identity, contact, and role-specific details accurate across HMS.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) uploadProfilePicture(file);
                                                }}
                                            />
                                            <Button type="button" variant="outline" className="gap-2" isLoading={photoUploading} onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="h-4 w-4" />
                                                Photo
                                            </Button>
                                            {profilePictureUrl && (
                                                <Button type="button" variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50" disabled={photoUploading} onClick={removeProfilePicture}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                                        <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                                        <Input label="Phone number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" />
                                        <Input label="Username" value={user?.username || ''} disabled className="cursor-not-allowed opacity-60" />
                                    </div>

                                    {role === 'PATIENT' && (
                                        <div className="space-y-4 border-t border-[var(--border-color)] pt-5">
                                            <div className="flex items-center gap-2">
                                                <HeartPulse className="h-5 w-5 text-teal-600" />
                                                <div>
                                                    <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Patient Health Profile</h3>
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Used by doctors during appointments and telehealth consults.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input label="Date of birth" type="date" value={patientProfile.dateOfBirth} onChange={e => updatePatientProfile('dateOfBirth', e.target.value)} />
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-color)]">Gender</label>
                                                    <select className={selectClassName} value={patientProfile.gender} onChange={e => updatePatientProfile('gender', e.target.value)}>
                                                        <option value="">Select gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-color)]">Blood group</label>
                                                    <select className={selectClassName} value={patientProfile.bloodGroup} onChange={e => updatePatientProfile('bloodGroup', e.target.value)}>
                                                        <option value="">Select blood group</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group} value={group}>{group}</option>)}
                                                    </select>
                                                </div>
                                                <Input label="Emergency contact name" value={patientProfile.emergencyContactName} onChange={e => updatePatientProfile('emergencyContactName', e.target.value)} placeholder="Family member name" />
                                                <Input label="Emergency contact phone" value={patientProfile.emergencyContact} onChange={e => updatePatientProfile('emergencyContact', e.target.value)} placeholder="+91 9XXXXXXXXX" />
                                                <Input label="Insurance provider" value={patientProfile.insuranceProvider} onChange={e => updatePatientProfile('insuranceProvider', e.target.value)} placeholder="Provider name" />
                                                <Input label="Insurance number" value={patientProfile.insuranceNumber} onChange={e => updatePatientProfile('insuranceNumber', e.target.value)} placeholder="Policy / member ID" />
                                                <div className="md:col-span-2">
                                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-color)]">Address</label>
                                                    <textarea className={textAreaClassName} value={patientProfile.address} onChange={e => updatePatientProfile('address', e.target.value)} placeholder="Street, city, state, postal code" />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-color)]">Known allergies</label>
                                                    <textarea className={textAreaClassName} value={patientProfile.allergies} onChange={e => updatePatientProfile('allergies', e.target.value)} placeholder="Example: Penicillin, peanuts" />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-color)]">Current medications</label>
                                                    <textarea className={textAreaClassName} value={patientProfile.currentMedications} onChange={e => updatePatientProfile('currentMedications', e.target.value)} placeholder="Ongoing medicines and dosage" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'DOCTOR' && (
                                        <div className="space-y-4 border-t border-[var(--border-color)] pt-5">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-5 w-5 text-teal-600" />
                                                <div>
                                                    <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Doctor Professional Profile</h3>
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Controls how patients and admins see clinical availability.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Input label="Specialization" value={doctorProfile.specialization} onChange={e => updateDoctorProfile('specialization', e.target.value)} placeholder="Cardiology" />
                                                <Input label="Department" value={doctorProfile.department} onChange={e => updateDoctorProfile('department', e.target.value)} placeholder="Heart & Vascular" />
                                                <Input label="Qualification" value={doctorProfile.qualification} onChange={e => updateDoctorProfile('qualification', e.target.value)} placeholder="MBBS, MD" />
                                                <Input label="License number" value={doctorProfile.licenseNumber} onChange={e => updateDoctorProfile('licenseNumber', e.target.value)} placeholder="Medical registration ID" />
                                                <Input label="Experience years" type="number" min="0" value={doctorProfile.experienceYears} onChange={e => updateDoctorProfile('experienceYears', e.target.value)} />
                                                <Input label="Consultation fee (₹)" type="number" min="0" value={doctorProfile.consultationFee} onChange={e => updateDoctorProfile('consultationFee', e.target.value)} />
                                                <Input label="Available days" value={doctorProfile.availableDays} onChange={e => updateDoctorProfile('availableDays', e.target.value)} placeholder="Monday, Wednesday, Friday" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input label="Start time" type="time" value={doctorProfile.availableTimeStart} onChange={e => updateDoctorProfile('availableTimeStart', e.target.value)} />
                                                    <Input label="End time" type="time" value={doctorProfile.availableTimeEnd} onChange={e => updateDoctorProfile('availableTimeEnd', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {role === 'ADMIN' && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                            <div className="flex items-start gap-3">
                                                <Shield className="mt-0.5 h-5 w-5 shrink-0" />
                                                <div>
                                                    <p className="font-bold">Administrator account</p>
                                                    <p className="mt-1 text-xs leading-relaxed">This profile has operational access to users, appointments, billing, analytics, notifications, and system controls.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {saveSuccess && (
                                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 animate-fadeIn">
                                            <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
                                        </div>
                                    )}
                                    {saveError && (
                                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 border-t border-[var(--border-color)] pt-5">
                                        <Button type="submit" className="gap-2 bg-teal-600 text-white hover:bg-teal-700" isLoading={saving}>
                                            <Save className="h-4 w-4" />
                                            Save Profile
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => hydrateProfileForm(effectiveProfile)}>
                                            Reset Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-5">
                            <Card className="border-[var(--border-color)] shadow-sm">
                                <CardContent className="space-y-4 p-5">
                                    <div>
                                        <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Profile Snapshot</h3>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Live account details from the backend.</p>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { icon: Mail, label: 'Email', value: displayValue(email) },
                                            { icon: Phone, label: 'Phone', value: displayValue(phone) },
                                            { icon: MapPin, label: role === 'PATIENT' ? 'Address' : 'Location', value: role === 'PATIENT' ? displayValue(patientProfile.address) : displayValue(doctorProfile.department) },
                                            { icon: CalendarDays, label: 'Last updated', value: lastUpdatedDate },
                                        ].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.label} className="flex gap-3 rounded-xl border border-[var(--border-color)] p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                                        <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{item.value}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[var(--border-color)] shadow-sm">
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-center gap-2">
                                        {role === 'DOCTOR' ? <BriefcaseMedical className="h-5 w-5 text-teal-600" /> : role === 'PATIENT' ? <HeartPulse className="h-5 w-5 text-teal-600" /> : <Shield className="h-5 w-5 text-teal-600" />}
                                        <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Role Details</h3>
                                    </div>
                                    {role === 'PATIENT' && (
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Blood group</span><strong>{displayValue(patientProfile.bloodGroup)}</strong></div>
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Emergency contact</span><strong>{displayValue(patientProfile.emergencyContact)}</strong></div>
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Insurance</span><strong>{displayValue(patientProfile.insuranceProvider)}</strong></div>
                                        </div>
                                    )}
                                    {role === 'DOCTOR' && (
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-slate-500" /><span className="flex-1 text-[var(--text-muted)]">Department</span><strong>{displayValue(doctorProfile.department)}</strong></div>
                                            <div className="flex items-center gap-3"><BadgeIndianRupee className="h-4 w-4 text-slate-500" /><span className="flex-1 text-[var(--text-muted)]">Fee</span><strong>{doctorProfile.consultationFee ? `₹${doctorProfile.consultationFee}` : 'Not added'}</strong></div>
                                            <div className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-slate-500" /><span className="flex-1 text-[var(--text-muted)]">Availability</span><strong>{displayValue(doctorProfile.availableDays)}</strong></div>
                                        </div>
                                    )}
                                    {role === 'ADMIN' && (
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Scope</span><strong>Full system</strong></div>
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Billing</span><strong>Enabled</strong></div>
                                            <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">System settings</span><strong>Enabled</strong></div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Security Tab ── */}
            {tab === 'security' && (
                <Card className="border-[var(--border-color)] shadow-sm animate-fadeIn">
                    <CardContent className="p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Change Password
                        </h2>
                        <form onSubmit={changePassword} className="space-y-4 max-w-md">
                            {[
                                { label: 'Current Password', val: currentPwd, set: setCurrentPwd },
                                { label: 'New Password',     val: newPwd,     set: setNewPwd },
                                { label: 'Confirm New Password', val: confirmPwd, set: setConfirmPwd },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>{f.label}</label>
                                    <div className="relative">
                                        <Input type={showPwd ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)} required className="pr-10" />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {newPwd && (
                                <div className="flex gap-2 items-center">
                                    <div className={`h-1.5 flex-1 rounded-full ${newPwd.length >= 8 ? 'bg-emerald-400' : newPwd.length >= 6 ? 'bg-amber-400' : 'bg-red-400'}`} />
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {newPwd.length >= 8 ? 'Strong' : newPwd.length >= 6 ? 'Fair' : 'Weak'}
                                    </span>
                                </div>
                            )}
                            {pwdMsg && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${pwdMsg.type === 'success' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                                    {pwdMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4 shrink-0" />} {pwdMsg.text}
                                </div>
                            )}
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" isLoading={pwdSaving}>Update Password</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* ── Notifications Prefs Tab ── */}
            {tab === 'notifications' && (
                <Card className="border-[var(--border-color)] shadow-sm animate-fadeIn">
                    <CardContent className="p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Notification Preferences</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Email Notifications', desc: 'Receive appointment and system alerts via email', val: emailNotif, set: setEmailNotif },
                                { label: 'SMS Notifications',   desc: 'Get text messages for urgent reminders', val: smsNotif, set: setSmsNotif },
                                { label: 'Appointment Reminders', desc: '24-hour before reminder for upcoming appointments', val: apptReminders, set: setApptReminders },
                            ].map(pref => (
                                <div key={pref.label} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{pref.label}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pref.desc}</p>
                                    </div>
                                    <button onClick={() => pref.set(!pref.val)}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${pref.val ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${pref.val ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => alert('Preferences saved!')}>Save Preferences</Button>
                    </CardContent>
                </Card>
            )}

            {/* System Tab (Admin Only) */}
            {tab === 'system' && isAdmin && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {healthCards.map(card => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} className="stat-card flex items-center gap-3">
                                    <div className={`h-11 w-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`h-5 w-5 ${card.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`truncate text-lg font-bold ${card.color}`}>{card.value}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Card className="border-[var(--border-color)] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>System Configuration</h2>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Backend-backed controls for registration, telehealth, notifications, and operational limits.
                                    </p>
                                </div>
                                <Button variant="outline" className="gap-2 w-fit" onClick={() => void loadSystemSettings()} isLoading={systemLoading}>
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>

                            {systemLoading ? (
                                <div className="flex justify-center py-14">
                                    <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <>
                                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {[
                                            {
                                                label: 'Maintenance Mode',
                                                desc: 'Pause patient-facing workflows during planned downtime.',
                                                value: systemSettings.maintenanceMode,
                                                key: 'maintenanceMode' as const,
                                                icon: Server,
                                                danger: true,
                                            },
                                            {
                                                label: 'Allow New Registrations',
                                                desc: 'Permit new patient and doctor account signups.',
                                                value: systemSettings.allowRegistration,
                                                key: 'allowRegistration' as const,
                                                icon: User,
                                            },
                                            {
                                                label: 'Telehealth Enabled',
                                                desc: 'Allow video consultation rooms and call notifications.',
                                                value: systemSettings.telehealthEnabled,
                                                key: 'telehealthEnabled' as const,
                                                icon: Video,
                                            },
                                            {
                                                label: 'Email Notifications',
                                                desc: 'Send appointment, billing, and system updates by email.',
                                                value: systemSettings.emailNotificationsEnabled,
                                                key: 'emailNotificationsEnabled' as const,
                                                icon: Mail,
                                            },
                                            {
                                                label: 'SMS Notifications',
                                                desc: 'Enable SMS reminders for urgent operational alerts.',
                                                value: systemSettings.smsNotificationsEnabled,
                                                key: 'smsNotificationsEnabled' as const,
                                                icon: Smartphone,
                                            },
                                        ].map(setting => {
                                            const Icon = setting.icon;
                                            return (
                                                <div
                                                    key={setting.key}
                                                    className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                                                        setting.danger && setting.value
                                                            ? 'border-red-200 bg-red-50/60 dark:bg-red-900/10'
                                                            : 'border-[var(--border-color)] hover:bg-gray-50/50 dark:hover:bg-slate-800/20'
                                                    }`}
                                                >
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                            setting.danger && setting.value ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-semibold ${setting.danger && setting.value ? 'text-red-600' : ''}`} style={setting.danger && setting.value ? {} : { color: 'var(--text-color)' }}>
                                                                {setting.label}
                                                            </p>
                                                            <p className="text-xs mt-0.5 leading-5" style={{ color: 'var(--text-muted)' }}>{setting.desc}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSystemSetting(setting.key, !setting.value)}
                                                        className={`relative h-6 w-11 rounded-full transition-all duration-200 ${
                                                            setting.value ? (setting.danger ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-300'
                                                        }`}
                                                        aria-label={setting.label}
                                                    >
                                                        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${setting.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="rounded-xl border border-[var(--border-color)] p-4">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Max Appointments Per Day</label>
                                            <Input
                                                type="number"
                                                value={systemSettings.maxAppointmentsPerDoctorPerDay}
                                                onChange={e => updateSystemSetting('maxAppointmentsPerDoctorPerDay', toNumber(e.target.value, 20))}
                                                min="1"
                                                max="200"
                                            />
                                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Per doctor booking limit.</p>
                                        </div>
                                        <div className="rounded-xl border border-[var(--border-color)] p-4">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Reminder Lead Time</label>
                                            <Input
                                                type="number"
                                                value={systemSettings.appointmentReminderHours}
                                                onChange={e => updateSystemSetting('appointmentReminderHours', toNumber(e.target.value, 24))}
                                                min="1"
                                                max="168"
                                            />
                                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Hours before appointment.</p>
                                        </div>
                                        <div className="rounded-xl border border-[var(--border-color)] p-4">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Billing Grace Days</label>
                                            <Input
                                                type="number"
                                                value={systemSettings.billingGraceDays}
                                                onChange={e => updateSystemSetting('billingGraceDays', toNumber(e.target.value, 7))}
                                                min="0"
                                                max="90"
                                            />
                                            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Days before unpaid bills escalate.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Support Email</label>
                                            <Input
                                                type="email"
                                                value={systemSettings.supportEmail}
                                                onChange={e => updateSystemSetting('supportEmail', e.target.value)}
                                                placeholder="support@hospital.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Emergency Banner</label>
                                            <Input
                                                value={systemSettings.emergencyBannerMessage}
                                                onChange={e => updateSystemSetting('emergencyBannerMessage', e.target.value)}
                                                placeholder="Optional hospital-wide alert message"
                                                maxLength={500}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-xl border border-[var(--border-color)] p-4">
                                        <div className="flex items-start gap-3">
                                            <MonitorCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>Operational Snapshot</p>
                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <span>Profile: {String(systemSettings.health?.activeProfile || 'default')}</span>
                                                    <span>Server time: {String(systemSettings.health?.serverTime || 'not loaded')}</span>
                                                    <span>Appointments: {String(systemSettings.health?.totalAppointments ?? '0')}</span>
                                                    <span>Bills: {String(systemSettings.health?.totalBills ?? '0')}</span>
                                                    <span>Last updated by: {systemSettings.lastUpdatedBy || 'not saved yet'}</span>
                                                    <span>Last updated: {systemSettings.lastUpdatedAt ? new Date(systemSettings.lastUpdatedAt).toLocaleString('en-IN') : 'not saved yet'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {systemMsg && (
                                        <div className={`mt-5 flex items-center gap-2 rounded-xl border p-3 text-sm ${
                                            systemMsg.type === 'success'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                : 'border-red-200 bg-red-50 text-red-700'
                                        }`}>
                                            {systemMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                            {systemMsg.text}
                                        </div>
                                    )}

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Button className="gap-2 bg-gray-900 hover:bg-black text-white" onClick={saveSystemSettings} isLoading={systemSaving}>
                                            <Save className="h-4 w-4" />
                                            Apply System Settings
                                        </Button>
                                        <Button variant="outline" onClick={() => void loadSystemSettings()}>
                                            Reset from Server
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
