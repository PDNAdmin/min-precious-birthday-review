(() => {
  const cfg = window.REVIEW_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && !RM;
  const STORE = `curo-review:${cfg.name.toLowerCase()}`;

  // ---------- state ----------
  const blank = () => ({ name: "", anonymous: false, relationship: "", answers: {}, step: -1 });
  let state = load() || blank();
  function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {} }

  const rel = () => cfg.relationships.find((r) => r.id === state.relationship);
  const tpl = (s = "") =>
    s.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      k === "name" ? cfg.name : k === "role" ? (rel()?.role || "friend") : cfg.pronoun[k] ?? "");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const strip = (html) => html.replace(/<[^>]+>/g, "");

  // ---------- steps ----------
  const steps = [
    { kind: "name", section: "warm" },
    { kind: "rel", section: "warm" },
    ...cfg.questions.map((q) => ({ kind: q.type, section: q.section, q })),
    { kind: "review", section: "warm" },
  ];
  const sectionLabel = { warm: "THE RATINGS ⭐", deep: "REAL TALK 💬", spicy: "SPICY ROUND 🌶️" };

  // ---------- rendering ----------
  const flow = $("#flow");
  const progress = $(".progress span");
  let current = state.step;

  const SCRAPS = { warm: ["--yellow", "--orange"], deep: ["--blue", "--lilac", "--green"], spicy: ["--pink", "--red"] };
  const PHOTOS = Object.values(cfg.photos);
  const RATE_COLORS = ["--lilac", "--lilac", "--blue", "--blue", "--green", "--green", "--yellow", "--orange", "--pink", "--red"];
  const REL_COLORS = ["--pink", "--yellow", "--blue", "--green", "--orange", "--lilac", "#fff"];
  const cssVar = (v) => (v.startsWith("--") ? `var(${v})` : v);
  let renderIdx = 0;

  function scrap(title, sub = "") {
    const step = steps[renderIdx];
    const list = SCRAPS[step.section] || SCRAPS.warm;
    const color = step.q?.id === "note" ? "--orange" : step.kind === "review" ? "--green" : list[renderIdx % list.length];
    const tilt = renderIdx % 2 ? "1deg" : "-1.2deg";
    const photo = PHOTOS[renderIdx % PHOTOS.length];
    return `<div class="scrap" style="--scrap:${cssVar(color)};--tilt:${tilt}">
        <span class="tape tape-tl" aria-hidden="true"></span>
        <h2 class="q-title" id="qt">${title}</h2>${sub}
        <figure class="mini-pol" aria-hidden="true"><img src="${photo}" alt="" /><span class="slap-slot"></span></figure>
      </div>`;
  }

  function screenEl(step, i) {
    renderIdx = i;
    const el = document.createElement("section");
    el.className = "screen q-screen";
    el.dataset.screen = "step";
    const n = i + 1, total = steps.length - 1;
    const count = step.kind === "review"
      ? `<div class="q-count"><span class="label-tape">ALMOST DONE</span></div>`
      : `<div class="q-count"><span class="label-tape">${String(n).padStart(2, "0")} / ${total}</span>${step.q ? `<span class="label-tape alt">${step.q.id === "note" ? "FINAL WORD ✍️" : sectionLabel[step.section]}</span>` : ""}</div>`;
    el.innerHTML = `<div class="q-wrap">${count}${body(step)}<p class="form-error" role="alert" hidden></p>${actions(step)}</div>
      ${i > 0 ? `<button class="q-back" type="button" data-back>← back</button>` : `<button class="q-back" type="button" data-home>← intro</button>`}`;
    return el;
  }

  function body(step) {
    const q = step.q;
    switch (step.kind) {
      case "name":
        return `${scrap("First things first: <em>who's</em> writing?")}
          <div class="answer paper"><input class="input-line" id="f-name" autocomplete="name" placeholder="your name…" value="${esc(state.name)}" ${state.anonymous ? "disabled" : ""} aria-labelledby="qt" /></div>
          <label class="toggle"><input type="checkbox" id="f-anon" ${state.anonymous ? "checked" : ""} /><span class="track"></span>Keep me anonymous 🤫</label>`;
      case "rel":
        return `${scrap(`How do you know <em>${cfg.name}</em>?`)}
          <div class="rel-grid" role="group" aria-labelledby="qt">
            ${cfg.relationships.map((r, k) => `<button type="button" class="rel-card" style="--c:${cssVar(REL_COLORS[k % REL_COLORS.length])};--r:${[-3, 2, -1, 3, -2, 1, -3][k % 7]}deg" data-rel="${r.id}" aria-pressed="${state.relationship === r.id}"><span class="emo">${r.emoji}</span>${r.label}</button>`).join("")}
          </div>`;
      case "rating": {
        const v = state.answers[q.id];
        return `${scrap(tpl(q.q))}
          <div class="rating" role="radiogroup" aria-labelledby="qt">
            ${Array.from({ length: 10 }, (_, k) => k + 1).map((k) => `<button type="button" role="radio" style="--c:var(${RATE_COLORS[k - 1]})" class="rate-btn ${v && k <= v ? "is-lit" : ""}" aria-checked="${v === k}" data-rate="${k}">${k}</button>`).join("")}
          </div>
          <div class="rate-scale"><span>nope 🙈</span><span>absolutely!! 🔥</span></div>
          <div class="reaction" aria-live="polite">${v ? reaction(v) : ""}</div>`;
      }
      case "short":
        return `${scrap(tpl(q.q))}
          <div class="answer paper"><input class="input-line" id="f-ans" placeholder="${esc(tpl(q.placeholder || ""))}" value="${esc(state.answers[q.id] || "")}" aria-labelledby="qt" maxlength="200" /></div>`;
      case "text":
        return `${scrap(tpl(q.q))}
          <div class="answer paper"><textarea class="input-area" id="f-ans" rows="3" placeholder="${esc(tpl(q.placeholder || ""))}" aria-labelledby="qt" maxlength="2000">${esc(state.answers[q.id] || "")}</textarea></div>`;
      case "review": {
        const rows = steps.slice(0, -1).map((s, i) => {
          let label, val;
          if (s.kind === "name") { label = "From"; val = state.anonymous ? "Anonymous 🤫" : state.name; }
          else if (s.kind === "rel") { label = "Relationship"; val = rel()?.label || "—"; }
          else { label = strip(tpl(s.q.q)); const a = state.answers[s.q.id]; val = a === undefined || a === "" ? "skipped" : s.kind === "rating" ? `${a}/10` : a; }
          return `<li><button type="button" data-jump="${i}"><span class="rq">${esc(label)}</span></button><span class="ra">${esc(val)}</span></li>`;
        }).join("");
        return `${scrap("Ready to <em>seal it?</em>", `<p class="q-sub">Tap any line to change it. Once it's sent, ${cfg.name} reads it on camera.</p>`)}
          <ul class="review-list">${rows}</ul>`;
      }
    }
  }

  function actions(step) {
    if (step.kind === "review")
      return `<div class="q-actions"><button class="btn btn-primary" type="button" data-submit>Seal &amp; send to ${cfg.name} <span aria-hidden="true">✉</span></button></div>`;
    if (step.kind === "rel" || step.kind === "rating")
      return `<div class="q-actions"><button class="btn btn-primary" type="button" data-next>Next <span aria-hidden="true">→</span></button>${step.kind === "rating" ? `<span class="key-hint">Tip: press 1–9, or 0 for 10</span>` : ""}</div>`;
    const hint = step.kind === "text" ? "Ctrl + Enter ↵" : "Press Enter ↵";
    return `<div class="q-actions"><button class="btn btn-primary" type="button" data-next>Next <span aria-hidden="true">→</span></button>
      ${step.q?.skippable ? `<button class="btn btn-ghost" type="button" data-skip>Skip this one</button>` : ""}<span class="key-hint">${hint}</span></div>`;
  }

  const REACT = [
    [3, "hmm", "hmm… we'll talk 😬"],
    [5, "eyes", "room to grow 👀"],
    [7, "smile", "solid! 😊"],
    [9, "heart", "she's doing amazing 🥹"],
    [10, "stamp", "ELITE. no notes 🔥"],
  ];
  const reactFor = (v) => REACT.find((r) => v <= r[0]);
  function reaction(v) {
    return `<span class="big">${v}</span><span>${reactFor(v)[2]}</span>`;
  }

  // ---------- navigation ----------
  function activeScreen() { return $(".screen.is-active"); }

  async function transition(nextEl, dir = 1) {
    const prev = activeScreen();
    if (hasGsap && prev) await gsap.to(prev, { opacity: 0, y: -30 * dir, duration: 0.32, ease: "power2.in" });
    if (prev) { prev.classList.remove("is-active"); window.gsap?.set(prev, { clearProps: "opacity,transform" }); if (prev.parentNode === flow) prev.remove(); }
    nextEl.classList.add("is-active");
    window.scrollTo(0, 0);
    if (hasGsap) {
      gsap.fromTo(nextEl, { opacity: 0, y: 40 * dir }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
      const sc = $(".scrap", nextEl);
      if (sc) gsap.from(sc, { scale: 0.8, rotate: dir > 0 ? -8 : 8, opacity: 0, duration: 0.6, ease: "back.out(1.8)", delay: 0.05 });
      const pol = $(".mini-pol", nextEl);
      if (pol) gsap.from(pol, { y: -60, rotate: 30, opacity: 0, duration: 0.6, ease: "back.out(2.2)", delay: 0.25 });
      const paper = $(".paper, .review-list", nextEl);
      if (paper) gsap.from(paper, { y: 30, opacity: 0, duration: 0.5, ease: "power3.out", delay: 0.3 });
      const items = $$(".rel-card, .rate-btn", nextEl);
      if (items.length) gsap.from(items, { y: 24, opacity: 0, scale: 0.6, stagger: 0.035, duration: 0.5, ease: "back.out(2.6)", delay: 0.3 });
    }
  }

  function go(i, dir = 1) {
    current = Math.max(0, Math.min(i, steps.length - 1));
    state.step = current; save();
    const step = steps[current];
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    const el = screenEl(step, current);
    flow.appendChild(el);
    bindScreen(el, step);
    transition(el, dir).then(() => {
      const f = $("#f-ans, #f-name:not(:disabled)", el);
      if (f && matchMedia("(hover: hover)").matches) { f.focus(); f.setSelectionRange?.(f.value.length, f.value.length); }
      if (f?.tagName === "TEXTAREA") autosize(f);
    });
  }

  function goHome() {
    progress.style.width = "0";
    transition($('[data-screen="intro"]'), -1);
  }

  function showError(el, msg) {
    const e = $(".form-error", el);
    e.textContent = msg; e.hidden = false;
    if (hasGsap) gsap.fromTo($(".q-wrap", el), { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  }

  function next(el, step, skip = false) {
    const err = validate(el, step, skip);
    if (err) return showError(el, err);
    save();
    go(current + 1);
  }

  function validate(el, step, skip) {
    if (step.kind === "name") {
      state.name = $("#f-name", el).value.trim();
      if (!state.anonymous && !state.name) return "Add your name, or switch on anonymous.";
    } else if (step.kind === "rel") {
      if (!state.relationship) return `Pick one. How do you know ${cfg.name}?`;
    } else if (step.kind === "rating") {
      if (!state.answers[step.q.id]) return "Tap a number from 1 to 10.";
    } else if (step.kind === "short" || step.kind === "text") {
      const v = $("#f-ans", el).value.trim();
      if (skip) { state.answers[step.q.id] = ""; return; }
      if (!v && !step.q.skippable) return "Write a little something. Even one line counts.";
      state.answers[step.q.id] = v;
    }
  }

  function autosize(t) { t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; }

  function bindScreen(el, step) {
    el.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.back !== undefined) { persistInput(el, step); go(current - 1, -1); }
      else if (t.dataset.next !== undefined) next(el, step);
      else if (t.dataset.skip !== undefined) next(el, step, true);
      else if (t.dataset.jump !== undefined) go(+t.dataset.jump, -1);
      else if (t.dataset.submit !== undefined) submit(el, t);
      else if (t.dataset.rel) {
        state.relationship = t.dataset.rel;
        $$(".rel-card", el).forEach((b) => b.setAttribute("aria-pressed", b === t));
        save();
        setTimeout(() => next(el, step), 380);
      } else if (t.dataset.rate) setRating(el, step, +t.dataset.rate);
    });

    const anon = $("#f-anon", el);
    anon?.addEventListener("change", () => {
      state.anonymous = anon.checked;
      const n = $("#f-name", el); n.disabled = anon.checked;
      if (!anon.checked) n.focus();
      save();
    });

    $$("input.input-line, textarea", el).forEach((f) => {
      f.addEventListener("input", () => { if (f.tagName === "TEXTAREA") autosize(f); $(".form-error", el).hidden = true; persistInput(el, step); });
      f.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (f.tagName === "TEXTAREA" && !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault(); next(el, step);
      });
    });
  }

  function persistInput(el, step) {
    const f = $("#f-ans", el);
    if (f && step.q) state.answers[step.q.id] = f.value;
    const n = $("#f-name", el);
    if (n) state.name = n.value;
    save();
  }

  function setRating(el, step, v) {
    state.answers[step.q.id] = v; save();
    $$(".rate-btn", el).forEach((b) => {
      const k = +b.dataset.rate;
      b.classList.toggle("is-lit", k <= v);
      b.setAttribute("aria-checked", k === v);
    });
    $(".form-error", el).hidden = true;
    const r = $(".reaction", el);
    r.innerHTML = reaction(v);
    const slot = $(".slap-slot", el);
    slot.innerHTML = `<svg class="sticker slap"><use href="#st-${reactFor(v)[1]}"/></svg>`;
    if (hasGsap) {
      gsap.from($(".big", r), { scale: 0.3, rotate: -40, duration: 0.5, ease: "back.out(3)" });
      gsap.fromTo($(".slap", slot), { scale: 3.2, rotate: -50, opacity: 0 }, { scale: 1, rotate: gsap.utils.random(-18, 18), opacity: 1, duration: 0.42, ease: "back.out(1.6)" });
      gsap.fromTo($(".mini-pol", el), { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, delay: 0.3, clearProps: "x" });
    }
  }

  document.addEventListener("keydown", (e) => {
    const step = steps[current];
    const el = activeScreen();
    if (!el || el.dataset.screen !== "step" || step?.kind !== "rating") return;
    if (/^[0-9]$/.test(e.key)) setRating(el, step, e.key === "0" ? 10 : +e.key);
    if (e.key === "Enter") next(el, step);
  });

  // ---------- network ----------
  async function send(payload) {
    if (!cfg.endpoint) {
      console.warn("[review] No endpoint set: saved locally only.", payload);
      try {
        const k = `${STORE}:outbox`;
        localStorage.setItem(k, JSON.stringify([...(JSON.parse(localStorage.getItem(k)) || []), payload]));
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    // text/plain + no-cors keeps this a "simple" request Apps Script accepts without a preflight.
    await fetch(cfg.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  }

  async function submit(el, btn) {
    btn.disabled = true;
    const label = btn.innerHTML;
    btn.innerHTML = "Sealing…";
    const r = rel();
    const answers = {};
    cfg.questions.forEach((q) => (answers[q.id] = state.answers[q.id] ?? ""));
    try {
      await send({
        type: "response",
        for: cfg.name,
        submittedAt: new Date().toISOString(),
        name: state.anonymous ? "" : state.name,
        anonymous: state.anonymous,
        relationship: r?.label || "",
        answers,
      });
      state = blank(); save();
      thanks();
    } catch (err) {
      console.error(err);
      btn.disabled = false; btn.innerHTML = label;
      showError(el, "Couldn't send. Check your connection and try again. Your answers are saved.");
    }
  }

  // ---------- thank you ----------
  function thanks() {
    progress.style.width = "100%";
    const el = $('[data-screen="thanks"]');
    transition(el).then(() => {
      confetti($(".confetti", el));
      if (!hasGsap) return;
      const tl = gsap.timeline();
      tl.set(".env-flap", { rotateX: 180, zIndex: 0 })
        .set(".env-seal", { scale: 0, opacity: 0 })
        .from(".envelope", { y: 60, opacity: 0, duration: 0.5, ease: "back.out(2)" })
        .from(".env-letter", { y: -90, duration: 0.6, ease: "power2.inOut" }, "-=0.1")
        .to(".env-flap", { rotateX: 0, duration: 0.5, ease: "power2.inOut", onStart: () => gsap.set(".env-flap", { zIndex: 3 }) })
        .to(".env-seal", { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(4)" })
        .to(".envelope", { rotate: -6, y: -6, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut" })
        .add(dropTiles($$(".thanks .tile")), "-=0.5")
        .from(".thanks-note", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.2")
        .from(".cta-card", { y: 60, opacity: 0, rotate: 6, duration: 0.7, ease: "back.out(1.6)" }, "-=0.2");
    });
  }

  function confetti(canvas) {
    if (RM) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = (canvas.width = innerWidth * dpr), H = (canvas.height = innerHeight * dpr);
    const colors = ["#FFD43B", "#FF6FB5", "#5AA9FF", "#35D49C", "#FF8A3D", "#B8A1FF", "#1B1B1F"];
    const parts = Array.from({ length: 170 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.45,
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

  // ---------- request your own link ----------
  $$("[data-request-link]").forEach((a) => (a.href = cfg.requestUrl));
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-home]")) { e.preventDefault(); goHome(); }
  });

  // ---------- ransom-note letters ----------
  const TILE_BG = ["--yellow", "--pink", "--blue", "#fff", "--green", "--orange", "--lilac", "--ink"];
  const TILE_FONT = [0, 1, 2, 3, 1, 0, 3, 2];
  const TILE_ROT = [-6, 4, -3, 7, -5, 3, -7, 5];
  $$("[data-ransom]").forEach((h, hi) => {
    const text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    h.innerHTML = [...text].map((c, i) => {
      const k = i + hi * 3;
      const bg = TILE_BG[k % TILE_BG.length];
      return `<span class="tile f${TILE_FONT[k % 8]}" aria-hidden="true" style="background:${cssVar(bg)};color:${bg === "--ink" ? "#fff" : "var(--ink)"};transform:rotate(${TILE_ROT[k % 8]}deg)">${esc(c)}</span>`;
    }).join("");
    if (hasGsap) $$(".tile", h).forEach((t) =>
      t.addEventListener("mouseenter", () => gsap.to(t, { y: -8, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" })));
  });
  function dropTiles(tiles) {
    return gsap.from(tiles, { y: -120, scale: 2, opacity: 0, rotate: () => gsap.utils.random(-60, 60), stagger: 0.07, duration: 0.6, ease: "back.out(1.7)" });
  }

  // ---------- draggable stickers ----------
  if (window.gsap) $$(".drag").forEach((s) => {
    let sx, sy, ox, oy;
    s.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      s.setPointerCapture(e.pointerId);
      gsap.killTweensOf(s);
      sx = e.clientX; sy = e.clientY;
      ox = gsap.getProperty(s, "x"); oy = gsap.getProperty(s, "y");
      s.classList.add("dragging");
      gsap.to(s, { scale: 1.2, rotate: gsap.utils.random(-20, 20), duration: 0.2 });
      $(".drag-hint")?.remove();
    });
    s.addEventListener("pointermove", (e) => {
      if (!s.hasPointerCapture(e.pointerId)) return;
      gsap.set(s, { x: ox + e.clientX - sx, y: oy + e.clientY - sy });
    });
    const drop = () => {
      if (!s.classList.contains("dragging")) return;
      s.classList.remove("dragging");
      gsap.to(s, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    };
    s.addEventListener("pointerup", drop);
    s.addEventListener("pointercancel", drop);
  });

  // ---------- intro ----------
  $("[data-start]").addEventListener("click", () => {
    const resume = state.step >= 0 && state.step < steps.length ? state.step : 0;
    go(resume);
  });

  if (hasGsap) {
    const squig = $(".squiggle path");
    const len = squig.getTotalLength();
    gsap.set(squig, { strokeDasharray: len, strokeDashoffset: len });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: bob });
    tl.from(".topbar", { y: -40, opacity: 0, duration: 0.5 })
      .from(".polaroid, .cutout, .cut-label", { y: -200, rotate: () => gsap.utils.random(-40, 40), opacity: 0, stagger: 0.14, duration: 0.8, ease: "back.out(1.4)" }, "-=0.1")
      .from(".invite", { opacity: 0, x: -20, duration: 0.4 }, "-=0.6")
      .add(dropTiles($$(".intro .tile")), "-=0.4")
      .from(".collage .sticker", { scale: 0, rotate: -180, opacity: 0, stagger: 0.06, duration: 0.6, ease: "back.out(3)" }, "-=0.5")
      .from(".rules", { opacity: 0, y: 14, duration: 0.4 }, "-=0.6")
      .to(squig, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.2")
      .from(".intro .lede", { opacity: 0, y: 16, duration: 0.5 }, "-=0.5")
      .from(".sticky-note", { opacity: 0, scale: 0.6, rotate: -14, duration: 0.6, ease: "back.out(2)" }, "-=0.3")
      .from(".intro-cta", { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
      .from(".washi", { yPercent: 160, duration: 0.6 }, "-=0.4")
      .from(".drag-hint", { opacity: 0, duration: 0.4 });

    // Stickers bob gently until someone grabs them.
    function bob() {
      $$(".collage .sticker").forEach((s, i) =>
        gsap.to(s, { y: "+=8", rotate: i % 2 ? 10 : -10, duration: 1.6 + i * 0.25, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }
  }
})();
