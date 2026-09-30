import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStore } from '../mock/store.jsx';

export default function Login() {
  const { login } = useStore(); const nav = useNavigate();
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  const submit = (e) => { e.preventDefault(); if (!id.trim() || !pw) return setErr('Enter your operator ID or email and password.'); login(); nav('/'); };
  return (
    <div className="login">
      <aside className="login-hero">
        <img src="/logo-full.png" alt="OPEC — Digital Forensic Companion for Field Drug-Testing Kits" />
        <p>Guided capture, signed records and a full chain of custody for presumptive field tests.</p>
      </aside>
      <main className="login-panel">
        <div className="login-logo"><img src="/logo-mark.png" alt="OPEC" /></div>
        <div className="login-logo" style={{ marginTop: -8 }}><span style={{ letterSpacing: '0.4em', fontWeight: 600, color: 'var(--navy)' }}>OPEC</span></div>
        <p className="sub" style={{ marginTop: -4, fontSize: 13 }}>Digital Forensic Companion for Field Drug-Testing Kits<br /><span style={{ letterSpacing: '0.1em', fontSize: 12 }}>Secure • Guided • Traceable</span></p>
        <h1>Welcome Back</h1><p className="sub">Sign in to continue field testing.</p>
        <form className="card stack" onSubmit={submit} noValidate style={{ gap: 16 }}>
          <div><label className="label" htmlFor="id">Operator ID / Email</label><input id="id" className="input" placeholder="Enter your operator ID or email" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" /></div>
          <div><label className="label" htmlFor="pw">Password</label>
            <div className="input-wrap"><input id="pw" className="input" type={show ? 'text' : 'password'} placeholder="Enter your password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
              <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            {err && <p className="form-error" role="alert">{err}</p>}</div>
          <button className="btn primary" type="submit">LOGIN</button>
          <button type="button" className="link" style={{ textAlign: 'center' }} onClick={() => alert('Prototype: password reset flow.')}>Forgot Password?</button>
        </form>
        <div className="badge-soft"><ShieldCheck size={18} color="var(--teal)" aria-hidden />Authorized operator access</div>
        <p className="footnote">Don't have an operator account? <button className="link" onClick={() => alert('Prototype: operator registration.')}>Register</button></p>
        <p className="footnote" style={{ fontSize: 11 }}>Device-bound capture • Evidence stored securely on device.</p>
      </main>
    </div>
  );
}
