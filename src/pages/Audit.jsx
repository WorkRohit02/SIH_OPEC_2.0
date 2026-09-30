import { Lock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { fetchAudit } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import { buildAttempts } from '../mock/records.js';
import { CustodyList, EmptyState, ErrorState, Loading, useAsync, useDemoState, DemoStateSwitch } from '../components/index.jsx';

export default function Audit() {
  const { records } = useStore(); const [sp] = useSearchParams(); const [demo, setDemo] = useDemoState();
  const rec = records.find((r) => r.id === sp.get('record')) || records[0];
  const [s, retry] = useAsync(() => fetchAudit(rec, demo), [demo, rec.id]);
  return (
    <div className="page">
      <div><h1>Audit Trail</h1><p className="muted" style={{ marginTop: 8 }}>All documented capture and record events remain visible.</p></div>
      <section className="card"><div className="row"><h2 className="card-title">Record context</h2><Lock size={14} color="var(--muted)" aria-hidden /></div><dl>
        <div className="kv"><dt>Record ID</dt><dd className="mono">{rec.id}</dd></div><div className="kv"><dt>Test</dt><dd>{rec.test}</dd></div><div className="kv"><dt>Officer ID</dt><dd>{rec.officer}</dd></div><div className="kv"><dt>Capture</dt><dd>Device-bound capture</dd></div></dl></section>
      <div className="row"><h2>Documented events</h2><span className="muted" style={{ fontSize: 11, letterSpacing: '0.06em' }}>CHAIN-OF-CUSTODY</span></div>
      {s.status === 'loading' ? <Loading label="Loading audit events…" />
        : s.status === 'error' ? <ErrorState title="Audit trail unavailable" onRetry={() => { setDemo('ok'); retry(); }} />
        : s.data.length === 0 ? <EmptyState title="No documented events" body="Events appear here as soon as a capture starts." />
        : <div className="card"><CustodyList events={s.data} /></div>}
      <h2>Capture History</h2>
      {buildAttempts(rec).map((a) => (
        <div className="card row" key={a.n}><div><h3>Capture Attempt {a.n}</h3><span className="muted" style={{ fontSize: 12 }}>{a.note}</span></div>
          <span className="chip" style={{ fontWeight: 600, fontSize: 11 }}>{a.tag}</span></div>))}
      <p className="footnote" style={{ textAlign: 'left' }}>Every capture attempt is logged.</p>
      <DemoStateSwitch state={demo} setState={setDemo} />
    </div>
  );
}
