// Mock evidence records. Replace with API data later.
const hex = (seed) => {
  let s = seed, out = '';
  while (out.length < 64) { s = (s * 1103515245 + 12345) & 0x7fffffff; out += s.toString(16).padStart(8, '0'); }
  return out.slice(0, 64).toUpperCase();
};
const LOC = {
  s17: { label: 'Sector 17, Chandigarh', gps: '30.7415° N, 76.7681° E' },
  s22: { label: 'Sector 22, Chandigarh', gps: '30.7333° N, 76.7794° E' },
  s35: { label: 'Sector 35, Chandigarh', gps: '30.7222° N, 76.7591° E' },
  mohali: { label: 'Phase 7, Mohali', gps: '30.7046° N, 76.7179° E' },
  panch: { label: 'Sector 5, Panchkula', gps: '30.6942° N, 76.8606° E' },
  zirak: { label: 'Zirakpur Bypass', gps: '30.6425° N, 76.8173° E' },
  ind: { label: 'Industrial Area Phase 1', gps: '30.7120° N, 76.8010° E' },
  none: { label: 'Device-provided location', gps: 'unavailable' },
  unav: { label: 'Location unavailable', gps: 'unavailable' },
};
const mk = (n, result, date, time, loc, op, extra = {}) => ({
  id: `OPEC-2026-${String(n).padStart(5, '0')}`,
  test: 'Colorimetric Field Test',
  result, date, time, location: LOC[loc].label, gps: LOC[loc].gps,
  officer: op, reagent: extra.reagent || 'Marquis reagent',
  confidence: extra.confidence ?? (result === 'inconclusive' ? 54 : 93),
  calibration: extra.calibration || 'PASS',
  hash: hex(n * 7919), signature: 'SIG-' + hex(n * 104729).slice(0, 24),
  tampered: !!extra.tampered, attempts: extra.attempts || 2, image: extra.image || null,
});
export const RECORDS = [
  mk(1482, 'positive', '28 Sep 2026', '14:32', 's17', 'OP-4587'),
  mk(1479, 'negative', '28 Sep 2026', '12:18', 'none', 'OP-4587'),
  mk(1476, 'inconclusive', '27 Sep 2026', '16:05', 'unav', 'OP-4587', { attempts: 3 }),
  mk(1471, 'positive', '27 Sep 2026', '10:41', 's22', 'OP-3120', { reagent: 'Scott reagent' }),
  mk(1468, 'negative', '26 Sep 2026', '19:07', 'mohali', 'OP-2204'),
  mk(1463, 'positive', '26 Sep 2026', '08:52', 'panch', 'OP-4587', { tampered: true }),
  mk(1459, 'negative', '25 Sep 2026', '15:26', 's35', 'OP-3120'),
  mk(1455, 'inconclusive', '25 Sep 2026', '11:03', 'zirak', 'OP-2204', { attempts: 3 }),
  mk(1450, 'positive', '24 Sep 2026', '21:14', 'ind', 'OP-4587', { reagent: 'Simon reagent' }),
  mk(1447, 'negative', '24 Sep 2026', '09:37', 'unav', 'OP-3120'),
  mk(1441, 'positive', '23 Sep 2026', '17:48', 's17', 'OP-2204'),
  mk(1436, 'negative', '22 Sep 2026', '13:20', 's22', 'OP-4587'),
];
export const integrityOf = (r) => (r.tampered ? 'tampered' : r.result === 'inconclusive' ? 'retest' : 'verified');

export const buildEvents = (r) => {
  const [h, m] = r.time.split(':').map(Number);
  const base = h * 3600 + m * 60;
  const f = (s) => { const t = base + s; return [Math.floor(t / 3600) % 24, Math.floor(t / 60) % 60, t % 60].map((x) => String(x).padStart(2, '0')).join(':'); };
  if (r.frameInfo) {
    const fi = r.frameInfo;
    return [[0, 'Test initiated'], [3, 'Video recording started'], [8, 'Video clip saved'], [10, `${fi.total} frames scanned`], [12, `Best frame selected (${fi.t.toFixed(1)} s)`], [13, 'Reference card detected'], [14, 'Colour calibration completed'], [16, `Result classified: ${r.result}`], [18, 'SHA-256 hash generated (selected frame)'], [22, 'Record digitally signed'], [26, 'QR verification generated']].map(([s, label]) => ({ time: f(s), label }));
  }
  const ev = [
    [0, 'Test initiated'], [4, 'Capture attempt 1 saved'], [9, 'Reference card detected'],
    [10, 'Colour calibration completed'], [14, `Result classified: ${r.result}`],
    [18, 'SHA-256 hash generated'], [22, 'Record digitally signed'], [26, 'QR verification generated'],
  ];
  if (r.attempts > 1) ev.splice(2, 0, [6, 'Retake requested'], [8, `Capture attempt ${r.attempts} saved`]);
  return ev.map(([s, label]) => ({ time: f(s), label }));
};
export const buildAttempts = (r) =>
  Array.from({ length: r.attempts }, (_, i) => {
    const last = i === r.attempts - 1;
    return { n: i + 1, tag: last ? 'SAVED' : 'RETAKE', note: last ? 'Device-bound evidence captured.' : 'Retake remains part of the audit record.' };
  });
