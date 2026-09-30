import { Camera, MapPin, WifiOff } from 'lucide-react';
import { fetchHelp } from '../mock/api.js';
import { useStore } from '../mock/store.jsx';
import { Accordion, DisclaimerBanner, ErrorState, Loading, useAsync, useDemoState, DemoStateSwitch } from '../components/index.jsx';

const TOPICS = [
  ['Capture', 'Place both the completed kit and the reference colour card completely inside the frame. Avoid shadows and glare where possible. Keep the phone steady and follow the validated manufacturer procedure. A short clip is recorded and only the sharpest frame is kept.', true],
  ['Calibration', 'The printed reference card lets OPEC correct for lighting. If measured patch colours drift too far from expected values, the result is marked Inconclusive and a retest is recommended.'],
  ['Offline Mode', 'Records are created and signed on the device without a network. They remain device-bound until synchronization completes.'],
  ['Verification', 'Verify Record recomputes the SHA-256 hash and checks the digital signature. Any change to the record makes verification fail.'],
  ['Laboratory Confirmation', 'Every OPEC result is presumptive. Laboratory confirmation is required before any evidentiary or legal reliance.'],
];
export default function Help() {
  const { pending } = useStore(); const [demo, setDemo] = useDemoState(); const [s, retry] = useAsync(() => fetchHelp(demo), [demo]);
  return (
    <div className="page">
      <div><h1>Field Guidance &amp; Help</h1><p className="muted" style={{ marginTop: 8 }}>Operational guidance for secure presumptive field testing.</p></div>
      <DisclaimerBanner text="Field-test classification is presumptive and does not replace laboratory confirmation." />
      {s.status === 'loading' ? <Loading label="Loading guidance…" /> : s.status === 'error' ? <ErrorState inline title="Help content unavailable" onRetry={() => { setDemo('ok'); retry(); }} /> : (<>
        {TOPICS.map(([t, b, open]) => <Accordion key={t} title={t} defaultOpen={open}>{b}</Accordion>)}
        <section className="card" style={{ background: 'var(--bg)' }}><h2 className="card-title" style={{ marginBottom: 8 }}>Support</h2>
          <div className="support-row"><Camera size={16} aria-hidden /><span>Camera permission denied? Enable camera access in system settings, or upload a photo or clip instead.</span></div>
          <div className="support-row"><MapPin size={16} aria-hidden /><span>Location unavailable? The record will show Location unavailable.</span></div>
          <div className="support-row"><WifiOff size={16} aria-hidden /><span>Network unavailable? Evidence remains stored securely on device with Pending synchronization: {String(pending).padStart(2, '0')}.</span></div></section></>)}
      <DemoStateSwitch state={demo} setState={setDemo} options={['ok', 'loading', 'error']} />
    </div>
  );
}
