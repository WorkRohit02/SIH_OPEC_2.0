import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { classifyImage } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import { DisclaimerBanner, StatusPill, StepperLinear, STATUS, Loading, HashDisplay } from '../components/index.jsx';
import { TEST_STEPS } from './NewTest.jsx';

const REAGENTS = ['Marquis reagent', 'Scott reagent', 'Simon reagent', 'Duquenois-Levine reagent'];
export default function Result() {
  const nav = useNavigate(); const { draft, setDraft } = useStore();
  const [stage, setStage] = useState(1); const [a, setA] = useState(null);
  useEffect(() => {
    if (!draft.frame) return; let live = true;
    setStage(1); const t1 = setTimeout(() => setStage(2), 1100);
    classifyImage(draft.frame, draft.reagent).then((r) => { if (!live) return; setTimeout(() => { setA(r); setStage(3); }, 1400); });
    return () => { live = false; clearTimeout(t1); };
  }, [draft.frame, draft.reagent]);
  if (!draft.frame) return <Navigate to="/test/new" replace />;
  const low = a && (a.result === 'inconclusive' || a.confidence < 60);
  const retake = () => { setDraft((d) => ({ ...d, attempt: d.attempt + 1, frame: null })); nav('/test/capture'); };
  return (
    <div className="page">
      <div><h1>{stage < 3 ? (stage === 1 ? 'Calibrating colour' : 'Analysing result') : 'Review result'}</h1><p className="muted" style={{ marginTop: 8 }}>Capture Attempt {draft.attempt}. Only the sharpest frame is used.</p></div>
      <StepperLinear steps={TEST_STEPS} current={stage} />
      {draft.videoUrl && <section className="card stack"><h2 className="card-title">Recorded clip</h2>
        <video className="clip" src={draft.videoUrl} controls playsInline muted aria-label="Recorded test clip" />
        {draft.clipHash && <div className="kv" style={{ borderBottom: 0, padding: 0 }}><span className="muted">Clip SHA-256</span><HashDisplay hash={draft.clipHash} /></div>}</section>}
      {draft.frames && (() => { const b = draft.frames[draft.bestIndex]; return (
        <section className="card stack"><h2 className="card-title">Frame analysis</h2>
          <p className="muted" style={{ fontSize: 13 }}>{draft.frames.length} frames scanned. The sharpest frame with a visible colour change was selected and hashed.</p>
          <div className="strip" role="list" aria-label="Scanned frames">{draft.frames.map((f) => (
            <div key={f.i} role="listitem" className={`fr ${f.i === draft.bestIndex ? 'best' : ''}`}><img src={f.thumb} alt={`Frame at ${f.t.toFixed(1)} seconds`} />
              <span>{f.t.toFixed(1)}s</span><b>{Math.round(f.score * 100)}</b>{f.i === draft.bestIndex && <em>Selected</em>}</div>))}</div>
          <dl><div className="kv"><dt>Selected frame</dt><dd>{b.t.toFixed(1)} s of {draft.duration.toFixed(1)} s</dd></div>
            <div className="kv"><dt>Sharpness</dt><dd>{b.sharpness}</dd></div>
            <div className="kv"><dt>Colour change</dt><dd>ΔRGB {b.colorShift}</dd></div>
            <div className="kv"><dt>Frame SHA-256</dt><dd><HashDisplay hash={draft.frameHash} /></dd></div></dl></section>); })()}
      <div className="pair"><figure><img src={draft.frame} alt="Original captured frame" /><figcaption>Selected frame</figcaption></figure>
        <figure><img src={draft.frame} alt="Lighting-corrected frame" style={{ filter: 'brightness(1.08) contrast(1.1) saturate(1.05)' }} /><figcaption>Lighting-corrected</figcaption></figure></div>
      {stage < 3 || !a ? <Loading label={stage === 1 ? 'Reading reference card patches…' : 'Classifying reagent colour…'} /> : (<>
        <section className="card"><h2 className="card-title" style={{ marginBottom: 8 }}>Reference card patches</h2>
          <table className="patches"><thead><tr><th>Patch</th><th>Expected RGB</th><th>Measured RGB</th></tr></thead><tbody>
            {a.patches.map((p) => <tr key={p.name}><td style={{ fontFamily: 'var(--font)' }}><span className="sw" style={{ background: `rgb(${p.expected})` }} />{p.name}</td><td>{p.expected.join(', ')}</td><td>{p.measured.join(', ')}</td></tr>)}</tbody></table></section>
        <section className="card stack">
          <div className="result-badge"><b className={a.result}>{low ? 'Inconclusive — retest recommended' : STATUS[a.result]}</b></div>
          <div className="row"><StatusPill status={low ? 'inconclusive' : a.result} /><span className="muted" style={{ fontSize: 13 }}>Confidence <b style={{ color: 'var(--ink)' }}>{a.confidence}%</b></span></div>
          <div><label className="label" htmlFor="reagent">Reagent</label><select id="reagent" className="select" value={draft.reagent} onChange={(e) => setDraft((d) => ({ ...d, reagent: e.target.value }))}>{REAGENTS.map((r) => <option key={r}>{r}</option>)}</select></div>
        </section>
        <DisclaimerBanner />
        <div className="stack" style={{ gap: 8 }}>
          {!low && <button className="btn primary" onClick={() => { setDraft((d) => ({ ...d, analysis: a })); nav('/test/secure'); }}>CONTINUE TO SECURE RECORD</button>}
          <button className={low ? 'btn primary' : 'btn'} onClick={retake}><RefreshCw size={14} aria-hidden />RETAKE CAPTURE</button>
          {low && <button className="btn" onClick={() => { setDraft((d) => ({ ...d, analysis: a })); nav('/test/secure'); }}>Save as inconclusive</button>}
        </div></>)}
    </div>
  );
}
