import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import api, { getApiErrorMessage } from '../../api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type Tab = 'profile' | 'security' | 'notifications' | 'system';

const SystemSettings: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === 'ADMIN';
    const [tab, setTab] = useState<Tab>('profile');

    // Profile form
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
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
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [maxApptsPerDay, setMaxApptsPerDay] = useState('20');

    // Notification prefs
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);
    const [apptReminders, setApptReminders] = useState(true);

    // PATCH /users/{id} — update profile
    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setSaveError(null);
        try {
            await api.patch(`/users/${user?.id}`, { fullName, email, phoneNumber: phone });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            setSaveError(getApiErrorMessage(err, 'Failed to update profile.'));
        } finally { setSaving(false); }
    };

    // PATCH /users/{id}/change-password
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

    const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
        { id: 'profile',       label: 'Profile',      icon: User },
        { id: 'security',      label: 'Security',     icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        ...(isAdmin ? [{ id: 'system' as Tab, label: 'System', icon: Shield }] : []),
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
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
                <Card className="border-[var(--border-color)] shadow-sm animate-fadeIn">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-color)]">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>{user?.fullName || user?.username}</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                                <span className="mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">{user?.role}</span>
                            </div>
                        </div>

                        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Edit Profile <span className="text-xs text-blue-400 font-mono ml-2">PUT /users/{'{id}'}</span>
                        </h2>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Full Name</label>
                                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Email Address</label>
                                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Phone Number</label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Username</label>
                                    <Input value={user?.username || ''} disabled className="opacity-60 cursor-not-allowed" />
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Username cannot be changed.</p>
                                </div>
                            </div>
                            {saveSuccess && (
                                <div className="flex items-center gap-2 p-3 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 text-sm animate-fadeIn">
                                    <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
                                </div>
                            )}
                            {saveError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg text-red-600 bg-red-50 border border-red-200 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
                                </div>
                            )}
                            <div className="flex gap-3 pt-1">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" isLoading={saving}>Save Changes</Button>
                                <Button type="button" variant="outline" onClick={() => { setFullName(user?.fullName||''); setEmail(user?.email||''); setPhone(user?.phoneNumber||''); }}>Reset</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* ── Security Tab ── */}
            {tab === 'security' && (
                <Card className="border-[var(--border-color)] shadow-sm animate-fadeIn">
                    <CardContent className="p-6">
                        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                            Change Password <span className="text-xs text-blue-400 font-mono ml-2">PATCH /users/{'{id}'}/change-password</span>
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

            {/* ── System Tab (Admin Only) ── */}
            {tab === 'system' && isAdmin && (
                <Card className="border-[var(--border-color)] shadow-sm animate-fadeIn">
                    <CardContent className="p-6">
                        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-color)' }}>System Configuration</h2>
                        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Admin-only settings that affect the entire hospital system.</p>

                        <div className="space-y-4 mb-6">
                            {[
                                { label: 'Maintenance Mode', desc: 'Temporarily disable patient-facing features', val: maintenanceMode, set: setMaintenanceMode, danger: true },
                                { label: 'Allow New Registrations', desc: 'Let new patients and doctors sign up', val: allowRegistration, set: setAllowRegistration, danger: false },
                            ].map(s => (
                                <div key={s.label} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${s.danger && s.val ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10' : 'border-[var(--border-color)] hover:bg-gray-50/50 dark:hover:bg-slate-800/20'}`}>
                                    <div>
                                        <p className={`text-sm font-medium ${s.danger && s.val ? 'text-red-600' : ''}`} style={s.danger && s.val ? {} : { color: 'var(--text-color)' }}>{s.label}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                                    </div>
                                    <button onClick={() => s.set(!s.val)}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${s.val ? (s.danger ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-300'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${s.val ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-xl border border-[var(--border-color)]">
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>Max Appointments Per Day</label>
                            <div className="flex gap-3 items-center">
                                <Input type="number" value={maxApptsPerDay} onChange={e => setMaxApptsPerDay(e.target.value)} min="1" max="200" className="w-28" />
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>appointments per doctor per day</span>
                            </div>
                        </div>

                        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-700">System Info</p>
                                    <p className="text-xs mt-1 text-amber-600">
                                        Backend: Spring Boot 3.2 · DB: H2 In-Memory · API: localhost:8080 · JWT Auth active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button className="mt-4 bg-gray-900 hover:bg-black text-white" onClick={() => alert('System settings saved (UI only — extend via admin config endpoint)')}>Apply System Settings</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SystemSettings;
