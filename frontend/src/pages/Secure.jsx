import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { computeHash, signRecord } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import api from '../services/api.js';
import { StepperLinear, Loading } from '../components/index.jsx';
import RecordDetail from '../components/RecordDetail.jsx';
import { TEST_STEPS } from './NewTest.jsx';

export default function Secure() {
  const nav = useNavigate(); const { draft, records, addRecord, operator } = useStore(); const [rec, setRec] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!draft.analysis) return; let live = true;
    (async () => {
      const now = new Date(); const pad = (n) => String(n).padStart(2, '0');
      const base = { id: `OPEC-2026-${String(1483 + records.length - 12).padStart(5, '0')}`, test: 'Colorimetric Field Test', result: draft.analysis.result, date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, location: 'Device-provided location', gps: 'unavailable', officer: operator.id, reagent: draft.reagent, confidence: draft.analysis.confidence, calibration: 'PASS', attempts: draft.attempt, tampered: false, image: draft.frame };
      const hash = draft.frameHash || await computeHash(draft.frame); // SHA-256 of the selected frame's bytes
      const b = draft.frames?.[draft.bestIndex];
      const r = { ...base, hash, clipHash: draft.clipHash, frameInfo: b ? { t: b.t, of: draft.duration, index: b.i + 1, total: draft.frames.length, sharpness: b.sharpness, colorShift: b.colorShift } : null }; r.signature = await signRecord(r);
      if (live) setRec(r);
    })();
    return () => { live = false; };
  }, []);

  const handleSave = async () => {
    if (!rec) return;
    setSaving(true);
    try {
      // Send to Express backend API
      const testRes = await api.createTest('CP-01').catch(() => null);
      if (testRes?.data?.test?._id) {
        const testId = testRes.data.test._id;
        const capRes = await api.uploadCapture(testId, draft.frame, { notes: 'Guided capture frame' }).catch(() => null);
        if (capRes?.data?.capture?._id) {
          await api.analyseCapture(capRes.data.capture._id, testId).catch(() => null);
        }
      }
    } catch (err) {
      console.warn('Backend record saving warning:', err);
    } finally {
      addRecord(rec);
      setSaving(false);
      nav(`/evidence/${rec.id}`, { replace: true });
    }
  };

  if (!draft.analysis) return <Navigate to="/test/new" replace />;
  return (
    <div className="page"><div><h1>Secure Record</h1><p className="muted" style={{ marginTop: 8 }}>Generated fresh from this capture. Review, then save to the device log.</p></div>
      <StepperLinear steps={TEST_STEPS} current={4} />
      {!rec ? <Loading label="Hashing and signing record…" /> :
        <RecordDetail record={rec} actions={{ primary: <button className="btn primary" disabled={saving} onClick={handleSave}>{saving ? 'SAVING TO BACKEND...' : 'SAVE TO LOG'}</button> }} />}
    </div>
  );
}
