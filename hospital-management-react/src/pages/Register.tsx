import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

type ApiResponse = { success: boolean; message: string; data?: unknown };
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const res = await axios.post<ApiResponse>(`${API_BASE}/auth/register`, form);
      setSuccess(res.data.message || 'Account created! Redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      let msg = 'Registration failed. Please try again.';
      if (axios.isAxiosError<ApiResponse>(err)) msg = err.response?.data?.message || msg;
      setError(msg);
    } finally { setLoading(false); }
  };

  const step1OK = !!(form.fullName && form.username && form.email && form.phoneNumber);
  const score = pwdStrength(form.password);
  const sl = strengthLabel(score);

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', height: 48, border: `1.5px solid ${focused === name ? '#0dcfba' : '#e2e8f0'}`,
    borderRadius: 12, padding: '0 16px', fontSize: 14, fontWeight: 500, color: '#1e293b',
    background: '#f8fafc', outline: 'none',
    boxShadow: focused === name ? '0 0 0 3px rgba(13,207,186,0.15)' : 'none',
    transition: 'border-color .2s, box-shadow .2s',
  });

  return (
    <div className="auth-page" style={S.page}>
      <style>{CSS}</style>

      {/* ── LEFT PANEL ─────────────────────────── */}
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

      {/* ── RIGHT PANEL ─────────────────────────── */}
      <div className="auth-right" style={{ ...S.right, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(24px)', transition: 'all .7s cubic-bezier(.16,1,.3,1) .1s' }}>
        <div style={S.card}>
          <h2 style={S.cardTitle}>Create Account</h2>
          <p style={S.cardSub}>Join thousands of patients and doctors</p>

          {/* Role tabs */}
          <div style={S.tabs}>
            {(['PATIENT', 'DOCTOR'] as Role[]).map(r => {
              const on = form.role === r;
              return (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} className="role-tab"
                  style={{ ...S.tab, background: on ? '#0dcfba' : 'transparent', border: `1.5px solid ${on ? '#0dcfba' : '#e2e8f0'}`, boxShadow: on ? '0 4px 16px rgba(13,207,186,0.4)' : 'none', transform: on ? 'translateY(-1px)' : 'none', flex: 1 }}>
                  {r === 'PATIENT' ? <PatientIcon active={on}/> : <DoctorIcon active={on}/>}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: on ? '#fff' : '#64748b', margin: 0 }}>{ROLE_META[r].label}</p>
                    <p style={{ fontSize: 11, color: on ? 'rgba(255,255,255,0.8)' : '#94a3b8', margin: '2px 0 0' }}>{ROLE_META[r].desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= s ? '#0dcfba' : '#f1f5f9', border: `2px solid ${step >= s ? '#0dcfba' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step >= s ? '#fff' : '#94a3b8', transition: 'all .3s', boxShadow: step === s ? '0 0 12px rgba(13,207,186,0.5)' : 'none' }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: step === s ? 600 : 400, color: step >= s ? '#0f172a' : '#94a3b8' }}>
                    {s === 1 ? 'Basic Info' : 'Set Password'}
                  </span>
                </div>
                {s < 2 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: step > 1 ? '#0dcfba' : '#e2e8f0', transition: 'background .4s' }}/>}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideIn .3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input name="fullName"    placeholder="Full Name"    value={form.fullName}    onChange={handleChange} onFocus={() => setFocused('fullName')}    onBlur={() => setFocused(null)} required style={inputStyle('fullName')}/>
                <input name="username"    placeholder="Username"     value={form.username}    onChange={handleChange} onFocus={() => setFocused('username')}    onBlur={() => setFocused(null)} required style={inputStyle('username')}/>
              </div>
              <input name="email"         placeholder="Email Address" type="email" value={form.email}  onChange={handleChange} onFocus={() => setFocused('email')}  onBlur={() => setFocused(null)} required style={inputStyle('email')}/>
              <input name="phoneNumber"   placeholder="Phone Number (10 digits)" value={form.phoneNumber} onChange={handleChange} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} required pattern="\d{10}" title="10 digits" style={inputStyle('phone')}/>

              <button type="button" onClick={() => step1OK && setStep(2)} style={{ height: 50, borderRadius: 12, border: 'none', background: step1OK ? 'linear-gradient(135deg, #0dcfba 0%, #0ea5e9 100%)' : '#f1f5f9', color: step1OK ? '#fff' : '#94a3b8', fontSize: 15, fontWeight: 700, cursor: step1OK ? 'pointer' : 'not-allowed', boxShadow: step1OK ? '0 6px 24px rgba(13,207,186,0.4)' : 'none', transition: 'all .25s', marginTop: 4 }} className={step1OK ? 'login-btn' : ''}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideIn .3s ease' }}>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPwd ? 'text' : 'password'} placeholder="Create a password (min 6 chars)" value={form.password} onChange={handleChange} onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)} required minLength={6} style={{ ...inputStyle('pwd'), paddingRight: 44 }}/>
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <EyeIcon off={showPwd}/>
                </button>
              </div>

              {/* Password strength */}
              {form.password && (
                <div>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? sl.color : '#f1f5f9', transition: 'background .3s' }}/>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: sl.color, fontWeight: 600 }}>{sl.text} password</span>
                </div>
              )}

              {form.role === 'DOCTOR' && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 13 }}>
                  ⚠️ Doctor accounts require admin approval before sign-in.
                </div>
              )}

              {error   && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontSize: 13 }}>⚠️ {error}</div>}
              {success && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13 }}>✅ {success}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} style={{ height: 50, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '0 20px', transition: 'all .2s' }}>
                  ← Back
                </button>
                <button type="button" disabled={loading} className={loading ? '' : 'login-btn'} onClick={handleSubmit as unknown as React.MouseEventHandler}
                  style={{ flex: 1, height: 50, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0dcfba 0%, #0ea5e9 100%)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(13,207,186,0.4)', opacity: loading ? .7 : 1, transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading
                    ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }}/>
                    : 'Create Account 🎉'}
                </button>
              </div>
            </div>
          )}

          {/* Sign in */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 18 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0dcfba', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  input::placeholder { color: #cbd5e1; font-size: 14px; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f8fafc inset !important; -webkit-text-fill-color: #1e293b !important; }
  .login-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
  .role-tab { transition: all .25s cubic-bezier(.34,1.56,.64,1); outline: none; cursor: pointer; }
  .dev-credit:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); transform: translateY(-1px); }
  @media (max-width: 900px) {
    .auth-page { flex-direction: column; overflow-y: auto !important; }
    .auth-left { flex: none !important; min-height: auto; padding: 32px 24px !important; gap: 28px; }
    .auth-right { padding: 28px 20px !important; }
    .dev-credit { margin-top: 28px !important; }
  }
`;

const S: Record<string, React.CSSProperties> = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'stretch', fontFamily: "'Inter',system-ui,sans-serif", background: 'linear-gradient(135deg, #4dd9c0 0%, #38b2ea 30%, #c084fc 65%, #fb923c 100%)', overflow: 'hidden' },
  left:        { flex: '0 0 48%', padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
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
  right:       { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' },
  card:        { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' },
  cardTitle:   { fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', textAlign: 'center', margin: '0 0 6px' },
  cardSub:     { fontSize: 14, color: '#94a3b8', textAlign: 'center', margin: '0 0 20px', fontWeight: 500 },
  tabs:        { display: 'flex', gap: 10, marginBottom: 20 },
  tab:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 14 },
};

export default Register;
