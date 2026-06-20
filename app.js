/* ============================================================
   A6700 Field Guide — interactive engine
   ============================================================ */

/* ---------- THEME TOGGLE ---------- */
(function () {
  const t = document.querySelector('[data-theme-toggle]'), r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);
  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const paint = () => { t.innerHTML = d === 'dark' ? moon : sun; };
  paint();
  t && t.addEventListener('click', () => { d = d === 'dark' ? 'light' : 'dark'; r.setAttribute('data-theme', d); paint(); });
})();

/* ---------- SIMULATOR STATE ---------- */
const els = {
  canvas: document.getElementById('previewCanvas'),
  aSlider: document.getElementById('apertureSlider'),
  sSlider: document.getElementById('shutterSlider'),
  iSlider: document.getElementById('isoSlider'),
  aVal: document.getElementById('apertureValue'),
  sVal: document.getElementById('shutterValue'),
  iVal: document.getElementById('isoValue'),
  aHint: document.getElementById('apertureHint'),
  sHint: document.getElementById('shutterHint'),
  iHint: document.getElementById('isoHint'),
  vfA: document.getElementById('vfAperture'),
  vfS: document.getElementById('vfShutter'),
  vfI: document.getElementById('vfIso'),
  vfEv: document.getElementById('vfEv'),
  vfScene: document.getElementById('vfScene'),
  needle: document.getElementById('meterNeedle'),
  coach: document.getElementById('coach'),
  coachBadge: document.getElementById('coachBadge'),
  coachTitle: document.getElementById('coachTitle'),
  coachBody: document.getElementById('coachBody'),
  coachTips: document.getElementById('coachTips'),
  resetBtn: document.getElementById('resetBtn')
};
const ctx = els.canvas.getContext('2d');
const W = els.canvas.width, H = els.canvas.height;
const sceneImages = {};
let currentScene = 'portrait';
let imgReady = false;

/* preload all scene images */
function preload() {
  Object.entries(SCENES).forEach(([key, sc]) => {
    const im = new Image();
    im.onload = () => { sceneImages[key] = im; if (key === currentScene) { imgReady = true; render(); } };
    im.src = sc.img;
  });
}

/* ---------- EXPOSURE MATH ---------- */
function getEV() {
  const a = APERTURE_STOPS[+els.aSlider.value].ev;
  const s = SHUTTER_STOPS[+els.sSlider.value].ev;
  const i = ISO_STOPS[+els.iSlider.value].ev;
  return a + s + i;
}

/* offscreen scratch canvases */
const blurCanvas = document.createElement('canvas');
blurCanvas.width = W; blurCanvas.height = H;
const bctx = blurCanvas.getContext('2d');

function render() {
  if (!imgReady || !sceneImages[currentScene]) return;
  const img = sceneImages[currentScene];
  const sc = SCENES[currentScene];

  const aIdx = +els.aSlider.value, sIdx = +els.sSlider.value, iIdx = +els.iSlider.value;
  const totalEV = getEV();
  const evError = totalEV - sc.baseEV;          // + = overexposed, - = under
  const fNum = APERTURE_STOPS[aIdx].f;
  const shutterEV = SHUTTER_STOPS[sIdx].ev;
  const isoIdx = iIdx;

  /* draw scaled to cover */
  const ir = img.width / img.height, cr = W / H;
  let dw, dh, dx, dy;
  if (ir > cr) { dh = H; dw = H * ir; dx = (W - dw) / 2; dy = 0; }
  else { dw = W; dh = W / ir; dx = 0; dy = (H - dh) / 2; }

  /* ---- depth-of-field blur ----
     Wide aperture (low f) blurs the background; how much depends on scene priority.
     For "sharp" scenes (landscape) the effect is muted. */
  const fStops = [3.5, 4, 4.5, 5.6, 6.3, 8, 11, 13, 16, 22];
  // openness 1 at f/3.5 → 0 at f/16+
  const openness = Math.max(0, (16 - fNum) / (16 - 3.5));
  let bgBlur = openness * 14 * (1 - sc.blurSubject); // px

  /* compute filter brightness/contrast from exposure error */
  const brightness = Math.max(0.12, Math.min(2.1, Math.pow(2, evError * 0.42)));
  // crushed/blown contrast at extremes
  const contrast = evError < -2 ? 0.78 : evError > 2 ? 0.82 : 1;
  const sat = evError < -2.5 ? 0.6 : 1;

  bctx.clearRect(0, 0, W, H);
  bctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${sat})`;
  bctx.drawImage(img, dx, dy, dw, dh);
  bctx.filter = 'none';

  /* composite: if there's background blur, draw a blurred copy then a sharp focus band */
  ctx.clearRect(0, 0, W, H);
  if (bgBlur > 0.5) {
    // blurred full frame
    ctx.filter = `blur(${bgBlur}px)`;
    ctx.drawImage(blurCanvas, 0, 0);
    ctx.filter = 'none';
    // sharp focus band around subject (vertical gradient mask)
    const fy = sc.focusY * H;
    const bandH = H * (0.34 + sc.blurSubject * 0.5);
    const grad = ctx.createLinearGradient(0, fy - bandH, 0, fy + bandH);
    const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(blurCanvas, 0, 0);
    tctx.globalCompositeOperation = 'destination-in';
    const g2 = tctx.createLinearGradient(0, fy - bandH, 0, fy + bandH);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(0.5, 'rgba(0,0,0,1)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    tctx.fillStyle = g2;
    tctx.fillRect(0, 0, W, H);
    ctx.drawImage(tmp, 0, 0);
  } else {
    ctx.drawImage(blurCanvas, 0, 0);
  }

  /* ---- motion blur for slow shutter on action scenes ---- */
  const motionScenes = { sports: 1, wildlife: 0.8, night: 0.5, portrait: 0.35, macro: 0.3, landscape: 0.05 };
  // slower shutter (higher shutterEV index beyond ~5) introduces streak
  const slowness = Math.max(0, sIdx - 5);
  const motionAmt = slowness * (motionScenes[currentScene] || 0.3);
  if (motionAmt > 0.6) {
    ctx.globalAlpha = 0.32;
    const off = Math.min(18, motionAmt * 2.2);
    ctx.drawImage(els.canvas, off, 0);
    ctx.drawImage(els.canvas, -off, 0);
    ctx.globalAlpha = 1;
  }

  /* ---- ISO grain ---- */
  if (isoIdx > 1) {
    addGrain(isoIdx);
  }

  /* ---- clipping warnings (subtle) ---- */
  updateUI(aIdx, sIdx, iIdx, totalEV, evError);
}

/* grain via noise overlay */
function addGrain(isoIdx) {
  const intensity = (isoIdx - 1) / 9;           // 0..1
  const amount = intensity * 55;
  const density = 0.5 + intensity * 0.5;
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  for (let p = 0; p < d.length; p += 4) {
    if (Math.random() > density) continue;
    const n = (Math.random() - 0.5) * amount;
    d[p] += n; d[p + 1] += n; d[p + 2] += n;
  }
  ctx.putImageData(id, 0, 0);
}

/* ---------- UI SYNC ---------- */
function setFill(slider) {
  const pct = (slider.value / slider.max) * 100;
  slider.style.setProperty('--fill', pct + '%');
}

function updateUI(aIdx, sIdx, iIdx, totalEV, evError) {
  const a = APERTURE_STOPS[aIdx], s = SHUTTER_STOPS[sIdx], i = ISO_STOPS[iIdx];
  els.aVal.textContent = a.label; els.sVal.textContent = s.label; els.iVal.textContent = i.label;
  els.vfA.textContent = a.label; els.vfS.textContent = s.label; els.vfI.textContent = 'ISO ' + i.label;
  els.aHint.textContent = APERTURE_HINTS[aIdx];
  els.sHint.textContent = SHUTTER_HINTS[sIdx];
  els.iHint.textContent = ISO_HINTS[iIdx];
  els.vfScene.textContent = SCENES[currentScene].name.toUpperCase();

  const evShown = (evError >= 0 ? '+' : '−') + Math.abs(evError).toFixed(1);
  els.vfEv.textContent = evShown + ' EV';

  // needle: -3..+3 maps 0..100%
  const clamped = Math.max(-3, Math.min(3, evError));
  els.needle.style.left = ((clamped + 3) / 6 * 100) + '%';

  [els.aSlider, els.sSlider, els.iSlider].forEach(setFill);
  coach(aIdx, sIdx, iIdx, evError);
}

/* ---------- COACHING ENGINE ---------- */
function coach(aIdx, sIdx, iIdx, evError) {
  const sc = SCENES[currentScene];
  const fNum = APERTURE_STOPS[aIdx].f;
  const tips = [];
  let badge, title, body, colorVar, bgVar;

  const T = (cls, label, text) => `<span class="lbl lbl-${cls}">${label}</span>${text}`;

  /* exposure verdict */
  if (evError > 1.6) {
    badge = 'Overexposed'; title = 'Too bright — highlights are washing out';
    colorVar = 'var(--bad)'; bgVar = 'color-mix(in oklab,var(--bad) 18%,transparent)';
    body = 'You\'re letting in more light than the scene needs, so bright areas are losing all detail. Bring the exposure down using whichever dial protects the look you want.';
    if (iIdx > 0) tips.push(T('iso', 'ISO', 'Lower ISO first — it costs you nothing and only makes the file cleaner.'));
    tips.push(T('shutter', 'Shutter', 'Speed up the shutter to cut light without touching your background blur.'));
    if (fNum < 8) tips.push(T('aperture', 'Aperture', 'Or close the aperture (higher f-number) — bonus: more of the scene comes into focus.'));
  } else if (evError < -1.6) {
    badge = 'Underexposed'; title = 'Too dark — shadows are crushing to black';
    colorVar = 'var(--c-shutter)'; bgVar = 'color-mix(in oklab,var(--c-shutter) 18%,transparent)';
    body = 'Not enough light is reaching the sensor. Lift the exposure — but choose the dial that won\'t ruin the shot you\'re after.';
    if (fNum > 3.5 && sc.priority !== 'sharp') tips.push(T('aperture', 'Aperture', 'Open the aperture (lower f-number) for more light and a softer background.'));
    if (sIdx > 4) tips.push(T('shutter', 'Shutter', 'Slow the shutter for more light — but only if your subject is still, or it\'ll blur.'));
    tips.push(T('iso', 'ISO', 'Raise ISO to brighten instantly. A little grain beats a dark photo.'));
  } else {
    badge = 'Well exposed'; title = 'Nicely balanced — now it\'s about the look';
    colorVar = 'var(--good)'; bgVar = 'color-mix(in oklab,var(--good) 18%,transparent)';
    body = 'Your exposure is on target for this scene. From here it\'s all creative trade-offs — read on for tips tuned to a ' + sc.name.toLowerCase() + '.';
  }

  /* creative / scene-specific coaching (added regardless of exposure) */
  if (sc.priority === 'blur') {
    if (fNum > 6.3) tips.push(T('aperture', 'Blur', 'For a creamier background, open the aperture toward f/3.5 and get closer or zoom in longer.'));
    else if (evError > -1.6 && evError < 1.6) tips.push(T('aperture', 'Nice', 'Your wide aperture is giving lovely subject separation — exactly what a ' + sc.name.toLowerCase() + ' wants.'));
  }
  if (sc.priority === 'sharp') {
    if (fNum < 8) tips.push(T('aperture', 'Sharpness', 'Landscapes want f/8-f/11 for front-to-back focus and peak lens sharpness. Stop down a little.'));
    if (iIdx > 1) tips.push(T('iso', 'Clean', 'Drop to ISO 100 for the cleanest landscape — slow the shutter (tripod) instead of raising ISO.'));
  }
  if (sc.priority === 'freeze') {
    if (sIdx > 3) tips.push(T('shutter', 'Freeze', 'Action needs 1/1000 or faster to freeze it. Raise the shutter, then raise ISO to keep brightness.'));
    else if (evError > -1.6 && evError < 1.6) tips.push(T('shutter', 'Sharp', 'That fast shutter will freeze the motion cleanly — perfect for ' + sc.name.toLowerCase() + '.'));
  }
  if (sc.priority === 'light') {
    if (sIdx < 5) tips.push(T('shutter', 'Light', 'At night you can usually afford 1/60 handheld (thanks to IBIS) to gather more light.'));
    if (fNum > 4) tips.push(T('aperture', 'Open up', 'Open toward f/3.5 — at night you want every photon your lens can give.'));
  }

  /* universal warnings */
  if (sIdx >= 9 && currentScene !== 'night') tips.push(T('shutter', 'Shake', 'This shutter is slow enough that handholding will blur. Use a tripod, or speed it up.'));
  if (iIdx >= 7) tips.push(T('iso', 'Grain', 'ISO is very high — expect heavy grain. Only stay here if there\'s truly no other way to get the shot.'));

  els.coachBadge.textContent = badge;
  els.coachTitle.textContent = title;
  els.coachBody.textContent = body;
  els.coach.style.setProperty('--coach-c', colorVar);
  els.coach.style.setProperty('--coach-bg', bgVar);
  els.coachBadge.style.background = bgVar; els.coachBadge.style.color = colorVar;
  els.coachTips.innerHTML = tips.slice(0, 4).map(t => `<li>${t}</li>`).join('');
}

/* ---------- SCENE SWITCH ---------- */
function setScene(key, applyRec = true) {
  currentScene = key;
  imgReady = !!sceneImages[key];
  document.querySelectorAll('.scene-chip').forEach(c => {
    const on = c.dataset.scene === key;
    c.classList.toggle('is-active', on);
    c.setAttribute('aria-selected', on);
  });
  if (applyRec) {
    const rec = SCENES[key].rec;
    els.aSlider.value = rec[0]; els.sSlider.value = rec[1]; els.iSlider.value = rec[2];
  }
  render();
  if (!imgReady) {
    // image still loading: redraw when ready handled by preload onload
  }
}

/* ---------- LISTENERS ---------- */
[els.aSlider, els.sSlider, els.iSlider].forEach(sl => sl.addEventListener('input', render));
document.querySelectorAll('.scene-chip').forEach(c => c.addEventListener('click', () => setScene(c.dataset.scene)));
els.resetBtn.addEventListener('click', () => {
  const rec = SCENES[currentScene].rec;
  els.aSlider.value = rec[0]; els.sSlider.value = rec[1]; els.iSlider.value = rec[2];
  render();
});

/* ---------- BUILD PRESET CARDS ---------- */
(function buildPresets() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = PRESETS.map(p => {
    const a = APERTURE_STOPS[p.a].label, s = SHUTTER_STOPS[p.s].label, i = ISO_STOPS[p.i].label;
    return `<article class="preset-card">
      <img class="preset-thumb" src="${SCENES[p.scene].img}" alt="${p.title} example" loading="lazy">
      <div class="preset-body">
        <span class="preset-tag">${p.tag}</span>
        <h3>${p.title}</h3>
        <div class="preset-settings">
          <span class="pset a">${a}</span><span class="pset s">${s}</span><span class="pset i">ISO ${i}</span>
        </div>
        <p class="preset-why">${p.why}</p>
        <p class="preset-lens">📷 ${p.lens}</p>
        <button class="preset-load" data-scene="${p.scene}" data-a="${p.a}" data-s="${p.s}" data-i="${p.i}">Load in simulator ↑</button>
      </div>
    </article>`;
  }).join('');
  grid.querySelectorAll('.preset-load').forEach(btn => {
    btn.addEventListener('click', () => {
      setScene(btn.dataset.scene, false);
      els.aSlider.value = btn.dataset.a; els.sSlider.value = btn.dataset.s; els.iSlider.value = btn.dataset.i;
      render();
      document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ---------- BUILD CONDITION GUIDES ---------- */
(function buildGuides() {
  const list = document.getElementById('guideList');
  const chev = '<svg class="guide-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
  list.innerHTML = GUIDES.map(g => {
    const recipe = g.recipe.map(r => `<span class="pset ${r[1]}">${r[0]}</span>`).join('');
    const reasons = g.reasons.map(r => `<li><span class="xyz">${r[0]}</span><span>${r[1]}</span></li>`).join('');
    return `<details class="guide">
      <summary class="guide-summary">
        <span class="guide-icon" aria-hidden="true">${g.icon}</span>
        <span class="guide-head-text"><h3>${g.title}</h3><p>${g.sub}</p></span>
        ${chev}
      </summary>
      <div class="guide-body">
        <div class="guide-recipe">${recipe}</div>
        <ul class="guide-reasons">${reasons}</ul>
        <p class="guide-lens-tip"><strong>Lens:</strong> ${g.lens}</p>
      </div>
    </details>`;
  }).join('');
})();

/* ---------- BUILD LENS CARDS ---------- */
(function buildLenses() {
  const grid = document.getElementById('lensGrid');
  grid.innerHTML = LENSES.map(l => {
    const span = l => `${((l.range[1] - l.min) / (l.max - l.min) * 100).toFixed(1)}`;
    const left = ((l.range[0] - l.min) / (l.max - l.min) * 100).toFixed(1);
    const width = (((l.range[1] - l.range[0]) / (l.max - l.min)) * 100).toFixed(1);
    const best = l.best.map(b => `<li>${b}</li>`).join('');
    return `<article class="lens-card">
      <span class="lens-name">${l.name}</span>
      <h3>${l.title}</h3>
      <span class="lens-equiv">${l.equiv}</span>
      <div class="lens-bar"><span style="left:${left}%;width:${width}%"></span></div>
      <div class="lens-range-label"><span>16mm</span><span>wide ↔ telephoto</span><span>350mm</span></div>
      <p class="lens-role">${l.role}</p>
      <ul class="lens-best" role="list">${best}</ul>
    </article>`;
  }).join('');
})();

/* ---------- BUILD CHEAT SUBJECT TABLE ---------- */
(function buildCheat() {
  const tb = document.querySelector('#cheatSubjectTable tbody');
  tb.innerHTML = CHEAT_ROWS.map(r =>
    `<tr><td class="td-key">${r[0]}</td><td>${r[1]}</td><td class="mono">${r[2]}</td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td><td>${r[5]}</td></tr>`
  ).join('');
})();

/* ---------- INIT ---------- */
preload();
setScene('portrait');
[els.aSlider, els.sSlider, els.iSlider].forEach(setFill);
