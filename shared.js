// Shared by the review site (app.js) and Precious Wrapped (wrapped.js).
(() => {
  const STICKERS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <symbol id="st-star" viewBox="0 0 100 100"><path d="M50 6l12 30 32 3-24 21 8 32-28-17-28 17 8-32L6 39l32-3z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/></symbol>
      <symbol id="st-heart" viewBox="0 0 100 100"><path d="M50 88C20 66 6 50 8 32 10 16 28 8 41 18c4 3 7 7 9 11 2-4 5-8 9-11 13-10 31-2 33 14 2 18-12 34-42 56z" fill="var(--pink)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><path d="M24 30c2-6 8-10 14-8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></symbol>
      <symbol id="st-sparkle" viewBox="0 0 100 100"><path d="M50 4c4 26 20 42 46 46-26 4-42 20-46 46-4-26-20-42-46-46C30 46 46 30 50 4z" fill="var(--blue)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/></symbol>
      <symbol id="st-stamp" viewBox="0 0 120 120"><g transform="rotate(-12 60 60)"><circle cx="60" cy="60" r="54" fill="var(--red)" stroke="var(--ink)" stroke-width="5"/><circle cx="60" cy="60" r="43" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 5"/><text x="60" y="71" text-anchor="middle" font-family="Rubik Mono One, sans-serif" font-size="27" fill="#fff">10/10</text></g></symbol>
      <symbol id="st-arrow" viewBox="0 0 140 80"><path d="M8 60C30 20 70 10 100 30c10 7 6 22-6 18-12-4-4-24 16-28 10-2 18 0 24 4" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M124 12l12 12-16 4" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
      <symbol id="st-eyes" viewBox="0 0 120 70"><ellipse cx="34" cy="35" rx="26" ry="30" fill="#fff" stroke="var(--ink)" stroke-width="5"/><ellipse cx="86" cy="35" rx="26" ry="30" fill="#fff" stroke="var(--ink)" stroke-width="5"/><circle cx="46" cy="40" r="11" fill="var(--ink)"/><circle cx="98" cy="40" r="11" fill="var(--ink)"/></symbol>
      <symbol id="st-bubble" viewBox="0 0 140 100"><path d="M14 14h112v56H58L30 92l6-22H14z" fill="var(--green)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><text x="70" y="52" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="34" fill="var(--ink)">honest?</text></symbol>
      <symbol id="st-cloud" viewBox="0 0 120 80"><path d="M30 70C14 70 6 60 8 48c2-10 12-16 22-14 2-14 14-24 28-24 13 0 24 8 27 20 14-2 27 8 27 21 0 11-9 19-20 19z" fill="#fff" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/></symbol>
      <symbol id="st-bolt" viewBox="0 0 80 120"><path d="M48 4L10 68h24l-8 48 46-70H46z" fill="var(--orange)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/></symbol>
      <symbol id="st-crown" viewBox="0 0 120 90"><path d="M10 78l-4-56 30 24L60 8l24 38 30-24-4 56z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><circle cx="36" cy="62" r="6" fill="var(--pink)" stroke="var(--ink)" stroke-width="3"/><circle cx="60" cy="58" r="6" fill="var(--blue)" stroke="var(--ink)" stroke-width="3"/><circle cx="84" cy="62" r="6" fill="var(--green)" stroke="var(--ink)" stroke-width="3"/></symbol>
      <symbol id="st-smile" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="var(--yellow)" stroke="var(--ink)" stroke-width="5"/><circle cx="36" cy="40" r="6" fill="var(--ink)"/><circle cx="64" cy="40" r="6" fill="var(--ink)"/><path d="M30 60c10 14 30 14 40 0" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/></symbol>
      <symbol id="st-hmm" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="var(--lilac)" stroke="var(--ink)" stroke-width="5"/><circle cx="36" cy="42" r="6" fill="var(--ink)"/><circle cx="64" cy="42" r="6" fill="var(--ink)"/><path d="M32 66h36" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/></symbol>
      <symbol id="st-flame" viewBox="0 0 90 120"><path d="M45 6c6 22 34 34 34 66 0 24-16 42-34 42S11 96 11 72c0-18 10-26 14-38 4 10 8 14 12 16 2-16 0-30 8-44z" fill="var(--orange)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><path d="M45 62c4 10 16 16 16 30 0 10-7 16-16 16s-16-6-16-16c0-8 6-12 8-18 2 4 4 6 6 6 0-6 0-12 2-18z" fill="var(--yellow)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/></symbol>
      <symbol id="st-squiggle" viewBox="0 0 300 30"><path d="M4 18c18-14 30 14 48 0s30 14 48 0 30 14 48 0 30 14 48 0 30 14 48 0 30 14 48 0" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></symbol>
      <symbol id="st-lock" viewBox="0 0 100 120"><path d="M28 52V36a22 22 0 0144 0v16" fill="none" stroke="var(--ink)" stroke-width="9" stroke-linecap="round"/><rect x="12" y="50" width="76" height="62" rx="12" fill="var(--yellow)" stroke="var(--ink)" stroke-width="5"/><circle cx="50" cy="76" r="8" fill="var(--ink)"/><path d="M50 80v14" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/></symbol>
      <symbol id="st-letter" viewBox="0 0 120 90"><rect x="6" y="10" width="108" height="72" rx="8" fill="#fff" stroke="var(--ink)" stroke-width="5"/><path d="M8 14l52 40 52-40" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/><path d="M60 40c-6-8-18-2-12 8l12 10 12-10c6-10-6-16-12-8z" fill="var(--pink)" stroke="var(--ink)" stroke-width="3"/></symbol>
      <symbol id="st-play" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="var(--green)" stroke="var(--ink)" stroke-width="5"/><path d="M40 30l30 20-30 20z" fill="var(--ink)"/></symbol>
    </defs>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", STICKERS);

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && !RM;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cssVar = (v) => (v.startsWith("--") ? `var(${v})` : v);

  // Ransom-note letters: each character on its own coloured paper tile.
  const TILE_BG = ["--yellow", "--pink", "--blue", "#fff", "--green", "--orange", "--lilac", "--ink"];
  const TILE_FONT = [0, 1, 2, 3, 1, 0, 3, 2];
  const TILE_ROT = [-6, 4, -3, 7, -5, 3, -7, 5];
  function ransomify(h, offset = 0) {
    const text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    // Long words get smaller tiles so they still fit on one line.
    h.style.setProperty("--k", Math.min(1, 8 / text.length).toFixed(3));
    h.innerHTML = [...text].map((c, i) => {
      if (c === " ") return `<span class="tile-gap" aria-hidden="true"></span>`;
      const k = i + offset;
      const bg = TILE_BG[k % TILE_BG.length];
      return `<span class="tile f${TILE_FONT[k % 8]}" aria-hidden="true" style="background:${cssVar(bg)};color:${bg === "--ink" ? "#fff" : "var(--ink)"};transform:rotate(${TILE_ROT[k % 8]}deg)">${esc(c)}</span>`;
    }).join("");
    if (hasGsap) h.querySelectorAll(".tile").forEach((t) =>
      t.addEventListener("mouseenter", () => gsap.to(t, { y: -8, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" })));
  }
  function dropTiles(tiles) {
    return gsap.from(tiles, { y: -120, scale: 2, opacity: 0, rotate: () => gsap.utils.random(-60, 60), stagger: 0.07, duration: 0.6, ease: "back.out(1.7)" });
  }

  function confetti(canvas, { count = 170, originY = 0.45 } = {}) {
    if (RM || !canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = (canvas.width = canvas.clientWidth * dpr || innerWidth * dpr);
    const H = (canvas.height = canvas.clientHeight * dpr || innerHeight * dpr);
    const colors = ["#FFD43B", "#FF6FB5", "#5AA9FF", "#35D49C", "#FF8A3D", "#B8A1FF", "#1B1B1F"];
    const parts = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * originY,
      vx: (Math.random() - 0.5) * 22 * dpr, vy: (-Math.random() * 22 - 8) * dpr,
      w: (6 + Math.random() * 8) * dpr, h: (8 + Math.random() * 10) * dpr,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0], shape: Math.random() < 0.3 ? 1 : 0,
    }));
    const start = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      const life = (t - start) / 1000;
      parts.forEach((p) => {
        p.vy += 0.6 * dpr; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, life - 2.6));
        ctx.fillStyle = p.c;
        if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        ctx.restore();
      });
      if (life < 3.8) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(start);
  }

  // One ID per response, rebuildable from the Sheet's submittedAt column.
  const responseId = (submittedAt) => "r_" + String(submittedAt).replace(/\D/g, "");

  window.CURO = { RM, hasGsap, esc, cssVar, ransomify, dropTiles, confetti, responseId };
})();
