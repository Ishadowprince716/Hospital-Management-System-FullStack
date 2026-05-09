import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import type { RootState } from '../store';
import api, { getApiErrorMessage } from '../api';

type ApiResponse<T> = { success: boolean; message: string; data: T };
type AuthResponse = { token: string; username: string; role: string; userId: number; fullName: string };
type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

const ROLES: { id: Role; label: string }[] = [
  { id: 'PATIENT', label: 'Patient' },
  { id: 'DOCTOR',  label: 'Doctor'  },
  { id: 'ADMIN',   label: 'Admin'   },
];

const PatientIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    <path d="M10.5 10.5h3M12 9v3" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.5"/>
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
const AdminIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 3 4 7v5c0 5 3.6 9.6 8 11 4.4-1.4 8-6 8-11V7L12 3z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);
const EyeIcon = ({ off }: { off?: boolean }) => off
  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M17.9 17.9A10 10 0 0 1 12 20C5 20 1 12 1 12a17.8 17.8 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a17.5 17.5 0 0 1-2.2 3.2M1 1l22 22"/></svg>
  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const FEATURES = [
  { icon: '📅', title: 'Easy Appointments',  desc: 'Book and manage appointments effortlessly' },
  { icon: '📋', title: 'Digital Records',    desc: 'Secure patient record management'           },
  { icon: '👨‍⚕️', title: 'Expert Care',       desc: 'Connect with qualified healthcare professionals' },
];

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<Role>('PATIENT');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [uFocus,   setUFocus]   = useState(false);
  const [pFocus,   setPFocus]   = useState(false);
  const [mounted,  setMounted]  = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  useEffect(() => { 
    setTimeout(() => setMounted(true), 60); 
    
    // API Health Check
    api.get('/health')
      .then(() => setApiStatus('🟢 API Server is Online'))
      .catch(() => setApiStatus('🔴 API Server is Offline'));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password, role });
      const d = res.data.data;
      if (d?.token) {
        localStorage.setItem('token', d.token);
        const r = d.role ?? role;
        dispatch(loginSuccess({ user: { id: d.userId ?? 0, username: d.username ?? username, email: '', role: r, fullName: d.fullName ?? username }, token: d.token }));
        navigate(r === 'ADMIN' ? '/admin' : r === 'DOCTOR' ? '/doctor' : '/patient');
      }
    } catch (err: unknown) {
      dispatch(loginFailure(getApiErrorMessage(err, 'Invalid credentials. Please try again.')));
    }
  };

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── LEFT PANEL ─────────────────────────── */}
      <div style={{ ...S.left, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-24px)', transition: 'all .7s cubic-bezier(.16,1,.3,1)' }}>
        {/* Logo */}
        <div style={S.logoWrap}>
          <div style={S.logoBox}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 21.6S3 15 3 8.5a5.5 5.5 0 0 1 9.5-3.76A5.5 5.5 0 0 1 21 8.5C21 15 12 21.6 12 21.6z"/></svg>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={S.heading}>Hospital<br/>Management</h1>
          <p style={S.tagline}>Appointment &amp; Patient Record System</p>
          {apiStatus && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 20, fontSize: 13, color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {apiStatus}
            </div>
          )}
        </div>

        {/* Features */}
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

        {/* Dev credit */}
        <a
          href="https://www.linkedin.com/in/rahul-singh-kushwah-233b36283"
          target="_blank"
          rel="noreferrer"
          className="dev-credit"
          style={S.devCredit}
          aria-label="Open Rahul Singh Kushwah LinkedIn profile"
        >
          <img src="/rahul.jpg" alt="Rahul Singh Kushwah" style={S.devAvatar} />
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designed &amp; Developed by</p>
            <p style={{ fontSize: 14, color: '#2dd4bf', fontWeight: 800, margin: 0 }}>Rahul Singh Kushwah</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '1px 0 0' }}>Full Stack Developer &amp; UI/UX Designer</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginLeft: 'auto', opacity: 0.85, flexShrink: 0 }}>
            <path d="M7 10v7M7 7.2v.1M11 17v-4.1c0-1.6 1.1-2.9 2.7-2.9s2.3 1 2.3 2.8V17" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#fff" strokeWidth="1.8"/>
          </svg>
        </a>
      </div>

      {/* ── RIGHT PANEL (white card) ────────────── */}
      <div style={{ ...S.right, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(24px)', transition: 'all .7s cubic-bezier(.16,1,.3,1) .1s' }}>
        <div style={S.card}>
          <h2 style={S.cardTitle}>Welcome Back!</h2>
          <p style={S.cardSub}>Please login to continue</p>

          {/* Role Tabs */}
          <div style={S.tabs}>
            {ROLES.map(r => {
              const on = role === r.id;
              return (
                <button key={r.id} type="button" onClick={() => setRole(r.id)} className="role-tab" style={{ ...S.tab, background: on ? '#0dcfba' : 'transparent', border: `1.5px solid ${on ? '#0dcfba' : '#e2e8f0'}`, boxShadow: on ? '0 4px 16px rgba(13,207,186,0.4)' : 'none', transform: on ? 'translateY(-1px)' : 'none' }}>
                  { r.id === 'PATIENT' ? <PatientIcon active={on}/> : r.id === 'DOCTOR' ? <DoctorIcon active={on}/> : <AdminIcon active={on}/> }
                  <span style={{ fontSize: 12, fontWeight: 600, color: on ? '#fff' : '#94a3b8', marginTop: 3 }}>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Username */}
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setUFocus(true)}
                onBlur={() => setUFocus(false)}
                required
                autoComplete="username"
                style={{ ...S.input, borderColor: uFocus ? '#0dcfba' : '#e2e8f0', boxShadow: uFocus ? '0 0 0 3px rgba(13,207,186,0.15)' : 'none' }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPFocus(true)}
                onBlur={() => setPFocus(false)}
                required
                autoComplete="current-password"
                style={{ ...S.input, borderColor: pFocus ? '#0dcfba' : '#e2e8f0', boxShadow: pFocus ? '0 0 0 3px rgba(13,207,186,0.15)' : 'none', paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <EyeIcon off={showPwd}/>
              </button>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#64748b' }}>
                <div onClick={() => setRemember(v => !v)} style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${remember ? '#0dcfba' : '#cbd5e1'}`, background: remember ? '#0dcfba' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', cursor: 'pointer', flexShrink: 0 }}>
                  {remember && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                </div>
                Remember me
              </label>
              <a href="#" style={{ fontSize: 13, color: '#0dcfba', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</a>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Login button */}
            <button type="submit" disabled={loading} className="login-btn" style={{ height: 50, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0dcfba 0%, #0ea5e9 100%)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 24px rgba(13,207,186,0.45)', opacity: loading ? .7 : 1, transition: 'all .25s', marginTop: 2, letterSpacing: '0.3px' }}>
              {loading ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }}/> : 'Login'}
            </button>
          </form>

          {/* Sign up */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 18 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#0dcfba', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
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
  input::placeholder { color: #cbd5e1; font-size: 14px; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #fff inset !important; -webkit-text-fill-color: #1e293b !important; }
  .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(13,207,186,0.55) !important; }
  .role-tab { transition: all .25s cubic-bezier(.34,1.56,.64,1); outline: none; cursor: pointer; }
  .role-tab:hover { transform: translateY(-2px); }
  .dev-credit:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); transform: translateY(-1px); }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'stretch',
    fontFamily: "'Inter', system-ui, sans-serif",
    background: 'linear-gradient(135deg, #4dd9c0 0%, #38b2ea 30%, #c084fc 65%, #fb923c 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  left: {
    flex: '0 0 48%',
    padding: '52px 56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoWrap: { marginBottom: 8 },
  logoBox: {
    width: 52, height: 52, borderRadius: 16,
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  heading: {
    fontSize: 48, fontWeight: 900, color: '#fff',
    lineHeight: 1.1, letterSpacing: '-1.5px',
    textShadow: '0 2px 16px rgba(0,0,0,0.12)',
  },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 10 },
  featureCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', borderRadius: 14,
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  featureIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  featureTitle: { fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 2px' },
  featureDesc:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 },
  devCredit: {
    display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto',
    padding: '12px 14px', borderRadius: 14,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    textDecoration: 'none',
    transition: 'all .2s ease',
  },
  devAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    objectFit: 'cover',
    objectPosition: 'center',
    border: '2px solid rgba(255,255,255,0.58)',
    boxShadow: '0 4px 16px rgba(15,23,42,0.18)',
    flexShrink: 0,
  },
  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 48px',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: '#fff', borderRadius: 24,
    padding: '36px 32px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.5)',
  },
  cardTitle: { fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', textAlign: 'center', margin: '0 0 6px' },
  cardSub:   { fontSize: 14, color: '#94a3b8', textAlign: 'center', margin: '0 0 24px', fontWeight: 500 },
  tabs: { display: 'flex', gap: 10, marginBottom: 24 },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '12px 6px', borderRadius: 12,
  },
  input: {
    width: '100%', height: 50, border: '1.5px solid', borderRadius: 12,
    padding: '0 16px', fontSize: 14, fontWeight: 500, color: '#1e293b',
    background: '#f8fafc', outline: 'none', transition: 'border-color .2s, box-shadow .2s',
  },
};

export default Login;
