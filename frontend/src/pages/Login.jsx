import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { useStore } from '../mock/store.jsx';

export default function Login() {
  const { login, register } = useStore();
  const nav = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('DRDO Field Lab');
  const [role, setRole] = useState('OFFICER');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (isRegisterMode) {
      if (!name.trim()) return setErr('Please enter your full name.');
      if (!email.trim() || !password) return setErr('Please enter an email address and password.');
      if (password.length < 6) return setErr('Password must be at least 6 characters.');

      setLoading(true);
      try {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          organization: organization.trim() || 'DRDO Field Lab',
          role,
        });
        nav('/');
      } catch (error) {
        setErr(error.message || 'Registration failed. Please check backend status.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password) return setErr('Enter your operator email and password.');
      setLoading(true);
      try {
        await login(email.trim(), password);
        nav('/');
      } catch (error) {
        setErr(error.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login">
      <aside className="login-hero">
        <img src="/logo-full.png" alt="OPEC — Digital Forensic Companion for Field Drug-Testing Kits" />
        <p>Guided capture, signed records and a full chain of custody for presumptive field tests.</p>
      </aside>

      <main className="login-panel">
        <div className="login-logo"><img src="/logo-mark.png" alt="OPEC" /></div>
        <div className="login-logo" style={{ marginTop: -8 }}>
          <span style={{ letterSpacing: '0.4em', fontWeight: 600, color: 'var(--navy)' }}>OPEC</span>
        </div>
        <p className="sub" style={{ marginTop: -4, fontSize: 13 }}>
          Digital Forensic Companion for Field Drug-Testing Kits<br />
          <span style={{ letterSpacing: '0.1em', fontSize: 12 }}>Secure • Guided • Traceable</span>
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: !isRegisterMode ? 'var(--navy)' : 'transparent',
              color: !isRegisterMode ? '#fff' : 'var(--muted)',
              border: !isRegisterMode ? 'none' : '1px solid var(--line)',
            }}
            onClick={() => { setIsRegisterMode(false); setErr(''); }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: isRegisterMode ? 'var(--navy)' : 'transparent',
              color: isRegisterMode ? '#fff' : 'var(--muted)',
              border: isRegisterMode ? 'none' : '1px solid var(--line)',
            }}
            onClick={() => { setIsRegisterMode(true); setErr(''); }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <h1>{isRegisterMode ? 'Operator Registration' : 'Welcome Back'}</h1>
        <p className="sub">{isRegisterMode ? 'Create a new authorized operator account.' : 'Sign in to continue field testing.'}</p>

        <form className="card stack" onSubmit={submit} noValidate style={{ gap: 14 }}>
          {isRegisterMode && (
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="input"
                placeholder="e.g. Officer Rohit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="id">Operator Email / Username</label>
            <input
              id="id"
              className="input"
              type="email"
              placeholder="e.g. rohit@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="label" htmlFor="org">Organization / Laboratory</label>
                <input
                  id="org"
                  className="input"
                  placeholder="e.g. DRDO Field Testing Unit"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="role">Role</label>
                <select id="role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="OFFICER">FIELD OFFICER</option>
                  <option value="ADMIN">LAB ADMIN</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="label" htmlFor="pw">Password</label>
            <div className="input-wrap">
              <input
                id="pw"
                className="input"
                type={show ? 'text' : 'password'}
                placeholder={isRegisterMode ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {err && <p className="form-error" role="alert">{err}</p>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : (isRegisterMode ? 'REGISTER ACCOUNT' : 'LOGIN')}
          </button>

          {!isRegisterMode && (
            <button type="button" className="link" style={{ textAlign: 'center' }} onClick={() => alert('Password reset link sent to admin.')}>
              Forgot Password?
            </button>
          )}
        </form>

        <div className="badge-soft"><ShieldCheck size={18} color="var(--teal)" aria-hidden />Authorized operator access</div>
        
        <p className="footnote">
          {isRegisterMode ? 'Already registered? ' : "Don't have an operator account? "}
          <button className="link" type="button" onClick={() => { setIsRegisterMode(!isRegisterMode); setErr(''); }}>
            {isRegisterMode ? 'Sign In' : 'Register'}
          </button>
        </p>
        <p className="footnote" style={{ fontSize: 11 }}>Device-bound capture • Evidence stored securely on device.</p>
      </main>
    </div>
  );
}
