import { useMemo, useState } from 'react';
import { FolderOpen, Search, SlidersHorizontal } from 'lucide-react';
import { fetchRecords } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import { LibraryRecordCard, EmptyState, ErrorState, Loading, useAsync, useDemoState, DemoStateSwitch } from '../components/index.jsx';

const FILTERS = [['all', 'All results'], ['positive', 'Presumptive Positive'], ['negative', 'Presumptive Negative'], ['inconclusive', 'Inconclusive']];
export default function Library() {
  const { records: local, pending } = useStore();
  const [demo, setDemo] = useDemoState();
  const [q, setQ] = useState(''); const [f, setF] = useState('all');
  const [s, retry] = useAsync(() => fetchRecords(demo), [demo]);
  const list = useMemo(() => {
    const src = demo === 'ok' ? local : s.data || [];
    return src.filter((r) => (f === 'all' || r.result === f) && `${r.id} ${r.officer} ${r.location}`.toLowerCase().includes(q.toLowerCase()));
  }, [s.data, local, demo, q, f]);
  return (
    <div className="page">
      <div><div className="subhead"><FolderOpen size={20} aria-hidden /><h1 style={{ fontSize: 20 }}>Secure Evidence Library</h1></div>
        <p className="muted" style={{ marginTop: 8 }}>Search and review field-test documentation and record integrity information.</p></div>
      <div className="search"><div className="field"><Search size={16} aria-hidden /><input className="input" aria-label="Search records" placeholder="Record ID, officer or location" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button className="icon-btn" style={{ border: '1px solid var(--line-strong)', background: 'var(--surface)', width: 44, height: 44 }} aria-label="Filters"><SlidersHorizontal size={16} /></button></div>
      <div className="chips" role="group" aria-label="Filter by result">{FILTERS.map(([k, l]) => <button key={k} className="chip filter" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}</div>
      {s.status === 'loading' && demo !== 'ok' ? <Loading label="Loading evidence records…" />
        : s.status === 'error' ? <ErrorState title="Evidence records unavailable" onRetry={() => { setDemo('ok'); retry(); }} />
        : list.length === 0 ? <EmptyState title="No evidence records match your filters." body="Clear the search or choose All results." action={<button className="btn sm" onClick={() => { setQ(''); setF('all'); if (demo !== 'ok') setDemo('ok'); }}>Clear filters</button>} />
        : list.map((r) => <LibraryRecordCard key={r.id} record={r} />)}
      <div className="card footnote" style={{ background: 'var(--bg)' }}>Device-bound capture • Pending synchronization: {String(pending).padStart(2, '0')}.</div>
      <DemoStateSwitch state={demo} setState={setDemo} />
    </div>
  );
}
