<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Clip Cutter</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>
/* Layout concept: an editing bench. One column: source, settings, a film-strip timeline of the cut points, then one card per clip with timecodes. */
:root {
  --bg: #eceff2;
  --surface: #ffffff;
  --fg: #10151c;
  --muted: #5b6672;
  --line: #d3d9df;
  --accent: #d9480f;
  --accent-fg: #ffffff;
  --ok: #1b7f4b;
  --track: #dfe4e9;
  --err: #b42318;
  --display: "Space Grotesk", system-ui, sans-serif;
  --body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0e1217; --surface: #161c23; --fg: #e8ecf0; --muted: #8b96a3;
    --line: #27313b; --accent: #ff7a3d; --accent-fg: #1a0d05; --ok: #4cc38a;
    --track: #202a33; --err: #ff8a80; color-scheme: dark;
  }
}
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--fg); font: 15px/1.55 var(--body); padding: 32px max(16px, env(safe-area-inset-left, 0px)) 64px; }
.wrap { max-width: 920px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
h1 { font: 700 34px/1.1 var(--display); letter-spacing: -0.02em; margin: 0; text-wrap: balance; }
.sub { color: var(--muted); margin: 8px 0 0; max-width: 60ch; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.label { font: 500 11px/1 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.drop { border: 1.5px dashed var(--line); border-radius: 8px; padding: 28px 16px; text-align: center; cursor: pointer; transition: border-color .15s, background .15s; }
.drop:hover, .drop.over { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent); }
.drop b { display: block; font: 600 16px var(--display); }
.drop span { color: var(--muted); font-size: 13px; }
.drop input { display: none; }
.opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
.opt { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
select { font: inherit; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 9px 10px; width: 100%; }
.check { display: flex; align-items: center; gap: 8px; font-size: 14px; }
button { font: 600 14px var(--body); border-radius: 6px; border: 1px solid transparent; padding: 10px 16px; cursor: pointer; }
button.primary { background: var(--accent); color: var(--accent-fg); }
button.ghost { background: transparent; color: var(--fg); border-color: var(--line); }
button:disabled { opacity: .45; cursor: not-allowed; }
button:focus-visible, select:focus-visible, .drop:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.note { font-size: 13px; color: var(--muted); }
.bar { height: 6px; border-radius: 3px; background: var(--track); overflow: hidden; }
.bar > i { display: block; height: 100%; width: 0; background: var(--accent); transition: width .2s; }
.stage { font: 500 13px var(--mono); }
.err { color: var(--err); font-size: 14px; white-space: pre-wrap; }
video { width: 100%; max-height: 420px; background: #000; border-radius: 8px; }
.timeline { position: relative; height: 34px; background: var(--track); border-radius: 6px; margin-top: 4px; }
.timeline .mk { position: absolute; top: 3px; bottom: 3px; min-width: 14px; background: var(--accent); color: var(--accent-fg); border-radius: 3px; font: 500 11px/1 var(--mono); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 0; padding: 0; }
.ticks { display: flex; justify-content: space-between; font: 400 11px var(--mono); color: var(--muted); margin-top: 6px; }
.clips { display: flex; flex-direction: column; gap: 12px; }
.clip { display: grid; grid-template-columns: 40px 1fr; gap: 14px; border: 1px solid var(--line); border-radius: 8px; padding: 14px; min-width: 0; }
.clip .n { font: 700 22px var(--display); color: var(--accent); }
.clip h3 { margin: 0 0 2px; font: 600 16px var(--display); text-wrap: balance; }
.clip .tc { font: 400 12px var(--mono); color: var(--muted); }
.clip p { margin: 8px 0 0; font-size: 14px; color: var(--muted); overflow-wrap: anywhere; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 12px; }
.row a { color: var(--ok); font-weight: 600; }
.stat { font: 400 12px var(--mono); color: var(--muted); }
canvas#stage { max-width: 100%; max-height: 220px; border-radius: 6px; background: #000; display: none; }
.ad { border: 1px dashed var(--line); border-radius: 8px; padding: 12px 14px; font-size: 13px; color: var(--muted); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ad b { font: 500 10px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid var(--line); border-radius: 3px; padding: 2px 5px; }
.ad a { color: var(--accent); font-weight: 600; overflow-wrap: anywhere; }
footer { font-size: 12px; color: var(--muted); }
[hidden] { display: none !important; }
@media (max-width: 520px) { .clip { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Clip Cutter</h1>
    <p class="sub">Add an English video. It finds the key moments and cuts 30 or 60 second clips with captions at the bottom. Everything runs in this browser, so the video is never uploaded.</p>
  </header>

  <!-- AD SLOT (top). Easiest: fill PROMO.top in the script below.
       To use an ad network instead, paste its code inside this div. -->
  <aside class="ad" id="adTop" hidden></aside>
  <div id="adNetworkTop"></div>

  <section class="panel" aria-label="Source and settings">
    <div class="label">1 · Video</div>
    <label class="drop" id="drop" tabindex="0">
      <input type="file" id="file" accept="video/*">
      <b id="fname">Choose a video file</b>
      <span id="fmeta">or drop it here. English speech works best.</span>
    </label>
    <div class="label">2 · Settings</div>
    <div class="opts">
      <div class="opt"><label class="label" for="len">Clip length</label>
        <select id="len"><option value="30">About 30 seconds</option><option value="60" selected>About 1 minute</option></select></div>
      <div class="opt"><label class="label" for="count">Number of clips</label>
        <select id="count"><option>3</option><option selected>5</option><option>8</option><option>10</option><option>15</option></select></div>
      <div class="opt"><label class="label" for="fmt">Shape</label>
        <select id="fmt"><option value="orig">Same as video</option><option value="vertical">Vertical 9:16 (centre crop)</option></select></div>
      <div class="opt"><label class="label" for="model">Speech model</label>
        <select id="model"><option value="Xenova/whisper-tiny.en">Fast (tiny)</option><option value="Xenova/whisper-base.en">Better (base, slower)</option></select></div>
    </div>
    <label class="check"><input type="checkbox" id="caps" checked> Burn captions into the clips</label>
    <label class="check"><input type="checkbox" id="gpu"> Try the graphics card for speech (faster, may not work on every computer)</label>
    <div class="row" style="margin-top:0">
      <button class="primary" id="go" disabled>Find the key moments</button>
      <span class="note">Use Chrome or Edge on a computer. The first run downloads the speech model once and needs internet.</span>
    </div>
  </section>

  <section class="panel" id="prog" hidden aria-live="polite">
    <div class="stage" id="stageTxt">Starting…</div>
    <div class="bar"><i id="barFill"></i></div>
    <div class="stat" id="elapsed"></div>
  </section>
  <section class="panel" id="errBox" hidden><div class="err" id="errTxt"></div></section>

  <section class="panel" id="results" hidden>
    <div class="label">3 · Key moments</div>
    <video id="player" controls playsinline></video>
    <div>
      <div class="timeline" id="timeline"></div>
      <div class="ticks"><span>0:00</span><span id="endTick"></span></div>
    </div>
    <div class="row" style="margin-top:0">
      <button class="primary" id="makeAll">Make all clips</button>
      <span class="note">Clips are recorded at normal speed, so a 1 minute clip takes about 1 minute. Keep this tab open and visible.</span>
    </div>
    <canvas id="stage"></canvas>
    <div class="clips" id="clips"></div>
  </section>

  <!-- AD SLOT (bottom). Fill PROMO.bottom in the script, or paste ad network code in the div. -->
  <aside class="ad" id="adBottom" hidden></aside>
  <div id="adNetworkBottom"></div>

  <footer>Built with Transformers.js and OpenAI Whisper. Your video stays on your device.</footer>
</div>

<script type="module">
const $ = (id) => document.getElementById(id);
const state = { file: null, url: null, duration: 0, segs: [], clips: [], busy: false };

/* ---------- YOUR PROMO / AD SETTINGS: edit these two lines ---------- */
const PROMO = {
  top:    { text: '', url: '' },   // e.g. { text: 'Try my other app', url: 'https://example.com' }
  bottom: { text: '', url: '' }
};
for (const [k, id] of [['top', 'adTop'], ['bottom', 'adBottom']]) {
  const p = PROMO[k], el = $(id);
  if (p.text && p.url) {
    const tag = document.createElement('b'); tag.textContent = 'Ad';
    const a = document.createElement('a'); a.href = p.url; a.target = '_blank'; a.rel = 'sponsored noopener'; a.textContent = p.text;
    el.append(tag, a); el.hidden = false;
  }
}

/* ---------- helpers ---------- */
const fmt = (t) => {
  t = Math.max(0, Math.round(t));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
};
const showErr = (e) => {
  console.error(e);
  $('errTxt').textContent = 'Something went wrong:\n' + (e && e.message ? e.message : e);
  $('errBox').hidden = false;
};
let t0 = 0, tick = null;
const startTimer = () => { t0 = Date.now(); clearInterval(tick); tick = setInterval(() => { $('elapsed').textContent = 'Elapsed ' + fmt((Date.now() - t0) / 1000); }, 1000); };
const stopTimer = () => clearInterval(tick);
const setStage = (txt, pct) => { $('stageTxt').textContent = txt; if (pct != null) $('barFill').style.width = Math.min(100, pct) + '%'; };

/* ---------- file selection ---------- */
function chooseFile(f) {
  if (!f) return;
  if (state.url) URL.revokeObjectURL(state.url);
  if (rv) { rv.pause(); rv.removeAttribute('src'); rv = null; if (actx) actx.close(); actx = null; adest = null; }
  state.file = f; state.url = URL.createObjectURL(f);
  $('fname').textContent = f.name;
  $('fmeta').textContent = (f.size / 1048576).toFixed(0) + ' MB · click to change';
  const v = $('player'); v.src = state.url;
  v.onloadedmetadata = () => { state.duration = v.duration; $('fmeta').textContent += ' · ' + fmt(v.duration); };
  $('go').disabled = false;
  $('results').hidden = true; $('errBox').hidden = true;
}
$('file').addEventListener('change', (e) => chooseFile(e.target.files[0]));
const drop = $('drop');
['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => chooseFile(e.dataTransfer.files[0]));
drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });

/* ---------- audio extraction (16 kHz mono) ---------- */
async function extractAudio(file) {
  let buf;
  try { buf = await file.arrayBuffer(); }
  catch (e) { throw new Error('This file is too large for the browser to read at once. Try a smaller or compressed version of the video.'); }
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  let audio;
  try { audio = await ctx.decodeAudioData(buf); }
  catch (e) { throw new Error('The browser could not read the sound of this video. Try an MP4 (H.264) file, or a smaller one.'); }
  const ch = audio.numberOfChannels, out = new Float32Array(audio.length);
  for (let c = 0; c < ch; c++) { const d = audio.getChannelData(c); for (let i = 0; i < d.length; i++) out[i] += d[i] / ch; }
  ctx.close();
  return out;
}

/* ---------- speech to text ---------- */
async function transcribe(audio, modelId, useGpu) {
  setStage('Loading speech model…', 2);
  // Prefer files hosted next to this page (./vendor and ./models, made by get-offline-files.py).
  // If they are missing, fall back to jsDelivr and Hugging Face.
  const isHttp = location.protocol.startsWith('http');
  let tf, local = false;
  if (isHttp) { try { tf = await import('./vendor/transformers.min.js'); local = true; } catch (e) { /* no local copy */ } }
  if (!tf) tf = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1');
  const { pipeline, env } = tf;
  env.allowLocalModels = isHttp;
  env.allowRemoteModels = true;
  env.localModelPath = new URL('./models/', location.href).href;
  try { env.backends.onnx.wasm.proxy = true; } catch (e) { /* keeps the page responsive while listening */ }
  if (local) env.backends.onnx.wasm.wasmPaths = new URL('./vendor/', location.href).href;
  const files = {};
  const progress_callback = (p) => {
    if (p.status === 'progress' && p.file) {
      files[p.file] = { loaded: p.loaded, total: p.total };
      let l = 0, t = 0; for (const k in files) { l += files[k].loaded; t += files[k].total; }
      if (t) setStage('Downloading speech model (first time only) ' + Math.round(l / t * 100) + '%', 2 + (l / t) * 8);
    }
  };
  let asr;
  if (useGpu && navigator.gpu) {
    try { asr = await pipeline('automatic-speech-recognition', modelId, { device: 'webgpu', dtype: 'fp32', progress_callback }); }
    catch (e) { console.warn('GPU failed, using CPU', e); }
  }
  if (!asr) asr = await pipeline('automatic-speech-recognition', modelId, { progress_callback });

  const SLICE = 16000 * 240, segs = [];
  const total = audio.length;
  for (let s = 0; s < total; s += SLICE) {
    const piece = audio.subarray(s, Math.min(s + SLICE, total));
    const off = s / 16000;
    setStage('Listening to the video… ' + fmt(off) + ' of ' + fmt(total / 16000), 10 + (s / total) * 80);
    const res = await asr(piece, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: true });
    for (const c of (res.chunks || [])) {
      const text = (c.text || '').trim();
      if (text.length < 2 || /^[\[(].*[\])]$/.test(text)) continue;
      const a = c.timestamp[0] ?? 0, b = c.timestamp[1] ?? (a + 3);
      segs.push({ start: off + a, end: off + Math.max(b, a + 0.5), text });
    }
  }
  return segs;
}

/* ---------- picking the key moments ---------- */
const STOP = new Set(('the and for are but not you all any can had her was one our out has have this that with from they will would there their what about which when your said them than then into some could other these also been were just like very more over such only even most make made much those because while where does did how its his she him who why get got going gonna want really thing things yeah okay well kind lot know think see say way use used using been being both each few many may might must should too own same here our out off yes').split(/\s+/));
const CUES = /\b(most important|key (point|thing|idea)|the secret|the reason|here'?s (why|how|the)|mistake|remember|number (one|1|two|2|three|3)|biggest|the truth|let me (tell|show|explain)|for example|to sum up|in summary|the problem|the solution|lesson|how to|never|always)\b/gi;
const toks = (s) => (s.toLowerCase().match(/[a-z']+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));
const endsSentence = (s) => /[.!?]["')\]]?$/.test(s.trim());

function pickClips(segs, L, N) {
  if (!segs.length) return [];
  // idf over 30 second buckets
  const df = new Map(), buckets = new Map();
  for (const s of segs) {
    const b = Math.floor(s.start / 30);
    if (!buckets.has(b)) buckets.set(b, new Set());
    toks(s.text).forEach((w) => buckets.get(b).add(w));
  }
  buckets.forEach((set) => set.forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const nb = buckets.size;
  const idf = (w) => Math.log(nb / (1 + (df.get(w) || 0))) + 1;

  const cands = [];
  for (let i = 0; i < segs.length; i++) {
    if (i > 0 && !endsSentence(segs[i - 1].text)) continue;
    const st = segs[i].start;
    let j = i;
    while (j < segs.length - 1 && segs[j].end - st < L - 5) j++;
    while (j < segs.length - 1 && !endsSentence(segs[j].text) && segs[j].end - st < L + 15) j++;
    const dur = segs[j].end - st;
    if (dur < L * 0.6) continue;
    const tf = new Map(); let text = '';
    for (let k = i; k <= j; k++) { text += segs[k].text + ' '; toks(segs[k].text).forEach((w) => tf.set(w, (tf.get(w) || 0) + 1)); }
    let sc = 0; const ranked = [];
    tf.forEach((c, w) => { const v = Math.sqrt(c) * idf(w); sc += v; ranked.push([w, v]); });
    sc /= Math.sqrt(dur);
    const cues = (text.match(CUES) || []).length;
    sc += Math.min(cues, 4) * 2;
    sc += (text.split(/\s+/).length / dur) * 1.5; // dense speech beats silence
    ranked.sort((a, b) => b[1] - a[1]);
    cands.push({ start: st, end: segs[j].end, score: sc, text: text.trim(), words: ranked.slice(0, 3).map((r) => r[0]), i, j });
  }
  cands.sort((a, b) => b.score - a.score);
  const chosen = [];
  for (const c of cands) {
    if (chosen.length >= N) break;
    if (chosen.every((p) => c.end + 10 < p.start || c.start > p.end + 10)) chosen.push(c);
  }
  chosen.sort((a, b) => a.start - b.start);
  return chosen.map((c, n) => ({
    n: n + 1, start: c.start, end: c.end, text: c.text,
    title: c.words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' · ') || 'Clip ' + (n + 1),
    i: c.i, j: c.j
  }));
}

/* ---------- results UI ---------- */
function showResults() {
  const dur = state.duration || state.segs[state.segs.length - 1].end;
  $('endTick').textContent = fmt(dur);
  const tl = $('timeline'); tl.replaceChildren();
  const list = $('clips'); list.replaceChildren();
  state.clips.forEach((c) => {
    const mk = document.createElement('button');
    mk.className = 'mk'; mk.textContent = c.n; mk.title = 'Clip ' + c.n + ' · ' + fmt(c.start);
    mk.style.left = (c.start / dur * 100) + '%';
    mk.style.width = Math.max((c.end - c.start) / dur * 100, 0.8) + '%';
    mk.addEventListener('click', () => preview(c));
    tl.appendChild(mk);

    const card = document.createElement('div'); card.className = 'clip';
    const n = document.createElement('div'); n.className = 'n'; n.textContent = String(c.n).padStart(2, '0');
    const body = document.createElement('div');
    const h = document.createElement('h3'); h.textContent = c.title;
    const tc = document.createElement('div'); tc.className = 'tc'; tc.textContent = fmt(c.start) + ' – ' + fmt(c.end) + ' · ' + Math.round(c.end - c.start) + ' s';
    const p = document.createElement('p'); p.textContent = c.text.length > 220 ? c.text.slice(0, 220) + '…' : c.text;
    const row = document.createElement('div'); row.className = 'row';
    const bp = document.createElement('button'); bp.className = 'ghost'; bp.textContent = 'Preview';
    bp.addEventListener('click', () => preview(c));
    const bm = document.createElement('button'); bm.className = 'primary'; bm.textContent = 'Make clip';
    const st = document.createElement('span'); st.className = 'stat';
