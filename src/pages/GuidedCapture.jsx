import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ShieldCheck, CheckCircle2, XCircle, Circle, Video, Square, Lock, Upload, Film } from 'lucide-react';
import { extractBestFrame, analyseFrames, makeDemoFrames, computeHashBytes, dataUrlToBytes } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import '../styles/capture.css';

const CHECKS = [['ref', 'Reference card detected'], ['test', 'Test region detected'], ['blur', 'Blur'], ['light', 'Lighting'], ['quality', 'Image quality']];
const MIN_MS = 2000, MAX_MS = 6000;
const fmt = (ms) => `0:${String(Math.floor(ms / 1000)).padStart(2, '0')}`;

export default function GuidedCapture() {
  const nav = useNavigate(); const [sp] = useSearchParams();
  const { draft, setDraft, operator } = useStore();
  const video = useRef(null); const stream = useRef(null); const rec = useRef(null); const chunks = useRef([]);
  const live = useRef([]); const timers = useRef({});
  const [cam, setCam] = useState('pending'); // pending | live | fallback
  const [status, setStatus] = useState({}); const [phase, setPhase] = useState('idle'); const [ms, setMs] = useState(0);
  const [prog, setProg] = useState(null); const [err, setErr] = useState('');
  const failing = (sp.get('fail') || '').split(',');

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (dead) return s.getTracks().forEach((t) => t.stop());
        stream.current = s; if (video.current) video.current.srcObject = s; setCam('live');
      } catch { setCam('fallback'); }
    })();
    return () => { dead = true; clearInterval(timers.current.tick); clearInterval(timers.current.grab); stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // MOCK live checks: resolve one by one, unless forced to fail via ?fail=blur,lighting
  useEffect(() => {
    setStatus({});
    const t = CHECKS.map(([k], i) => setTimeout(() => setStatus((p) => ({ ...p, [k]: failing.includes(k) ? 'bad' : 'ok' })), 500 + i * 350));
    return () => t.forEach(clearTimeout);
  }, [draft.attempt]);
  const allPass = CHECKS.every(([k]) => status[k] === 'ok');

  const analyse = async (blob, source) => {
    setPhase('analysing'); setErr(''); setProg({ stage: 'reading', i: 0, n: 0 });
    try {
      const res = source === 'demo' ? await analyseFrames(makeDemoFrames(), setProg) : await extractBestFrame(blob, { liveFrames: live.current, onProgress: setProg });
      setProg({ stage: 'hashing' });
      const frameHash = await computeHashBytes(dataUrlToBytes(res.dataUrl)); // hash of the selected frame only
      const clipHash = blob ? await computeHashBytes(await blob.arrayBuffer()) : null;
      setDraft((d) => ({ ...d, frame: res.dataUrl, frameHash, clipHash, frames: res.frames, bestIndex: res.best, duration: res.duration, videoUrl: blob ? URL.createObjectURL(blob) : null, source }));
      nav('/test/result');
    } catch (e) { setPhase('idle'); setErr(e.message || 'Analysis failed. Retake the recording.'); }
  };

  const stopRec = () => {
    clearInterval(timers.current.tick); clearInterval(timers.current.grab);
    const r = rec.current;
    if (r && r.state !== 'inactive') { r.onstop = () => analyse(new Blob(chunks.current, { type: r.mimeType || 'video/webm' }), 'camera'); r.stop(); }
    else if (live.current.length) analyse(new Blob([]), 'camera');
    else { setPhase('idle'); setErr('Recording is not supported on this browser. Upload a video clip instead.'); }
  };
  const start = () => {
    if (!window.MediaRecorder || !stream.current) return setErr('Recording is not supported on this browser. Upload a video clip instead.');
    setErr(''); chunks.current = []; live.current = [];
    const mime = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((m) => MediaRecorder.isTypeSupported?.(m));
    try { rec.current = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined); } catch { return setErr('Recording could not start on this device.'); }
    rec.current.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.current.start(250); setPhase('recording'); setMs(0);
    const t0 = Date.now();
    timers.current.tick = setInterval(() => { const e = Date.now() - t0; setMs(e); if (e >= MAX_MS) stopRec(); }, 100);
    // backup frames, used only if the clip cannot be decoded
    timers.current.grab = setInterval(() => {
      const v = video.current; if (!v?.videoWidth || live.current.length >= 24) return;
      const c = document.createElement('canvas'); c.width = 640; c.height = Math.round((640 * v.videoHeight) / v.videoWidth);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); live.current.push({ t: (Date.now() - t0) / 1000, canvas: c });
    }, 300);
  };
  const onFile = (e) => { const f = e.target.files?.[0]; if (f) analyse(f, 'upload'); };
  const rowFor = (k) => { const s = status[k]; return s === 'ok' ? [CheckCircle2, 'ok', 'PASS'] : s === 'bad' ? [XCircle, 'bad', 'RETRY'] : [Circle, 'wait', '…']; };
  const recording = phase === 'recording';

  return (
    <div className="cap">
      <div className="cap-top">
        <button className="icon-btn" aria-label="Close capture" onClick={() => nav('/test/new')}><X size={20} /></button>
        <h1>Guided Capture</h1><span className="cap-dev"><ShieldCheck size={14} aria-hidden />Device-bound</span>
      </div>
      <span className="proto">PROTOTYPE DEMO</span>
      <div className="viewport">
        <video ref={video} autoPlay playsInline muted aria-label="Live camera preview" />
        <div className="region ref">REFERENCE COLOUR CARD<i /></div><div className="region test">TEST REGION<i /></div>
        {recording && <span className="rec-badge"><i />REC {fmt(ms)}</span>}
        {phase === 'analysing' && (
          <div className="ring" role="status"><span className="spinner" style={{ borderTopColor: '#22c583' }} />
            <span>{prog?.stage === 'hashing' ? 'Hashing selected frame…' : prog?.n ? `Scanning frame ${prog.i} of ${prog.n}…` : 'Selecting best frame…'}</span>
            <span style={{ fontSize: 11, color: '#9aa6a0' }}>Sharpness and colour change</span></div>)}
      </div>
      <p className="cap-caption">{cam === 'fallback' ? 'Camera unavailable. Upload a short video clip, or run the demo clip.' : 'Place the test kit and reference card completely inside the frame.'}</p>
      <div className="panel">
        {CHECKS.map(([k, label]) => { const [I, cls, txt] = rowFor(k); return <div key={k} className="check"><I size={16} className={cls} aria-hidden /><span className="label">{label}</span><span className={cls}>{txt}</span></div>; })}
        {recording && <div className="rec-track" aria-hidden><i style={{ width: `${(ms / MAX_MS) * 100}%` }} /></div>}
        {cam !== 'fallback' && (recording
          ? <button className="start stop" disabled={ms < MIN_MS} onClick={stopRec}><Square size={14} aria-hidden />{ms < MIN_MS ? 'HOLD STEADY…' : 'STOP RECORDING'}</button>
          : <button className="start" disabled={!allPass || phase !== 'idle' || cam !== 'live'} onClick={start}><Video size={16} aria-hidden />START RECORDING</button>)}
        {cam === 'fallback' && phase === 'idle' && (
          <div className="stack" style={{ gap: 8 }}>
            <label className="btn" style={{ cursor: 'pointer' }}><Upload size={16} aria-hidden />Upload video clip<input type="file" accept="video/*" onChange={onFile} hidden /></label>
            <button className="btn" onClick={() => analyse(null, 'demo')}><Film size={16} aria-hidden />Run demo clip</button>
          </div>)}
        {err && <p className="cap-caption" role="alert" style={{ color: '#ff9b9b' }}>{err}</p>}
        {!allPass && Object.keys(status).length === 5 && <p className="cap-caption" role="alert" style={{ color: '#ff9b9b' }}>A check needs attention. Adjust the frame, then record again.</p>}
        <p className="why">A short video clip is recorded to catch a stable, well-lit reading; only the sharpest frame becomes the signed evidence record.</p>
      </div>
      <div className="attempt"><div className="row"><b>Capture Attempt {draft.attempt}</b><span className="muted" style={{ fontSize: 12, letterSpacing: '0.08em' }}>{recording ? 'RECORDING' : 'READY'}</span></div><p>Every capture attempt is logged.</p></div>
      <dl className="ctx"><div><dt>GPS</dt><dd>Acquiring…</dd></div><div><dt>TIMESTAMP</dt><dd>Automatically generated</dd></div><div><dt>OFFICER ID</dt><dd>{operator.id}</dd></div></dl>
      <div className="cap-foot"><Lock size={12} aria-hidden />Evidence stored securely on device.</div>
    </div>
  );
}
