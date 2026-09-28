/* ─── Navigation ─── */

const slider = document.getElementById('slider');
const bar = document.getElementById('bar');

document.querySelector('.next').addEventListener('click', () => {
    slider.scrollBy({
        left: window.innerWidth,
        behavior: 'smooth'
    });
});

document.querySelector('.prev').addEventListener('click', () => {
    slider.scrollBy({
        left: -window.innerWidth,
        behavior: 'smooth'
    });
});

slider.addEventListener('scroll', () => {
    const max = slider.scrollWidth - slider.clientWidth;
    bar.style.width = (slider.scrollLeft / max * 100) + '%';
});

slider.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
    }
});

document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    document.getElementById('status').style.display = 'block';

    e.target.reset();
});


/* ─── Wave Border Builder ─── */

const COLOR  = '#00ffcc';
const THICK  = 22;
const WAVE_W = 32;
const WAVE_H = 22;
const CORNER = THICK;


/**
 * Build a wave path string for a horizontal strip
 * dir: 1 = wave peaks up
 * dir: -1 = wave peaks down
 */

function wavePathH(x0, y0, length, dir) {

    const cy = y0 + THICK / 2;
    const amp = THICK * 0.38;
    const wl = WAVE_W;

    let d = `M${x0},${cy}`;

    const steps = Math.ceil(length / wl) + 1;

    for (let i = 0; i < steps; i++) {

        const x1 = x0 + i * wl + wl / 4;
        const x2 = x0 + i * wl + wl * 3 / 4;
        const x3 = x0 + (i + 1) * wl;

        d += ` C${x1},${cy - dir * amp} ${x2},${cy + dir * amp} ${x3},${cy}`;
    }

    return d;
}


/**
 * Build a wave path string for a vertical strip
 */

function wavePathV(x0, y0, length, dir) {

    const cx = x0 + THICK / 2;
    const amp = THICK * 0.38;
    const wl = WAVE_W;

    let d = `M${cx},${y0}`;

    const steps = Math.ceil(length / wl) + 1;

    for (let i = 0; i < steps; i++) {

        const y1 = y0 + i * wl + wl / 4;
        const y2 = y0 + i * wl + wl * 3 / 4;
        const y3 = y0 + (i + 1) * wl;

        d += ` C${cx - dir * amp},${y1} ${cx + dir * amp},${y2} ${cx},${y3}`;
    }

    return d;
}


function buildWaveSVG(W, H) {

    const ns = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    svg.style.cssText = `
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
    `;


    const makeStroke = (d, sw, op = 1) => {

        const p = document.createElementNS(ns, 'path');

        p.setAttribute('d', d);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', COLOR);
        p.setAttribute('stroke-width', sw);
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');

        if (op < 1) {
            p.setAttribute('opacity', op);
        }

        return p;
    };


    const g = document.createElementNS(ns, 'g');


    /* clip so waves don't paint outside the band */

    const clipId = 'wfc_' + Math.random().toString(36).slice(2);

    const defs = document.createElementNS(ns, 'defs');

    const clip = document.createElementNS(ns, 'clipPath');

    clip.setAttribute('id', clipId);


    /* clip rect: full page */

    const cr = document.createElementNS(ns, 'rect');

    cr.setAttribute('x', 0);
    cr.setAttribute('y', 0);

    cr.setAttribute('width', W);
    cr.setAttribute('height', H);

    clip.appendChild(cr);

    defs.appendChild(clip);

    svg.appendChild(defs);

    g.setAttribute('clip-path', `url(#${clipId})`);


    const bw = THICK;
    const inner = 2.6;
    const outer = 2.6;
    const wave = 2.2;


    /* ── TOP ── */

    g.appendChild(
        makeStroke(`M0,${outer} H${W}`, outer)
    );

    g.appendChild(
        makeStroke(`M${CORNER},${bw - inner} H${W - CORNER}`, inner)
    );

    g.appendChild(
        makeStroke(
            wavePathH(CORNER, 0, W - 2 * CORNER, 1),
            wave
        )
    );

    g.appendChild(
        makeStroke(
            wavePathH(CORNER, 0, W - 2 * CORNER, 1).replace(
                new RegExp(`M${CORNER},${bw / 2}`),
                `M${CORNER},${bw / 2 + 3}`
            ),
            wave * 0.55,
            0.35
        )
    );


    /* ── BOTTOM ── */

    g.appendChild(
        makeStroke(`M0,${H - outer} H${W}`, outer)
    );

    g.appendChild(
        makeStroke(`M${CORNER},${H - bw + inner} H${W - CORNER}`, inner)
    );

    g.appendChild(
        makeStroke(
            wavePathH(CORNER, H - bw, W - 2 * CORNER, -1),
            wave
        )
    );


    /* ── LEFT ── */

    g.appendChild(
        makeStroke(`M${outer},0 V${H}`, outer)
    );

    g.appendChild(
        makeStroke(`M${bw - inner},${CORNER} V${H - CORNER}`, inner)
    );

    g.appendChild(
        makeStroke(
            wavePathV(0, CORNER, H - 2 * CORNER, 1),
            wave
        )
    );


    /* ── RIGHT ── */

    g.appendChild(
        makeStroke(`M${W - outer},0 V${H}`, outer)
    );

    g.appendChild(
        makeStroke(`M${W - bw + inner},${CORNER} V${H - CORNER}`, inner)
    );

    g.appendChild(
        makeStroke(
            wavePathV(W - bw, CORNER, H - 2 * CORNER, -1),
            wave
        )
    );


    /* ── CORNERS ── */

    const corners = [
        [CORNER / 2, CORNER / 2],
        [W - CORNER / 2, CORNER / 2],
        [CORNER / 2, H - CORNER / 2],
        [W - CORNER / 2, H - CORNER / 2]
    ];


    corners.forEach(([cx, cy]) => {

        // filled square block

        const sq = document.createElementNS(ns, 'rect');

        sq.setAttribute('x', cx - CORNER / 2);
        sq.setAttribute('y', cy - CORNER / 2);

        sq.setAttribute('width', CORNER);
        sq.setAttribute('height', CORNER);

        sq.setAttribute('fill', '#050505');

        sq.setAttribute('stroke', COLOR);
        sq.setAttribute('stroke-width', outer);

        g.appendChild(sq);


        // diagonal cross inside corner block

        const diag = document.createElementNS(ns, 'path');

        const r = CORNER * 0.3;

        diag.setAttribute(
            'd',
            `M${cx-r},${cy-r} L${cx+r},${cy+r} M${cx+r},${cy-r} L${cx-r},${cy+r}`
        );

        diag.setAttribute('fill', 'none');

        diag.setAttribute('stroke', COLOR);

        diag.setAttribute('stroke-width', '1.8');

        g.appendChild(diag);


        // outer circle ring

        const circ = document.createElementNS(ns, 'circle');

        circ.setAttribute('cx', cx);
        circ.setAttribute('cy', cy);

        circ.setAttribute('r', CORNER * 0.42);

        circ.setAttribute('fill', 'none');

        circ.setAttribute('stroke', COLOR);

        circ.setAttribute('stroke-width', '1.4');

        g.appendChild(circ);
    });


    svg.appendChild(g);

    return svg;
}


/* Inject SVG into every .wave-frame */

function injectBorders() {

    document.querySelectorAll('.wave-frame').forEach(frame => {

        const page = frame.parentElement;

        const W = page.offsetWidth || window.innerWidth;
        const H = page.offsetHeight || window.innerHeight;

        frame.innerHTML = '';

        frame.appendChild(
            buildWaveSVG(W, H)
        );
    });
}


injectBorders();

window.addEventListener('resize', injectBorders);
