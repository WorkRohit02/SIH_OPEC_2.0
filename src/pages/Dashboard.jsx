import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, Camera, Link2, Clock, CloudOff, FolderOpen, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../mock/store.jsx';
import { DisclaimerBanner, RecordCard, StepperCircular } from '../components/index.jsx';

const features = [[Camera, 'Secure Capture', 'Frame kit and reference card.'], [Link2, 'Chain of Custody', 'Bind context at capture.'], [Clock, 'Real-time Documentation', 'Timestamp each event.'], [CloudOff, 'Offline Sync', 'Securely synchronize later.']];
export default function Dashboard() {
  const { records, pending } = useStore(); const p = String(pending).padStart(2, '0');
  const stats = [['Tests Today', '24'], ['Verified Records', '22'], ['Pending Sync', p], ['Audit Alerts', '00']];
  return (
    <>
      <div className="device-strip"><div><strong>DEVICE-BOUND CAPTURE</strong>Evidence stored securely on device</div><div><strong>Pending synchronization</strong>{p}</div></div>
      <div className="page" style={{ paddingTop: 16 }}>
        <section className="card hero stack">
          <span className="eyebrow">Operational Overview</span><h1>Field Evidence Dashboard</h1>
          <p className="muted">Capture, verify and securely document presumptive field-test results.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="chip">Device secure</span><span className="chip">Location</span><span className="chip">{p} awaiting sync</span></div>
          <Link to="/test/new" className="btn primary"><Plus size={16} aria-hidden />Start New Field Test</Link>
          <Link to="/verify" className="btn"><CheckCircle2 size={16} aria-hidden />Verify Evidence</Link>
        </section>
        <div className="feature-grid">{features.map(([I, t, d]) => <div key={t} className="card feature"><I size={16} aria-hidden /><h3>{t}</h3><span className="muted" style={{ fontSize: 12 }}>{d}</span></div>)}</div>
        <DisclaimerBanner text="Field-test classification is presumptive and does not replace laboratory confirmation." />
        <div className="stat-grid">{stats.map(([l, n]) => <div key={l} className="card stat"><span className="muted" style={{ fontSize: 12 }}>{l}</span><b>{n}</b></div>)}</div>
        <section className="card"><div className="row"><div><span className="eyebrow">Field Mission Journey</span><h2>Capture to Verification</h2></div><SlidersHorizontal size={16} color="var(--muted)" aria-hidden /></div>
          <StepperCircular steps={['Capture', 'Calibrate', 'Classify', 'Review', 'Secure Record']} current={0} /></section>
        <div className="section-title"><span>Recent Evidence Records</span><FolderOpen size={16} color="var(--muted)" aria-hidden /></div>
        {records.slice(0, 3).map((r) => <RecordCard key={r.id} record={r} />)}
      </div>
    </>
  );
}
