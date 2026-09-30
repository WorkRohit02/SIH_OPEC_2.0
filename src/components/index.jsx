import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Bell, Check, CheckCircle2, ChevronRight, ChevronDown, Copy, FolderOpen, LayoutGrid, MoreHorizontal, PlusSquare, RefreshCw, ShieldAlert, ArrowUpRight, Calendar, MapPin, User, Inbox, ArrowLeft } from 'lucide-react';
import { integrityOf } from '../mock/records.js';

export const STATUS = { positive: 'Presumptive Positive', negative: 'Presumptive Negative', inconclusive: 'Inconclusive' };
export const DISCLAIMER = 'Presumptive field-test result. Laboratory confirmation is required.';

export function StatusPill({ status }) {
  const Icon = status === 'positive' ? AlertTriangle : status === 'negative' ? Check : RefreshCw;
  return <span className={`pill ${status}`}><Icon size={11} aria-hidden />{STATUS[status].toUpperCase()}</span>;
}

export function IntegrityRow({ record }) {
  const k = integrityOf(record);
  const map = { verified: ['VERIFIED', CheckCircle2], retest: ['RETEST', RefreshCw], tampered: ['TAMPERED', ShieldAlert] };
  const [txt, Icon] = map[k];
  return <span className={`integrity ${k}`}><Icon size={14} aria-hidden />{txt}</span>;
}

export function DisclaimerBanner({ text = DISCLAIMER }) {
  return <div className="banner warn" role="note"><AlertTriangle size={16} aria-hidden /><span>{text}</span></div>;
}

export function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand" aria-label="OPEC home"><img src="/logo-mark.png" alt="" /><span>OPEC</span></Link>
      <button className="icon-btn" aria-label="Notifications"><Bell size={18} /></button>
    </header>
  );
}

export function PageTitle({ title, onBack, backTo }) {
  const nav = useNavigate();
  return (
    <div className="subhead">
      <button className="icon-btn" aria-label="Back" onClick={() => (onBack ? onBack() : nav(backTo || -1))}><ArrowLeft size={18} /></button>
      <h1>{title}</h1>
    </div>
  );
}

export function BottomNav() {
  const items = [['/', 'Dashboard', LayoutGrid, true], ['/test/new', 'New Test', PlusSquare], ['/evidence', 'Evidence', FolderOpen], ['/profile', 'More', MoreHorizontal]];
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(([to, label, Icon, end]) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}><Icon size={18} aria-hidden />{label}</NavLink>
      ))}
    </nav>
  );
}

export function RecordCard({ record }) {
  return (
    <article className="card record">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div><div className="id">{record.id}</div><div className="muted" style={{ fontSize: 13 }}>{record.test}</div></div>
        <StatusPill status={record.result} />
      </div>
      <dl className="meta">
        <div><dt>Date / Time</dt><dd>{record.date}, {record.time}</dd></div>
        <div><dt>Location</dt><dd>{record.location}</dd></div>
        <div><dt>Officer</dt><dd>{record.officer}</dd></div>
        <div><dt>Integrity</dt><dd><IntegrityRow record={record} /></dd></div>
      </dl>
      <Link className="btn" to={`/evidence/${record.id}`}>Open record <ArrowUpRight size={14} aria-hidden /></Link>
    </article>
  );
}

export function LibraryRecordCard({ record }) {
  return (
    <article className="card record">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div><div className="id">{record.id}</div><div className="muted" style={{ fontSize: 13 }}>{record.test}</div></div>
        <StatusPill status={record.result} />
      </div>
      <div className="record-line"><Calendar size={14} aria-hidden />{record.date}, {record.time}</div>
      <div className="record-line"><MapPin size={14} aria-hidden />{record.location}</div>
      <div className="record-line"><User size={14} aria-hidden />{record.officer}</div>
      <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <span className={`pill ${integrityOf(record)}`}>{integrityOf(record) === 'retest' ? 'RETEST' : integrityOf(record).toUpperCase()}</span>
        <Link to={`/evidence/${record.id}`} className="link" style={{ color: 'inherit' }}>Open record <ChevronRight size={14} style={{ verticalAlign: -2 }} aria-hidden /></Link>
      </div>
    </article>
  );
}

export function HashDisplay({ hash }) {
  const [copied, setCopied] = useState(false);
  const short = `${hash.slice(0, 4)}…${hash.slice(-4)}`;
  const copy = async () => { try { await navigator.clipboard.writeText(hash); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <span className="hash" title={hash}>{short}
      <button onClick={copy} aria-label={copied ? 'Hash copied' : 'Copy full SHA-256 hash'}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
    </span>
  );
}

export function StepperCircular({ steps, current }) {
  return (
    <div className="stepper-c" role="list">
      {steps.map((s, i) => (
        <span key={s} className={`node ${i === current ? 'on' : ''}`} role="listitem" aria-current={i === current ? 'step' : undefined}>
          <span className={`dot ${i === current ? 'on' : i < current ? 'done' : ''}`}>{i + 1}</span>{s}
          {i < steps.length - 1 && <ChevronRight className="sep" size={14} aria-hidden />}
        </span>
      ))}
    </div>
  );
}

export function StepperLinear({ steps, current }) {
  return (
    <ol className="stepper-l" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s, i) => (
        <li key={s} className={`s ${i === current ? 'on' : ''} ${i < current ? 'done' : ''}`} aria-current={i === current ? 'step' : undefined}>
          <span className={`dot ${i === current ? 'on' : i < current ? 'done' : ''}`}>{i < current ? <Check size={13} /> : String(i + 1).padStart(2, '0')}</span>{s}
        </li>
      ))}
    </ol>
  );
}

export function ChainOfCustodyTimeline({ events, timeFirst = false }) {
  return (
    <ol className={`timeline ${timeFirst ? '' : ''}`}>
      {events.map((e, i) => (
        <li key={i}><span className="pt" />{timeFirst ? <><span className="t">{e.time}</span></> : <span>{e.label}</span>}{timeFirst ? null : <span className="t">{e.time}</span>}</li>
      ))}
    </ol>
  );
}
export function CustodyList({ events }) {
  return (
    <ol className="timeline stack-time">
      {events.map((e, i) => (<li key={i}><span className="pt" /><span><span className="t" style={{ display: 'block' }}>{e.time}</span>{e.label}</span></li>))}
    </ol>
  );
}

export function EmptyState({ title, body, action }) {
  return <div className="empty"><Inbox size={22} aria-hidden /><h3>{title}</h3>{body && <p style={{ fontSize: 13 }}>{body}</p>}{action}</div>;
}
export function ErrorState({ title, onRetry, inline }) {
  if (inline) return <div className="banner error" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} role="alert"><span>{title} — <button className="link" style={{ color: 'inherit', textDecoration: 'underline' }} onClick={onRetry}>Retry</button></span><RefreshCw size={14} aria-hidden /></div>;
  return (
    <div className="banner error" role="alert"><div className="row" style={{ gap: 8, justifyContent: 'flex-start' }}><AlertTriangle size={16} aria-hidden /><b>{title}</b></div>
      <button className="btn sm" onClick={onRetry}>Retry</button></div>
  );
}
export const Loading = ({ label }) => <div className="loading" role="status"><span className="spinner" aria-hidden />{label}</div>;

// Lets reviewers exercise loading / empty / error states: ?demo=loading|empty|error
export function useDemoState() {
  const [sp, setSp] = useSearchParams();
  const state = sp.get('demo') || 'ok';
  return [state, (s) => { const n = new URLSearchParams(sp); s === 'ok' ? n.delete('demo') : n.set('demo', s); setSp(n, { replace: true }); }];
}
export function DemoStateSwitch({ state, setState, options = ['ok', 'loading', 'empty', 'error'] }) {
  return (
    <div className="demo-switch" role="group" aria-label="Prototype demo state">Prototype state
      {options.map((o) => <button key={o} aria-pressed={state === o} onClick={() => setState(o)}>{o}</button>)}
    </div>
  );
}

export function Accordion({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="card acc">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>{title}<ChevronDown size={18} aria-hidden /></button>
      {open && <div className="body">{children}</div>}
    </div>
  );
}
export function useAsync(fn, deps) {
  const [s, setS] = useState({ status: 'loading', data: null });
  const [n, setN] = useState(0);
  useEffect(() => { let live = true; setS({ status: 'loading', data: null }); fn().then((d) => live && setS({ status: 'ok', data: d })).catch(() => live && setS({ status: 'error', data: null })); return () => { live = false; }; }, [...deps, n]);
  return [s, () => setN((x) => x + 1)];
}
