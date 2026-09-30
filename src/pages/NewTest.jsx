import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useStore } from '../mock/store.jsx';
import { DisclaimerBanner, StepperLinear } from '../components/index.jsx';
export const TEST_STEPS = ['Capture', 'Calibrate', 'Analyze', 'Review', 'Secure Record'];

export default function NewTest() {
  const nav = useNavigate(); const { resetDraft, operator } = useStore();
  return (
    <div className="page">
      <div><h1>New Presumptive Field Test</h1><p className="muted" style={{ marginTop: 8 }}>Capture and document a device-bound field result.</p></div>
      <StepperLinear steps={TEST_STEPS} current={0} />
      <section className="card stack"><h2 className="card-title">Capture</h2>
        <p className="muted">Position the completed test kit and reference colour card inside the camera frame.</p>
        <div className="phone-mock"><div className="phone"><div className="box ref">REFERENCE COLOUR<br />CARD</div><div className="box test">TEST REGION</div><span className="bar" /></div>
          <span className="muted" style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}><Camera size={14} aria-hidden />Camera frame guide</span></div></section>
      <section className="card"><h2 className="card-title">Capture Context</h2><dl>
        <div className="kv"><dt>GPS</dt><dd>Acquiring…</dd></div><div className="kv"><dt>Timestamp</dt><dd>Automatically generated</dd></div><div className="kv"><dt>Officer ID</dt><dd>{operator.id}</dd></div></dl></section>
      <DisclaimerBanner text="Field-test classification is presumptive and does not replace laboratory confirmation." />
      <div className="stack" style={{ gap: 8 }}><button className="btn primary" onClick={() => { resetDraft(); nav('/test/capture'); }}>CONTINUE TO CAMERA</button>
        <p className="footnote">Camera permission required for field testing.</p></div>
    </div>
  );
}
