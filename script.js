(() => {
  "use strict";

  const svgNS = "http://www.w3.org/2000/svg";
  const scene = document.querySelector(".experience");
  const flowers = document.querySelector("#flowers");
  const particles = document.querySelector("#particles");
  const defs = document.querySelector(".bouquet defs");
  const replay = document.querySelector("#replay");
  const motion = document.querySelector("#motion");
  const status = document.querySelector("#status");

  // Back to front. Bloom values keep some cups tight and let others open wide.
  // Coordinates, silhouettes, stem bends, timing, and colors are all independent.
  const tulips = [
    { x: 231, y: 319, size: 0.77, tilt: -12, bloom: 0.23, bend: -33, delay: 3.30, tone: 0, sway: -0.62, period: 9.3 },
    { x: 334, y: 283, size: 0.90, tilt: 9, bloom: 0.56, bend: 48, delay: 2.92, tone: 1, sway: 0.68, period: 10.4 },
    { x: 442, y: 411, size: 0.76, tilt: 24, bloom: 0.18, bend: 29, delay: 4.00, tone: 2, sway: 0.85, period: 8.7 },
    { x: 122, y: 468, size: 0.83, tilt: -27, bloom: 0.58, bend: -60, delay: 4.57, tone: 1, sway: -0.72, period: 11.1 },
    { x: 175, y: 392, size: 0.98, tilt: -15, bloom: 0.93, bend: -48, delay: 3.85, tone: 2, sway: -0.48, period: 9.9 },
    { x: 398, y: 480, size: 0.95, tilt: 19, bloom: 0.82, bend: 68, delay: 5.01, tone: 0, sway: 0.55, period: 10.8 },
    { x: 291, y: 418, size: 1.04, tilt: -5, bloom: 1.00, bend: -17, delay: 4.38, tone: 1, sway: -0.35, period: 12.2 },
    { x: 224, y: 544, size: 0.97, tilt: -17, bloom: 0.62, bend: -54, delay: 5.57, tone: 0, sway: -0.60, period: 10.1 },
    { x: 333, y: 573, size: 1.01, tilt: 13, bloom: 0.91, bend: 41, delay: 6.03, tone: 2, sway: 0.42, period: 11.7 },
  ];

  const palettes = [
    { light: "#fff0f3", pink: "#f0c4d2", mid: "#d89aad", shadow: "#a7627e", deep: "#79475e" },
    { light: "#fff2f4", pink: "#f4cdd8", mid: "#dea6bb", shadow: "#b46f8e", deep: "#85475f" },
    { light: "#ffeaf0", pink: "#edbfce", mid: "#d799b0", shadow: "#a66182", deep: "#7b435c" },
  ];

  function element(name, attributes = {}, parent) {
    const node = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (parent) parent.appendChild(node);
    return node;
  }

  function gradient(id, stops, attributes = {}) {
    const node = element("linearGradient", { id, x1: "0", y1: "0.2", x2: "1", y2: "0.65", ...attributes }, defs);
    stops.forEach(([offset, color]) => element("stop", { offset, "stop-color": color }, node));
  }

  palettes.forEach((p, i) => {
    gradient(`petal-left-${i}`, [[0, p.light], [0.19, p.pink], [0.58, p.mid], [0.87, p.shadow], [1, p.deep]]);
    gradient(`petal-right-${i}`, [[0, p.deep], [0.22, p.shadow], [0.56, p.pink], [0.88, p.light], [1, p.mid]]);
    gradient(`petal-front-${i}`, [[0, p.shadow], [0.22, p.mid], [0.48, p.pink], [0.74, p.light], [1, p.mid]]);
    gradient(`petal-back-${i}`, [[0, p.shadow], [0.35, p.mid], [0.72, p.pink], [1, p.light]], { x1: "0.4", y1: "1", x2: "0.65", y2: "0" });
    gradient(`petal-heart-${i}`, [[0, p.deep], [0.4, p.shadow], [0.82, p.mid], [1, p.pink]], { x1: "0.5", y1: "1", x2: "0.5", y2: "0" });
  });

  const petalShapes = [
    // The back whorl opens first; the front whorl then peels away from it.
    { name: "rear-left", fill: "back", d: "M0 5 C-25 -7 -42 -42 -33 -79 C-29 -96 -19 -105 -14 -98 C3 -81 14 -34 0 5Z", edge: "M-33 -79 C-29 -96 -19 -105 -14 -98", closed: 18, angle: -12, width: 0.56, order: 0 },
    { name: "rear-right", fill: "back", d: "M0 5 C27 -9 44 -47 32 -85 C28 -98 19 -106 14 -98 C-5 -80 -14 -30 0 5Z", edge: "M32 -85 C28 -98 19 -106 14 -98", closed: -19, angle: 15, width: 0.53, order: 0.28 },
    { name: "rear-center", fill: "heart", d: "M0 5 C-20 -11 -29 -54 -20 -84 C-15 -103 -4 -113 3 -108 C26 -98 31 -40 0 5Z", edge: "M-20 -84 C-15 -103 -4 -113 3 -108", closed: 0, angle: 2, width: 0.65, order: 0.52 },
    { name: "outer-left", fill: "left", d: "M1 6 C-25 3 -48 -18 -49 -53 C-50 -73 -46 -89 -39 -92 C-26 -84 -13 -68 -10 -46 C-8 -26 7 -6 1 6Z", edge: "M-49 -53 C-50 -73 -46 -89 -39 -92 C-26 -84 -13 -68 -10 -46", veins: ["M-2 0 C-22 -19 -39 -52 -39 -85", "M-2 -2 C-13 -27 -21 -60 -36 -82", "M-5 0 C-29 -15 -42 -43 -44 -68"], closed: 24, angle: -13, width: 0.53, order: 0.80 },
    { name: "outer-right", fill: "right", d: "M-1 6 C29 0 48 -22 49 -57 C49 -76 43 -93 37 -91 C21 -82 13 -63 10 -44 C8 -24 -6 -6 -1 6Z", edge: "M49 -57 C49 -76 43 -93 37 -91 C21 -82 13 -63 10 -44", veins: ["M1 0 C20 -24 34 -52 38 -85", "M2 0 C14 -25 21 -63 34 -82", "M4 -2 C30 -23 43 -48 43 -72"], closed: -25, angle: 16, width: 0.53, order: 1.08 },
    { name: "front", fill: "front", d: "M0 7 C-23 5 -34 -15 -33 -42 C-33 -64 -23 -83 -12 -80 C-5 -77 0 -74 8 -79 C22 -89 33 -69 32 -46 C32 -17 21 5 0 7Z", edge: "M-33 -42 C-33 -64 -23 -83 -12 -80 C-5 -77 0 -74 8 -79 C22 -89 33 -69 32 -46", veins: ["M0 3 C-12 -15 -23 -47 -18 -74", "M2 1 C9 -20 19 -52 17 -76", "M0 -3 C-3 -29 -5 -54 -4 -75", "M-5 1 C-20 -15 -28 -36 -27 -53"], closed: -3, angle: -3, width: 0.66, order: 1.37 },
  ];

  function leaf(parent, x, y, direction, length, width, delay, back = false) {
    const anchor = element("g", { transform: `translate(${x} ${y}) scale(${direction} 1)` }, parent);
    const group = element("g", { class: "leaf-unfurl", style: `--leaf-delay:${delay}s;--fold:31deg` }, anchor);
    const l = length;
    const w = width;
    element("path", {
      d: `M0 0 C${-w * 0.25} ${-l * 0.22} ${-w * 1.21} ${-l * 0.43} ${-w} ${-l} C${-w * 0.72} ${-l * 0.74} ${w * 0.43} ${-l * 0.42} 0 0Z`,
      fill: `url(#${back ? "leaf-back" : "leaf"})`,
    }, group);
    element("path", { d: `M0 0 Q${-w * 0.49} ${-l * 0.5} ${-w} ${-l}`, class: "leaf-vein" }, group);
    element("path", { d: `M-2 -9 C${-w * 0.3} ${-l * 0.24} ${-w * 1.04} ${-l * 0.52} ${-w} ${-l}`, fill: "none", stroke: "#9dac8a", "stroke-width": 0.6, opacity: 0.15 }, group);
  }

  // Cubic interpolation puts leaves exactly on their own curved stem.
  function pointOnStem(points, t) {
    const u = 1 - t;
    return [0, 1].map(axis => u ** 3 * points[0][axis] + 3 * u * u * t * points[1][axis] + 3 * u * t * t * points[2][axis] + t ** 3 * points[3][axis]);
  }

  tulips.forEach((t, index) => {
    const finish = t.delay + 7.9;
    const flower = element("g", {
      class: "tulip", "data-bloom": t.bloom,
      style: `--delay:${t.delay}s;--finish:${finish}s;--sway:${t.sway}deg;--sway-duration:${t.period}s`,
    }, flowers);
    const swaying = element("g", { class: "tulip-sway" }, flower);
    const base = 289 + (index % 4) * 8;
    const points = [[base, 867], [base + t.bend, 710], [t.x - t.tilt * 1.5, t.y + 125], [t.x, t.y]];
    const d = `M${points[0]} C${points[1]} ${points[2]} ${points[3]}`;
    element("path", { d, class: "stem", pathLength: "1", stroke: "url(#stem)", "stroke-width": 4.6 * t.size }, swaying);
    element("path", { d, class: "stem stem-highlight", pathLength: "1", stroke: "#9aad84", "stroke-width": 0.8 }, swaying);

    const low = pointOnStem(points, 0.25 + (index % 3) * 0.033);
    const high = pointOnStem(points, 0.50 + (index % 2) * 0.06);
    leaf(swaying, ...low, index % 2 ? 1 : -1, 190 + (index % 3) * 22, 43 + (index % 4) * 8, t.delay + 1.0, index < 4);
    leaf(swaying, ...high, index % 2 ? -1 : 1, 127 + (index % 3) * 19, 32 + (index % 3) * 7, t.delay + 1.85, index < 4);

    const flowerAnchor = element("g", { transform: `translate(${t.x} ${t.y}) rotate(${t.tilt}) scale(${t.size})` }, swaying);
    element("ellipse", { class: "bloom-glow", cx: "0", cy: "-43", rx: "115", ry: "124", fill: "url(#bloom-light)" }, flowerAnchor);
    const bloom = element("g", { class: "flower-grow" }, flowerAnchor);

    petalShapes.forEach(p => {
      // A closed flower still opens slightly; the wide flowers rotate farther
      // and spread their petals independently instead of fading a final image in.
      const openAngle = p.closed * (1 - t.bloom) * 0.63 + p.angle * t.bloom;
      const openX = 0.64 + t.bloom * 0.36;
      const openY = p.name === "front" ? 1 - t.bloom * 0.11 : 1;
      const petal = element("g", {
        class: `petal petal-${p.name}`,
        style: `--closed-angle:${p.closed}deg;--closed-x:${p.width};--open-angle:${openAngle}deg;--open-x:${openX};--open-y:${openY};--petal-delay:${t.delay + 3.34 + p.order}s;--petal-duration:${2.6 + t.bloom * 0.45}s`,
      }, bloom);
      element("path", { d: p.d, fill: `url(#petal-${p.fill}-${t.tone})` }, petal);
      element("path", { d: p.edge, class: "petal-edge" }, petal);
      (p.veins || []).forEach(vein => element("path", { d: vein, class: "petal-vein" }, petal));
    });

    element("path", { class: "bud-shell", d: "M0 5 C-23 -5 -29 -47 -15 -82 Q-5 -102 1 -101 Q17 -95 22 -70 C32 -34 23 -8 0 5Z", fill: `url(#petal-front-${t.tone})` }, bloom);
    element("path", { d: "M-6 0 Q0 7 6 0 L3 11 Q0 14 -3 11Z", fill: "#6b8264" }, bloom);
  });

  // A small, deterministic field: no per-frame JS and no expensive SVG filters.
  for (let i = 0; i < 19; i++) {
    element("circle", {
      class: "particle", cx: 93 + ((i * 113) % 422), cy: 508 + ((i * 59) % 302),
      r: i % 5 === 0 ? 1.7 : 0.7 + (i % 3) * 0.27, fill: "#edbacd",
      style: `--duration:${8 + (i % 5) * 1.7}s;--particle-delay:${6.5 + i * 0.52}s;--alpha:${0.16 + (i % 4) * 0.065};--drift:${(i % 2 ? 1 : -1) * (13 + i * 2)}px`,
    }, particles);
  }

  function setPaused(paused) {
    scene.classList.toggle("is-paused", paused);
    motion.setAttribute("aria-pressed", String(paused));
    motion.setAttribute("aria-label", paused ? "Resume animation" : "Pause animation");
  }

  motion.addEventListener("click", () => setPaused(!scene.classList.contains("is-paused")));

  replay.addEventListener("click", () => {
    setPaused(false);
    // Restart the same CSS timeline without replacing the DOM or event handlers.
    scene.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 0; });
    status.textContent = "Your bouquet is growing again.";
    replay.blur();
  });

  document.querySelector(".closing").addEventListener("animationend", event => {
    if (event.animationName === "closing-in") status.textContent = "Nine pink tulips, grown just for you.";
  });

  // Background tabs do no animation work; returning resumes the same moment.
  document.addEventListener("visibilitychange", () => {
    scene.classList.toggle("is-hidden", document.hidden);
  });
})();
