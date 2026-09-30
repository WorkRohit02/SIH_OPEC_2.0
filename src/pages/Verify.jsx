import { useState } from 'react';
import { useStore } from '../mock/store.jsx';
import { PageTitle } from '../components/index.jsx';
import RecordDetail from '../components/RecordDetail.jsx';

export default function Verify() {
  const { records } = useStore(); const [id, setId] = useState(''); const [shown, setShown] = useState(null);
  const rec = records.find((r) => r.id.toLowerCase() === shown?.toLowerCase());
  return (
    <div className="page"><PageTitle title="Verify Evidence" backTo="/" />
      <p className="muted">Enter a record ID to check whether the record has been altered. Try OPEC-2026-01463 to see a failed check.</p>
      <div className="search"><input className="input" aria-label="Record ID" placeholder="OPEC-2026-01482" value={id} onChange={(e) => setId(e.target.value)} /><button className="btn sm" style={{ minHeight: 44 }} onClick={() => setShown(id.trim())}>Find</button></div>
      {shown && !rec && <div className="banner error" role="alert">No record “{shown}” on this device.</div>}
      {rec && <RecordDetail key={rec.id} record={rec} />}
    </div>
  );
}
