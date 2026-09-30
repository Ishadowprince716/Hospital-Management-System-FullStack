import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../api';
import { AtSign, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { ConstellationField } from '@designcodeio/threeui';

type ApiResponse<T = unknown> = { success: boolean; message: string; data?: T };
type Role = 'PATIENT' | 'DOCTOR';

const ROLE_META: Record<Role, { label: string; desc: string }> = {
  PATIENT: { label: 'Patient', desc: 'Book appointments & manage health records' },
  DOCTOR:  { label: 'Doctor',  desc: 'Manage patients, schedules & prescriptions' },
};

const PatientIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    <path d="M10.5 10.5h3M12 9v3" strokeWidth="1.5"/>
  </svg>
);

const DoctorIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    <path d="M8 16 Q7 18.5 7 19.5 Q7 21.5 9.5 21.5 Q12 21.5 12 19.5" strokeWidth="1.5"/>
    <circle cx="12" cy="19.5" r="1" fill={active ? '#fff' : '#94a3b8'}/>
  </svg>
);

const EyeIcon = ({ off }: { off?: boolean }) => off
  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M17.9 17.9A10 10 0 0 1 12 20C5 20 1 12 1 12a17.8 17.8 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a17.5 17.5 0 0 1-2.2 3.2M1 1l22 22"/></svg>
  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const pwdStrength = (p: string) => {
  let s = 0;
  if (p.length >= 6) s++; if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const strengthLabel = (s: number) =>
  s <= 1 ? { text: 'Weak',   color: '#ef4444' } :
  s <= 3 ? { text: 'Fair',   color: '#f59e0b' } :
  s === 4 ? { text: 'Good',  color: '#3b82f6' } :
            { text: 'Strong', color: '#10b981' };

const FEATURES = [
  { icon: '🔒', title: 'Secure & Private',     desc: 'Your health data is fully encrypted' },
  { icon: '📱', title: 'Access Anywhere',       desc: 'Manage your health on any device'   },
  { icon: '⚡', title: 'Instant Appointments', desc: 'Book a slot in under 60 seconds'     },
];

// Defined outside component to prevent unmounting / losing focus on every keystroke
interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  icon: React.ElementType;
  isFocused: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  placeholder,
  type = 'text',
  icon: Icon,
  isFocused,
  onChange,
  onFocus,
  onBlur,
  hint,
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {hint && <span style={{ fontSize: 10, color: '#94a3b8' }}>{hint}</span>}
    </div>
    <span style={{ position: 'relative', display: 'block' }}>
      <Icon size={17} strokeWidth={2.1} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isFocused ? '#14b8a6' : '#94a3b8', transition: 'color .2s' }} />
      <input
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required
        autoComplete={name === 'email' ? 'email' : name === 'fullName' ? 'name' : name === 'username' ? 'username' : 'tel'}
        style={{
          width: '100%',
          height: 48,
          border: `1.5px solid ${isFocused ? '#14b8a6' : '#d7e0ec'}`,
          borderRadius: 14,
          padding: '0 18px 0 44px',
          fontSize: 14,
          fontWeight: 600,
          color: '#0f172a',
          background: '#fff',
          outline: 'none',
          boxShadow: isFocused ? '0 0 0 4px rgba(20,184,166,0.14), 0 8px 18px rgba(15,23,42,0.06)' : '0 2px 8px rgba(15,23,42,0.03)',
          transition: 'border-color .2s, box-shadow .2s, background .2s',
        }}
      />
    </span>
  </label>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', phoneNumber: '', role: 'PATIENT' as Role });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [showPwd, setShowPwd]   = useState(false);
  const [step,    setStep]      = useState<1 | 2>(1);
  const [mounted, setMounted]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setForm(f => ({ ...f, [name]: name === 'phoneNumber' ? value.replace(/\D/g, '').slice(0, 10) : value }));
  };

  const validateStep1 = (): boolean => {
    const cleanName = form.fullName.trim();
    const cleanUser = form.username.trim();
    const cleanEmail = form.email.trim();
    const cleanPhone = form.phoneNumber.trim();

    if (cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return false;
    }
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(cleanUser)) {
      setError('Username must be 3-50 characters with only letters, numbers, or underscore (no spaces).');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      role: form.role,
    };

    try {
      const res = await api.post<ApiResponse>('/auth/register', payload);
      setSuccess(res.data.message || 'Account created successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Registration failed. Please verify your details.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (selectedRole: Role) => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setError(null);
    setForm({
      fullName: selectedRole === 'DOCTOR' ? `Dr. Test Physician ${rand}` : `Test Patient ${rand}`,
      username: selectedRole === 'DOCTOR' ? `doctor_${rand}` : `patient_${rand}`,
      email: `${selectedRole.toLowerCase()}_${rand}@hospital.local`,
      phoneNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'Password123!',
      role: selectedRole,
    });
    setStep(2);
  };

  const score = pwdStrength(form.password);
  const sl = strengthLabel(score);

  return (
    <div className="auth-page" style={S.page}>
      <style>{CSS}</style>

      {/* 3D Interactive ThreeUI Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.65, pointerEvents: 'none' }}>
        <ConstellationField mode="dark" speed={0.8} density={0.8} />
      </div>

      {/* LEFT PANEL */}
      <div className="auth-left" style={{ ...S.left, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-24px)', transition: 'all .7s cubic-bezier(.16,1,.3,1)' }}>
        <div>
          {/* Logo */}
          <div style={S.logoBox}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 21.6S3 15 3 8.5a5.5 5.5 0 0 1 9.5-3.76A5.5 5.5 0 0 1 21 8.5C21 15 12 21.6 12 21.6z"/></svg>
          </div>
          <div style={{ marginBottom: 36, marginTop: 20 }}>
            <h1 style={S.heading}>Join<br/>MediCare</h1>
            <p style={S.tagline}>Your health journey starts here</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={S.featureCard}>
                <div style={S.featureIcon}>{f.icon}</div>
                <div>
                  <p style={S.featureTitle}>{f.title}</p>
                  <p style={S.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a
          href="https://www.linkedin.com/in/rahul-singh-kushwah-233b36283"
          target="_blank"
          rel="noreferrer"
          className="dev-credit"
          style={S.devCredit}
          aria-label="Open Rahul Singh Kushwah LinkedIn profile"
        >
          <img src="/rahul.jpg" alt="Rahul Singh Kushwah" style={S.devAvatar} />
          <div style={S.devText}>
            <p style={S.devEyebrow}>Designed &amp; Developed by</p>
            <p style={S.devName}>Rahul Singh Kushwah</p>
            <p style={S.devRole}>Full Stack Developer &amp; UI/UX Designer</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={S.devIcon}>
            <path d="M7 10v7M7 7.2v.1M11 17v-4.1c0-1.6 1.1-2.9 2.7-2.9s2.3 1 2.3 2.8V17" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#fff" strokeWidth="1.8"/>
          </svg>
        </a>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right" style={{ ...S.right, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(24px)', transition: 'all .7s cubic-bezier(.16,1,.3,1) .1s' }}>
        <div className="register-card" style={S.card}>
          <div className="register-mark" style={S.cardHeaderMark}>MediCare Access</div>
          <h2 style={S.cardTitle}>Create Account</h2>
          <p style={S.cardSub}>Join thousands of patients and healthcare providers</p>

          {/* Quick Demo Test Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap', padding: '8px 12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>Quick Fill Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('PATIENT')}
              className="quick-chip"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f766e',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              ⚡ Demo Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('DOCTOR')}
              className="quick-chip"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0284c7',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              ⚡ Demo Doctor
            </button>
          </div>

          <div className="register-trust" style={S.trustStrip}>
            <ShieldCheck size={16} strokeWidth={2.3} />
            <span>Secure account setup with encrypted health records</span>
          </div>

          {/* Role tabs */}
          <div style={S.tabs}>
            {(['PATIENT', 'DOCTOR'] as Role[]).map(r => {
              const on = form.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className="role-tab"
                  style={{
                    ...S.tab,
                    background: on ? 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' : '#fff',
                    border: `1.5px solid ${on ? 'rgba(20,184,166,0)' : '#d7e0ec'}`,
                    boxShadow: on ? '0 12px 28px rgba(20,184,166,0.28)' : '0 5px 18px rgba(15,23,42,0.04)',
                    transform: on ? 'translateY(-2px)' : 'none',
                    flex: 1,
                  }}
                >
                  {r === 'PATIENT' ? <PatientIcon active={on}/> : <DoctorIcon active={on}/>}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: on ? '#fff' : '#334155', margin: 0 }}>{ROLE_META[r].label}</p>
                    <p style={{ fontSize: 11, lineHeight: 1.35, color: on ? 'rgba(255,255,255,0.84)' : '#64748b', margin: '4px 0 0' }}>{ROLE_META[r].desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step indicator */}
          <div style={S.stepper}>
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: step >= s ? 'linear-gradient(135deg, #14b8a6, #0ea5e9)' : '#f8fafc', border: `1.5px solid ${step >= s ? 'rgba(20,184,166,0)' : '#d7e0ec'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: step >= s ? '#fff' : '#94a3b8', transition: 'all .3s', boxShadow: step === s ? '0 8px 18px rgba(20,184,166,0.28)' : 'none' }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: step === s ? 800 : 600, color: step >= s ? '#0f172a' : '#94a3b8' }}>
                    {s === 1 ? 'Basic Info' : 'Set Password'}
                  </span>
                </div>
                {s < 2 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: step > 1 ? '#0dcfba' : '#e2e8f0', transition: 'background .4s' }}/>}
              </React.Fragment>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              ✅ {success}
            </div>
          )}

          {/* Step 1 Form */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideIn .3s ease' }}>
              <div className="register-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FormField
                  name="fullName"
                  label="Full name"
                  placeholder="Rahul Singh"
                  icon={UserRound}
                  value={form.fullName}
                  isFocused={focused === 'fullName'}
                  onChange={handleChange}
                  onFocus={() => setFocused('fullName')}
                  onBlur={() => setFocused(null)}
                />
                <FormField
                  name="username"
                  label="Username"
                  placeholder="rahul716"
                  hint="no spaces"
                  icon={UserRound}
                  value={form.username}
                  isFocused={focused === 'username'}
                  onChange={handleChange}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                />
              </div>
              <FormField
                name="email"
                label="Email address"
                placeholder="name@example.com"
                type="email"
                icon={AtSign}
                value={form.email}
                isFocused={focused === 'email'}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
              <FormField
                name="phoneNumber"
                label="Phone number"
                placeholder="10 digit mobile number"
                icon={Phone}
                value={form.phoneNumber}
                isFocused={focused === 'phoneNumber'}
                onChange={handleChange}
                onFocus={() => setFocused('phoneNumber')}
                onBlur={() => setFocused(null)}
              />

              <button
                type="submit"
                style={{
                  height: 50,
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 12px 28px rgba(20,184,166,0.26)',
                  transition: 'all .25s',
                  marginTop: 6,
                }}
                className="login-btn"
              >
                Continue →
              </button>
            </form>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'slideIn .3s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</span>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('pwd')}
                    onBlur={() => setFocused(null)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      height: 48,
                      border: `1.5px solid ${focused === 'pwd' ? '#14b8a6' : '#d7e0ec'}`,
                      borderRadius: 14,
                      padding: '0 44px 0 18px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#fff',
                      outline: 'none',
                      boxShadow: focused === 'pwd' ? '0 0 0 4px rgba(20,184,166,0.14), 0 8px 18px rgba(15,23,42,0.06)' : '0 2px 8px rgba(15,23,42,0.03)',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                    <EyeIcon off={showPwd}/>
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? sl.color : '#f1f5f9', transition: 'background .3s' }}/>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: sl.color, fontWeight: 700 }}>{sl.text} password</span>
                </div>
              )}

              {form.role === 'DOCTOR' && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 13, fontWeight: 500 }}>
                  ℹ️ Doctor account will be created and activated for clinical workflows.
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} style={{ height: 50, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '0 20px', transition: 'all .2s' }}>
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={loading ? '' : 'login-btn'}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #0dcfba 0%, #0ea5e9 100%)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 24px rgba(13,207,186,0.4)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all .25s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading
                    ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }}/>
                    : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#7c8da6', marginTop: 18 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0dcfba', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; font-synthesis: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  input::placeholder { color: #8da1b8; font-size: 13px; font-weight: 500; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #fff inset !important; -webkit-text-fill-color: #0f172a !important; }
  .login-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 16px 32px rgba(20,184,166,0.30) !important; }
  .role-tab { transition: all .25s cubic-bezier(.34,1.56,.64,1); outline: none; cursor: pointer; }
  .role-tab:hover { border-color: #9fded8 !important; transform: translateY(-2px); }
  .quick-chip:hover { border-color: #0dcfba !important; color: #0dcfba !important; transform: translateY(-1px); }
  .dev-credit:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); transform: translateY(-1px); }
  @media (max-width: 900px) {
    .auth-page { flex-direction: column; overflow-y: auto !important; }
    .auth-left { display: none !important; }
    .auth-right { min-height: 100vh; padding: 16px 20px !important; }
    .register-card { max-width: 468px !important; padding: 18px 28px 20px !important; border-radius: 20px !important; }
    .register-mark { display: none !important; }
    .register-trust { margin: -2px 0 12px !important; padding: 7px 9px !important; font-size: 11px !important; }
    .role-tab { min-height: 92px !important; padding: 12px 10px !important; }
    .dev-credit { margin-top: 28px !important; }
  }
  @media (max-width: 560px) {
    .auth-right { padding: 18px 14px !important; }
    .register-field-grid { grid-template-columns: 1fr !important; }
  }
`;

const S: Record<string, React.CSSProperties> = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'stretch', fontFamily: "'Inter',system-ui,sans-serif", background: 'radial-gradient(ellipse at 25% 25%, #0d9488 0%, #0f172a 65%, #020617 100%)', position: 'relative', overflow: 'auto' },
  left:        { flex: '0 0 48%', padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 2 },
  logoBox:     { width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  heading:     { fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', textShadow: '0 2px 16px rgba(0,0,0,0.12)' },
  tagline:     { fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 10 },
  featureCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' },
  featureIcon: { width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  featureTitle:{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 },
  devCredit:   { display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 390, minHeight: 76, marginTop: 'auto', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', textDecoration: 'none', transition: 'all .2s ease', overflow: 'hidden' },
  devAvatar:   { width: 52, height: 52, borderRadius: '50%', objectFit: 'contain', objectPosition: 'center', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.58)', boxShadow: '0 4px 16px rgba(15,23,42,0.18)', flexShrink: 0, padding: 2, display: 'block' },
  devText:     { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  devEyebrow:  { fontSize: 10, lineHeight: 1.2, color: 'rgba(255,255,255,0.62)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  devName:     { fontSize: 14, lineHeight: 1.25, color: '#2dd4bf', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  devRole:     { fontSize: 11, lineHeight: 1.25, color: 'rgba(255,255,255,0.66)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  devIcon:     { marginLeft: 'auto', opacity: 0.85, flexShrink: 0 },
  right:       { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 48px', position: 'relative', zIndex: 2 },
  card:        { width: '100%', maxWidth: 470, background: 'rgba(255,255,255,0.96)', borderRadius: 24, backdropFilter: 'blur(20px)', padding: '28px 34px 26px', boxShadow: '0 28px 90px rgba(15,23,42,0.30)', border: '1px solid rgba(255,255,255,0.72)' },
  cardHeaderMark: { width: 'fit-content', margin: '0 auto 8px', padding: '5px 12px', borderRadius: 999, background: '#ecfeff', color: '#0f766e', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' },
  cardTitle:   { fontSize: 26, fontWeight: 850, color: '#07111f', letterSpacing: '0', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.12 },
  cardSub:     { fontSize: 14, color: '#63748a', textAlign: 'center', margin: '0 0 16px', fontWeight: 600 },
  trustStrip:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '-4px 0 16px', padding: '8px 10px', borderRadius: 14, background: '#f0fdfa', color: '#0f766e', fontSize: 12, fontWeight: 700, border: '1px solid #ccfbf1' },
  tabs:        { display: 'flex', gap: 12, marginBottom: 16 },
  tab:         { minHeight: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 10px', borderRadius: 16 },
  stepper:     { display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' },
};

export default Register;
