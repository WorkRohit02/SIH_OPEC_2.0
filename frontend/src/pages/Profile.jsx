import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, ShieldCheck, CheckCircle2, ListChecks, HelpCircle, Settings, KeyRound, FileText, Bell, Smartphone, ChevronRight, CloudOff, RefreshCw, LogOut } from 'lucide-react';
import { useStore } from '../mock/store.jsx';

export default function Profile() {
  const { operator, pending, logout } = useStore(); const nav = useNavigate(); const p = String(pending).padStart(2, '0');
  const [sync, setSync] = useState(0); const [busy, setBusy] = useState(false);
  const retry = () => { setBusy(true); setSync(0); let n = 0; const iv = setInterval(() => { n += 25; setSync(n); if (n >= 50) { clearInterval(iv); setBusy(false); } }, 400); };
  const utils = [[CheckCircle2, 'Verification', '/verify'], [ListChecks, 'Audit Trail', '/audit'], [HelpCircle, 'Help', '/help'], [Settings, 'Settings'], [KeyRound, 'Change Password'], [FileText, 'Authorized Usage Guidelines'], [Bell, 'Notifications'], [Smartphone, 'Device Information']];
  return (
    <div className="page">
      <div><h1>Operator Profile</h1><p className="muted" style={{ marginTop: 8 }}>Authorized field operator account.</p></div>
      <section className="card stack">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><div className="avatar" aria-hidden>DO</div><div><h2>{operator.name}</h2><span className="muted" style={{ fontSize: 13 }}>Operator ID {operator.id}</span></div></div>
        <dl><div className="kv"><dt><Building2 size={14} style={{ verticalAlign: -2 }} aria-hidden /> Organization</dt><dd>{operator.org}</dd></div>
          <div className="kv"><dt><Mail size={14} style={{ verticalAlign: -2 }} aria-hidden /> Email</dt><dd>{operator.email}</dd></div>
          <div className="kv"><dt><Phone size={14} style={{ verticalAlign: -2 }} aria-hidden /> Phone</dt><dd>{operator.phone}</dd></div></dl></section>
      <section className="card"><div style={{ display: 'flex', gap: 12 }}><ShieldCheck color="var(--teal)" aria-hidden /><div><h2>Device Secure</h2><span className="muted" style={{ fontSize: 13 }}>Device-bound capture</span></div></div>
        <dl style={{ marginTop: 8 }}><div className="kv"><dt>Evidence stored securely on device</dt><dd /></div><div className="kv"><dt>Pending synchronization: {p}</dt><dd>{p}</dd></div></dl></section>
      <div><h2 style={{ margin: '8px 0 8px' }}>Utilities</h2><div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {utils.map(([I, l, to]) => <button key={l} className="util" onClick={() => (to ? nav(to) : alert(`Prototype: ${l}`))}><span><I size={16} aria-hidden />{l}</span><ChevronRight size={16} aria-hidden /></button>)}</div></div>
      <div className="card" style={{ padding: '4px 16px' }}><dl><div className="kv"><dt>App Version</dt><dd>2.0.0 Prototype</dd></div><div className="kv"><dt>Theme</dt><dd>Light</dd></div></dl></div>
      <section className="card stack"><div style={{ display: 'flex', gap: 12 }}><CloudOff size={18} color="var(--muted)" aria-hidden /><div><span className="eyebrow">Offline mode</span><h2>Capture evidence locally</h2></div></div>
        <div className="row muted" style={{ fontSize: 13 }}><span>Pending synchronization: {p}</span><RefreshCw size={14} className={busy ? 'spinner-icon' : ''} aria-hidden /></div>
        <div className="progress" role="progressbar" aria-valuenow={sync} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${sync}%` }} /></div>
        <button className="btn" onClick={retry} disabled={busy}><RefreshCw size={14} aria-hidden />{busy ? 'Syncing…' : 'Retry sync'}</button></section>
      <div className="stack" style={{ gap: 8 }}><button className="btn danger" onClick={() => { logout(); nav('/login'); }}><LogOut size={14} aria-hidden />LOGOUT</button>
        <p className="footnote">Session remains securely stored until logout confirmation.</p></div>
    </div>
  );
}
