import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { STATUS, HashDisplay, CustodyList } from './index.jsx';
import { buildEvents } from '../mock/records.js';
import { verifyRecord } from '../mock/api.js';
import { makeDemoFrame } from '../mock/api.js';

let demoImg;
const placeholder = () => (demoImg ||= makeDemoFrame().dataUrl);

export default function RecordDetail({ record, actions }) {
  const [v, setV] = useState({ status: 'idle' });
  const verify = async () => { setV({ status: 'busy' }); setV({ status: 'done', res: await verifyRecord(record) }); };
  const color = { positive: 'var(--pos)', negative: 'var(--neg)', inconclusive: 'var(--inc)' }[record.result];
  const sigOk = !record.tampered;
  return (
    <>
      <div className="card stack" style={{ gap: 12 }}>
        <div className="banner alert" style={{ border: 0, padding: 0 }}><AlertTriangle size={16} aria-hidden />PRESUMPTIVE FIELD TEST — LABORATORY CONFIRMATION REQUIRED</div>
        <dl><div className="kv" style={{ borderTop: '1px solid var(--line)', borderBottom: 0 }}><dt>Record ID</dt><dd className="mono">{record.id}</dd></div></dl>
      </div>
      <figure className="evidence-img">
        <img src={record.image || placeholder()} alt="Captured evidence frame with reference colour card" />
        <figcaption>Captured Evidence — Demo Data</figcaption>
      </figure>
      <dl className="card" style={{ padding: '4px 16px' }}>
        <div className="kv"><dt>Result</dt><dd style={{ color, fontWeight: 600 }}>{STATUS[record.result].toUpperCase()}</dd></div>
        <div className="kv"><dt>Reference Card</dt><dd>Detected • Calibration {record.calibration}</dd></div>
        <div className="kv"><dt>Date &amp; Time</dt><dd>{record.date}, {record.time}</dd></div>
        <div className="kv"><dt>GPS Location</dt><dd>{record.gps}</dd></div>
        <div className="kv"><dt>SHA-256</dt><dd><HashDisplay hash={record.hash} /></dd></div>
        {record.frameInfo && <div className="kv"><dt>Selected frame</dt><dd>{record.frameInfo.t.toFixed(1)} s • {record.frameInfo.index} of {record.frameInfo.total}</dd></div>}
        {record.clipHash && <div className="kv"><dt>Source clip SHA-256</dt><dd><HashDisplay hash={record.clipHash} /></dd></div>}
        <div className="kv"><dt>Digital Signature</dt><dd style={{ color: sigOk ? 'var(--neg)' : 'var(--pos)', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          {sigOk ? <CheckCircle2 size={14} aria-hidden /> : <XCircle size={14} aria-hidden />}{sigOk ? 'VALID' : 'INVALID'}</dd></div>
      </dl>
      <p className="footnote" style={{ textAlign: 'left' }}>Presumptive field-test result. Laboratory confirmation is required.</p>
      <div>
        <h2 style={{ fontSize: 12, letterSpacing: '0.08em', fontWeight: 500, color: 'var(--muted)', margin: '8px 0 12px' }}>CHAIN-OF-CUSTODY EVENTS</h2>
        <div className="card"><CustodyList events={buildEvents(record)} /></div>
      </div>
      {v.status === 'done' && (
        <div className={`vpanel ${v.res.valid ? 'ok' : 'bad'}`} role="status">
          {v.res.valid ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <div><b>{v.res.valid ? 'Record verified — not altered' : 'Record altered — do not rely on this evidence'}</b>
            {v.res.reason}
            {!v.res.valid && <div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>Stored {v.res.storedHash.slice(0, 16)}…<br />Recomputed {v.res.recomputedHash.slice(0, 16)}…</div>}
          </div>
        </div>
      )}
      <div className="stack" style={{ gap: 8 }}>
        {actions?.primary || <button className="btn primary" onClick={verify} disabled={v.status === 'busy'}>{v.status === 'busy' ? 'VERIFYING…' : 'VERIFY RECORD'}</button>}
        {actions?.secondary}
        <button className="btn" onClick={() => alert('Prototype: a signed PDF report would be generated here.')}>VIEW PDF REPORT</button>
        <button className="btn" onClick={() => navigator.share?.({ title: record.id, text: `OPEC record ${record.id}` }).catch(() => {}) || alert('Prototype: share sheet would open here.')}>SHARE RECORD</button>
      </div>
      <p className="footnote">Device-bound capture • Evidence stored securely on device.</p>
    </>
  );
}
