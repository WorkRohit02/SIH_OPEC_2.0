// ---- MOCK BACKEND / CLASSIFIER / SIGNING -------------------------------
// Everything here is simulated. Swap each function for a real service later.
import { RECORDS, buildEvents } from './records.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const bytesToHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

// Real SHA-256 over any string (Web Crypto). The hash of the real evidence is genuine; the record store is not.
export async function computeHash(input) {
  const data = new TextEncoder().encode(input);
  if (globalThis.crypto?.subtle) return bytesToHex(await crypto.subtle.digest('SHA-256', data));
  let h = 0; for (const c of input) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h).toString(16).toUpperCase().padStart(64, '0').slice(0, 64);
}

// MOCK signing: a real build would sign with a device-bound private key (Secure Enclave / Android Keystore).
export async function signRecord(record) {
  await wait(400);
  return 'SIG-' + (await computeHash(record.hash + record.id + record.officer)).slice(0, 24);
}

// MOCK verification: flags records marked tampered.
export async function verifyRecord(record) {
  await wait(900);
  if (record.tampered) {
    const recomputed = record.hash.slice(0, 40) + 'F00D' + record.hash.slice(44);
    return { valid: false, hashMatches: false, signatureValid: false, storedHash: record.hash, recomputedHash: recomputed, reason: 'Stored hash does not match the current record contents.' };
  }
  return { valid: true, hashMatches: true, signatureValid: true, storedHash: record.hash, recomputedHash: record.hash, reason: 'Hash and digital signature both match.' };
}

// MOCK classifier: seeded from the frame so results are stable per capture.
const PATCHES = [
  { name: 'White', expected: [245, 245, 245] }, { name: 'Neutral grey', expected: [128, 128, 128] },
  { name: 'Red', expected: [200, 40, 40] }, { name: 'Purple', expected: [110, 60, 140] },
];
export async function classifyImage(frame, reagent = 'Marquis reagent', forced) {
  await wait(700);
  let seed = 0; const s = frame || 'x';
  for (let i = 0; i < s.length; i += 97) seed = (seed * 31 + s.charCodeAt(i)) % 1000;
  const roll = forced ?? (seed % 10);
  const result = roll < 4 ? 'positive' : roll < 7 ? 'negative' : 'inconclusive';
  const confidence = result === 'inconclusive' ? 48 + (seed % 14) : 86 + (seed % 12);
  const jitter = (v, k) => Math.max(0, Math.min(255, v + ((seed + k * 13) % 15) - 7));
  const patches = PATCHES.map((p, i) => ({ ...p, measured: p.expected.map((v, k) => jitter(v, i + k)) }));
  return { result, confidence, patches, reagent, calibration: 'PASS' };
}

// ---- VIDEO -> BEST FRAME ------------------------------------------------
// Real pipeline (runs in the browser): decode the recorded clip, score every sampled frame for
// sharpness (Laplacian variance), visible colour change in the test region (vs. the first frames of the
// clip) and exposure, then keep the single best frame. Only that frame is hashed and signed.
export async function computeHashBytes(bytes) {
  if (globalThis.crypto?.subtle) return bytesToHex(await crypto.subtle.digest('SHA-256', bytes));
  return computeHash(String(bytes.byteLength));
}
export function dataUrlToBytes(url) {
  const b = atob(url.split(',')[1]); const u = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
  return u;
}
const REGION = { x0: 0.2, x1: 0.8, y0: 0.45, y1: 0.75 }; // test region, as fractions of the frame
const tick = () => new Promise((r) => setTimeout(r, 0));

function metrics(canvas) {
  const w = 160, h = Math.max(1, Math.round((160 * canvas.height) / canvas.width));
  const t = document.createElement('canvas'); t.width = w; t.height = h;
  const c = t.getContext('2d', { willReadFrequently: true }); c.drawImage(canvas, 0, 0, w, h);
  const d = c.getImageData(0, 0, w, h).data; const g = new Float32Array(w * h); let luma = 0;
  for (let i = 0; i < w * h; i++) { g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; luma += g[i]; }
  luma /= w * h;
  let sum = 0, sum2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const k = y * w + x; const l = 4 * g[k] - g[k - 1] - g[k + 1] - g[k - w] - g[k + w]; sum += l; sum2 += l * l; n++;
  }
  const sharpness = sum2 / n - (sum / n) ** 2;
  let r = 0, gg = 0, b = 0, m = 0;
  for (let y = Math.floor(REGION.y0 * h); y < REGION.y1 * h; y++) for (let x = Math.floor(REGION.x0 * w); x < REGION.x1 * w; x++) {
    const k = (y * w + x) * 4; r += d[k]; gg += d[k + 1]; b += d[k + 2]; m++;
  }
  return { sharpness, luma, rgb: [r / m, gg / m, b / m] };
}

// raw: [{ t: seconds, canvas }]  ->  { dataUrl, best, frames[], duration, width, height }
export async function analyseFrames(raw, onProgress) {
  const scored = [];
  for (let i = 0; i < raw.length; i++) {
    scored.push({ ...raw[i], m: metrics(raw[i].canvas) });
    onProgress?.({ stage: 'scoring', i: i + 1, n: raw.length }); await tick();
  }
  const head = scored.slice(0, Math.min(3, scored.length));
  const base = [0, 1, 2].map((k) => head.reduce((a, f) => a + f.m.rgb[k], 0) / head.length);
  scored.forEach((f) => { f.shift = Math.hypot(...f.m.rgb.map((v, k) => v - base[k])); });
  const maxS = Math.max(...scored.map((f) => f.m.sharpness), 1e-6);
  const maxC = Math.max(...scored.map((f) => f.shift), 1e-6);
  const frames = scored.map((f, i) => {
    const exposure = f.m.luma > 45 && f.m.luma < 215 ? 1 : 0.6;
    const score = (0.6 * (f.m.sharpness / maxS) + 0.4 * (f.shift / maxC)) * exposure;
    const th = document.createElement('canvas'); th.width = 96; th.height = Math.round((96 * f.canvas.height) / f.canvas.width);
    th.getContext('2d').drawImage(f.canvas, 0, 0, th.width, th.height);
    return { i, t: f.t, thumb: th.toDataURL('image/jpeg', 0.6), sharpness: Math.round(f.m.sharpness), colorShift: Math.round(f.shift * 10) / 10, luma: Math.round(f.m.luma), score };
  });
  const best = frames.reduce((a, f) => (f.score > frames[a].score ? f.i : a), 0);
  const c = scored[best].canvas;
  return { dataUrl: c.toDataURL('image/jpeg', 0.92), best, frames, duration: scored[scored.length - 1].t, width: c.width, height: c.height };
}

// Decode frames out of a recorded clip by seeking through it.
async function decodeFrames(blob, onProgress) {
  const url = URL.createObjectURL(blob);
  try {
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('Clip could not be read')); });
    if (!isFinite(v.duration)) { // MediaRecorder WebM often reports Infinity
      v.currentTime = 1e6; await new Promise((r) => (v.ontimeupdate = () => { v.ontimeupdate = null; r(); }));
      v.currentTime = 0; await new Promise((r) => setTimeout(r, 50));
    }
    const dur = v.duration > 0 && isFinite(v.duration) ? v.duration : 3;
    const n = Math.min(30, Math.max(6, Math.floor(dur * 5)));
    const W = 640, H = Math.round((W * (v.videoHeight || 480)) / (v.videoWidth || 640));
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = (dur * (i + 0.5)) / n;
      await new Promise((r) => { const to = setTimeout(r, 2000); v.onseeked = () => { clearTimeout(to); r(); }; v.currentTime = t; });
      const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(v, 0, 0, W, H);
      out.push({ t, canvas: c }); onProgress?.({ stage: 'reading', i: i + 1, n }); await tick();
    }
    return out;
  } finally { URL.revokeObjectURL(url); }
}

export async function extractBestFrame(videoBlob, { liveFrames = [], onProgress } = {}) {
  let raw = null;
  try { raw = await decodeFrames(videoBlob, onProgress); } catch { raw = null; }
  if (!raw || raw.length < 3) raw = liveFrames;
  if (!raw.length) throw new Error('No frames could be read from the clip. Retake the recording.');
  return analyseFrames(raw, onProgress);
}

// Synthetic clip for machines without a camera: frames vary in blur and colour change so the analyser has something to choose from.
export function makeDemoFrames(n = 14) {
  const blurs = [9, 7, 6, 4, 3, 2, 3, 6, 8, 2, 1, 0, 1, 3];
  return Array.from({ length: n }, (_, i) => {
    const p = i / (n - 1); const mix = (a, b) => Math.round(a + (b - a) * p);
    const c = document.createElement('canvas'); c.width = 640; c.height = 480; const x = c.getContext('2d');
    x.fillStyle = '#d8d3c8'; x.fillRect(0, 0, 640, 480);
    try { x.filter = `blur(${blurs[i % blurs.length]}px)`; } catch {}
    [['#f5f5f5', 90], ['#808080', 190], ['#c82828', 290], ['#6e3c8c', 390]].forEach(([col, px]) => { x.fillStyle = col; x.fillRect(px, 50, 80, 80); });
    x.fillStyle = '#efe9dc'; x.fillRect(150, 190, 340, 200);
    x.fillStyle = `rgb(${mix(230, 110)},${mix(215, 60)},${mix(170, 140)})`; x.beginPath(); x.arc(320, 290, 62, 0, 7); x.fill();
    x.filter = 'none'; x.fillStyle = '#5d6974'; x.font = '14px sans-serif'; x.fillText('Demo clip — prototype', 20, 460);
    return { t: (i * 2.8) / (n - 1), canvas: c };
  });
}

// ---- Mock data services with simulated latency / failure ----
export async function fetchRecords(state = 'ok') {
  await wait(state === 'loading' ? 60000 : 600);
  if (state === 'error') throw new Error('Records unavailable');
  return state === 'empty' ? [] : RECORDS;
}
export async function fetchAudit(record, state = 'ok') {
  await wait(state === 'loading' ? 60000 : 700);
  if (state === 'error') throw new Error('Audit trail unavailable');
  return state === 'empty' ? [] : buildEvents(record);
}
export async function fetchHelp(state = 'ok') {
  await wait(state === 'loading' ? 60000 : 400);
  if (state === 'error') throw new Error('Help content unavailable');
  return true;
}

// Placeholder still used only for the seeded demo records (they have no stored image).
export function makeDemoFrame(tint = '#7b3f98') {
  const c = document.createElement('canvas'); c.width = 640; c.height = 480;
  const x = c.getContext('2d');
  x.fillStyle = '#d8d3c8'; x.fillRect(0, 0, 640, 480);
  [['#f5f5f5', 90], ['#808080', 190], ['#c82828', 290], ['#6e3c8c', 390]].forEach(([col, px]) => { x.fillStyle = col; x.fillRect(px, 50, 80, 80); });
  x.fillStyle = '#efe9dc'; x.fillRect(150, 190, 340, 200);
  x.fillStyle = tint; x.beginPath(); x.arc(320, 290, 62, 0, 7); x.fill();
  x.fillStyle = '#5d6974'; x.font = '14px sans-serif'; x.fillText('Demo data', 20, 460);
  return { dataUrl: c.toDataURL('image/jpeg', 0.9), sharpness: 412 };
}
