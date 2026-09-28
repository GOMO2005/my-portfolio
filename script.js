/* ---------- Core refs ---------- */

const slider = document.getElementById('slider');
const bar = document.getElementById('bar');
const formStatus = document.getElementById('status');
const pageCount = slider.querySelectorAll('.page').length;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
const currentPage = () => Math.round(slider.scrollLeft / window.innerWidth);

function goTo(index) {
  const target = Math.max(0, Math.min(pageCount - 1, index));
  slider.scrollTo({ left: target * window.innerWidth, behavior: scrollBehavior() });
}

/* ---------- Nav buttons ---------- */

document.querySelector('.next').addEventListener('click', () => goTo(currentPage() + 1));
document.querySelector('.prev').addEventListener('click', () => goTo(currentPage() - 1));

/* ---------- Progress bar: rAF + transform (compositor-only, zero reflow) ---------- */

let maxScroll = slider.scrollWidth - slider.clientWidth;
let progressQueued = false;

function paintProgress() {
  progressQueued = false;
  const ratio = maxScroll > 0 ? slider.scrollLeft / maxScroll : 0;
  bar.style.transform = 'scaleX(' + ratio + ')';
}

slider.addEventListener('scroll', () => {
  if (!progressQueued) {
    progressQueued = true;
    requestAnimationFrame(paintProgress);
  }
}, { passive: true });

/* ---------- Wheel: vertical inside panels, one smooth page-turn per gesture elsewhere ---------- */

let wheelLocked = false;

slider.addEventListener('wheel', (e) => {
  const panel = e.target.closest('.content-panel');
  if (panel && panel.scrollHeight - panel.clientHeight > 1) return; // let lists scroll vertically

  if (e.deltaY === 0 && e.deltaX === 0) return;
  e.preventDefault();

  if (wheelLocked) return; // one page per gesture = no snap fighting, no jitter
  wheelLocked = true;

  const dir = (e.deltaY || e.deltaX) > 0 ? 1 : -1;
  goTo(currentPage() + dir);
  setTimeout(() => { wheelLocked = false; }, 650);
}, { passive: false });

/* ---------- Contact form ---------- */

let statusTimer = 0;

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  formStatus.style.display = 'block';
  e.target.reset();
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { formStatus.style.display = 'none'; }, 4000);
});

/* ---------- Wave Border Builder ---------- */

const ACCENT = '#00ffcc';
const THICK  = 22;
const WAVE_W = 32;
const CORNER = THICK;

function wavePathH(x0, y0, length, dir) {
  const cy = y0 + THICK / 2;
  const amp = THICK * 0.38;
  const steps = Math.ceil(length / WAVE_W) + 1;
  let d = `M${x0},${cy}`;
  for (let i = 0; i < steps; i++) {
    const x1 = x0 + i * WAVE_W + WAVE_W / 4;
    const x2 = x0 + i * WAVE_W + (WAVE_W * 3) / 4;
    const x3 = x0 + (i + 1) * WAVE_W;
    d += ` C${x1},${cy - dir * amp} ${x2},${cy + dir * amp} ${x3},${cy}`;
  }
  return d;
}

function wavePathV(x0, y0, length, dir) {
  const cx = x0 + THICK / 2;
  const amp = THICK * 0.38;
  const steps = Math.ceil(length / WAVE_W) + 1;
  let d = `M${cx},${y0}`;
  for (let i = 0; i < steps; i++) {
    const y1 = y0 + i * WAVE_W + WAVE_W / 4;
    const y2 = y0 + i * WAVE_W + (WAVE_W * 3) / 4;
    const y3 = y0 + (i + 1) * WAVE_W;
    d += ` C${cx - dir * amp},${y1} ${cx + dir * amp},${y2} ${cx},${y3}`;
  }
  return d;
}

function buildWaveSVG(W, H) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

  const mkPath = (d, sw, op = 1) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', ACCENT);
    p.setAttribute('stroke-width', sw);
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    if (op < 1) p.setAttribute('opacity', op);
    return p;
  };

  const g = document.createElementNS(NS, 'g');
  const line = 2.6;
  const wave = 2.2;

  g.appendChild(mkPath(`M0,${line} H${W}`, line));
  g.appendChild(mkPath(`M${CORNER},${THICK - line} H${W - CORNER}`, line));
  const topWave = wavePathH(CORNER, 0, W - 2 * CORNER, 1);
  g.appendChild(mkPath(topWave, wave));
  g.appendChild(mkPath(topWave.replace(`M${CORNER},${THICK / 2}`, `M${CORNER},${THICK / 2 + 3}`), wave * 0.55, 0.35));

  g.appendChild(mkPath(`M0,${H - line} H${W}`, line));
  g.appendChild(mkPath(`M${CORNER},${H - THICK + line} H${W - CORNER}`, line));
  g.appendChild(mkPath(wavePathH(CORNER, H - THICK, W - 2 * CORNER, -1), wave));

  g.appendChild(mkPath(`M${line},0 V${H}`, line));
  g.appendChild(mkPath(`M${THICK - line},${CORNER} V${H - CORNER}`, line));
  g.appendChild(mkPath(wavePathV(0, CORNER, H - 2 * CORNER, 1), wave));

  g.appendChild(mkPath(`M${W - line},0 V${H}`, line));
  g.appendChild(mkPath(`M${W - THICK + line},${CORNER} V${H - CORNER}`, line));
  g.appendChild(mkPath(wavePathV(W - THICK, CORNER, H - 2 * CORNER, -1), wave));

  [
    [CORNER / 2, CORNER / 2],
    [W - CORNER / 2, CORNER / 2],
    [CORNER / 2, H - CORNER / 2],
    [W - CORNER / 2, H - CORNER / 2]
  ].forEach(([cx, cy]) => {
    const sq = document.createElementNS(NS, 'rect');
    sq.setAttribute('x', cx - CORNER / 2);
    sq.setAttribute('y', cy - CORNER / 2);
    sq.setAttribute('width', CORNER);
    sq.setAttribute('height', CORNER);
    sq.setAttribute('fill', '#050505');
    sq.setAttribute('stroke', ACCENT);
    sq.setAttribute('stroke-width', '2.6');
    g.appendChild(sq);

    const r = CORNER * 0.3;
    const cross = document.createElementNS(NS, 'path');
    cross.setAttribute('d', `M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}`);
    cross.setAttribute('fill', 'none');
    cross.setAttribute('stroke', ACCENT);
    cross.setAttribute('stroke-width', '1.8');
    g.appendChild(cross);

    const ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('r', CORNER * 0.42);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', ACCENT);
    ring.setAttribute('stroke-width', '1.4');
    g.appendChild(ring);
  });

  svg.appendChild(g);
  return svg;
}

/* ---------- Injection: batch ALL reads, then ALL writes (no thrash) ---------- */

function injectBorders() {
  const jobs = [];
  document.querySelectorAll('.wave-frame').forEach((frame) => {
    const page = frame.parentElement;
    jobs.push([frame, page.offsetWidth || window.innerWidth, page.offsetHeight || window.innerHeight]);
  });
  for (const [frame, W, H] of jobs) {
    frame.replaceChildren(buildWaveSVG(W, H));
  }
}

injectBorders();

let lastW = window.innerWidth;
let lastH = window.innerHeight;
let resizeRaf = 0;

window.addEventListener('resize', () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    if (window.innerWidth === lastW && window.innerHeight === lastH) return;
    lastW = window.innerWidth;
    lastH = window.innerHeight;
    maxScroll = slider.scrollWidth - slider.clientWidth;
    injectBorders();
    paintProgress();
  });
});

/* ---------- Keyboard + initial paint ---------- */

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight') goTo(currentPage() + 1);
  if (e.key === 'ArrowLeft') goTo(currentPage() - 1);
});

paintProgress();
