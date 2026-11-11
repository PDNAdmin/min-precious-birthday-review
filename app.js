(() => {
  const cfg = window.REVIEW_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const { RM, hasGsap, esc, cssVar, confetti, dropTiles, ransomify, responseId } = window.CURO;
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
  const strip = (html) => html.replace(/<[^>]+>/g, "");

  // ---------- steps ----------
  const steps = [
    { kind: "name", section: "warm" },
    { kind: "rel", section: "warm" },
    ...cfg.questions.map((q) => ({ kind: q.type, section: q.section, q })),
    { kind: "review", section: "warm" },
  ];
  const sectionLabel = { intro: "ABOUT YOU 👋", warm: "THE RATINGS ⭐", deep: "REAL TALK 💬", spicy: "SPICY ROUND 🌶️" };

  // ---------- rendering ----------
  const flow = $("#flow");
  const progress = $(".progress span");
  let current = state.step;

  const SCRAPS = { intro: ["--blue", "--green"], warm: ["--yellow", "--orange"], deep: ["--blue", "--lilac", "--green"], spicy: ["--pink", "--red"] };
  const PHOTOS = Object.values(cfg.photos);
  const RATE_COLORS = ["--lilac", "--lilac", "--blue", "--blue", "--green", "--green", "--yellow", "--orange", "--pink", "--red"];
  const REL_COLORS = ["--pink", "--yellow", "--blue", "--green", "--orange", "--lilac", "#fff"];
  let renderIdx = 0;

  function scrap(title, sub = "") {
    const step = steps[renderIdx];
    const list = SCRAPS[step.section] || SCRAPS.warm;
    const color = step.q?.id === "note" ? "--orange" : step.kind === "review" ? "--green" : list[renderIdx % list.length];
    const tilt = renderIdx % 2 ? "1deg" : "-1.2deg";
    return `<div class="scrap" style="--scrap:${cssVar(color)};--tilt:${tilt}">
        <span class="tape tape-tl" aria-hidden="true"></span>
        <h2 class="q-title" id="qt">${title}</h2>${sub}
      </div>`;
  }

  function screenEl(step, i) {
    renderIdx = i;
    const el = document.createElement("section");
    el.className = "screen q-screen";
    el.dataset.screen = "step";
    const n = i + 1, total = steps.length - 1;
    const pol = `<figure class="mini-pol" aria-hidden="true"><img src="${PHOTOS[i % PHOTOS.length]}" alt="" /><span class="slap-slot"></span></figure>`;
    const count = step.kind === "review"
      ? `<div class="q-count"><span class="label-tape">ALMOST DONE</span>${pol}</div>`
      : `<div class="q-count"><span class="label-tape">${String(n).padStart(2, "0")} / ${total}</span>${step.q ? `<span class="label-tape alt">${step.q.id === "note" ? "NOTE / PRAYER 🙏" : sectionLabel[step.section]}</span>` : ""}${pol}</div>`;
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
      case "place": {
        const C = window.COUNTRIES;
        const cur = state.answers.country || "Nigeria";
        const opt = (c) => `<option value="${esc(c.name)}" ${c.name === cur ? "selected" : ""}>${C.flag(c.code)}  ${esc(c.name)}</option>`;
        return `${scrap(tpl(q.q))}
          <div class="field-grid">
            <label class="f-label" for="f-country">Country</label>
            <div class="select-wrap"><select id="f-country" class="big-select">
              <optgroup label="Popular">${C.popular.map(opt).join("")}</optgroup>
              <optgroup label="All countries">${C.all.map(opt).join("")}</optgroup>
            </select></div>
            <label class="f-label" for="f-city">City / location</label>
            <div class="answer paper"><input class="input-line" id="f-city" autocomplete="address-level2" placeholder="e.g. Lekki, Lagos" value="${esc(state.answers.city || "")}" maxlength="80" /></div>
          </div>`;
      }
      case "met": {
        const yr = state.answers.metYear || "";
        const now = new Date().getFullYear();
        const years = [...Array.from({ length: now - 1984 }, (_, k) => String(now - k)), "Before 1985", "Since day one 👶"];
        return `${scrap(tpl(q.q))}
          <div class="field-grid">
            <span class="f-label" id="yr-label">Year</span>
            <div class="ydrop">
              <button type="button" class="ydrop-btn" id="f-year" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="yr-label f-year">
                <span class="ydrop-val">${yr ? esc(yr) : "Pick a year"}</span><b aria-hidden="true">▾</b>
              </button>
              <div class="ydrop-pop" hidden>
                <ul class="ydrop-list" role="listbox" aria-labelledby="yr-label" tabindex="-1">
                  ${years.map((y) => `<li role="option" tabindex="-1" data-year="${esc(y)}" aria-selected="${y === yr}" class="${y.length > 4 ? "wide" : ""}">${esc(y)}</li>`).join("")}
                </ul>
              </div>
            </div>
            <label class="f-label" for="f-ans">How did you meet?</label>
            <div class="answer paper"><textarea class="input-area" id="f-ans" rows="2" placeholder="${esc(tpl(q.placeholder || ""))}" maxlength="600">${esc(state.answers.metHow || "")}</textarea></div>
          </div>`;
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
          else if (s.kind === "place") { label = "Writing from"; val = [state.answers.city, state.answers.country].filter(Boolean).join(", ") || "—"; }
          else if (s.kind === "met") { label = `Met ${cfg.name}`; val = [state.answers.metYear, state.answers.metHow].filter(Boolean).join(" · ") || "—"; }
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
      if (items.length) gsap.from(items, { y: 18, opacity: 0, stagger: 0.035, duration: 0.45, ease: "power3.out", delay: 0.25, clearProps: "transform,opacity" });
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
    } else if (step.kind === "place") {
      state.answers.country = $("#f-country", el).value;
      state.answers.city = $("#f-city", el).value.trim();
      if (!state.answers.country) return "Pick your country 🌍";
    } else if (step.kind === "met") {
      state.answers.metHow = $("#f-ans", el).value.trim();
      if (!state.answers.metYear) return "Pick the year you met. A rough guess is fine!";
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

    $("#f-country", el)?.addEventListener("change", () => { persistInput(el, step); $(".form-error", el).hidden = true; });
    const yd = $(".ydrop", el);
    if (yd) bindYearDrop(yd, el);

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

  // Custom year dropdown: button + popover grid listbox, keyboard friendly.
  function bindYearDrop(yd, el) {
    const btn = $(".ydrop-btn", yd), pop = $(".ydrop-pop", yd), opts = $$("[role=option]", yd);
    const open = (v) => {
      pop.hidden = !v; btn.setAttribute("aria-expanded", v);
      if (v) {
        const sel = opts.find((o) => o.getAttribute("aria-selected") === "true") || opts[0];
        sel.focus(); sel.scrollIntoView({ block: "center" });
        if (hasGsap) gsap.from(pop, { y: -10, opacity: 0, scale: 0.96, duration: 0.25, ease: "back.out(2)" });
      }
    };
    const choose = (o) => {
      state.answers.metYear = o.dataset.year; save();
      opts.forEach((x) => x.setAttribute("aria-selected", x === o));
      $(".ydrop-val", yd).textContent = o.dataset.year;
      $(".form-error", el).hidden = true;
      open(false); btn.focus();
      if (hasGsap) gsap.fromTo(btn, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); open(pop.hidden); });
    pop.addEventListener("click", (e) => { const o = e.target.closest("[role=option]"); if (o) choose(o); });
    pop.addEventListener("keydown", (e) => {
      const i = opts.indexOf(document.activeElement);
      const cols = Math.max(1, Math.round(pop.clientWidth / (opts[0].offsetWidth + 6)));
      const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (move) { e.preventDefault(); opts[Math.max(0, Math.min(opts.length - 1, i + move))].focus(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i >= 0) choose(opts[i]); }
      else if (e.key === "Escape") { open(false); btn.focus(); }
    });
    document.addEventListener("click", (e) => { if (!yd.contains(e.target)) open(false); });
  }

  function persistInput(el, step) {
    const f = $("#f-ans", el);
    if (f && step.kind === "met") state.answers.metHow = f.value;
    else if (f && step.q) state.answers[step.q.id] = f.value;
    const c = $("#f-country", el), city = $("#f-city", el);
    if (c) state.answers.country = c.value;
    if (city) state.answers.city = city.value;
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
  // Firestore REST value encoding (keeps the form free of the Firebase SDK).
  const fsValue = (v) =>
    typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
    : typeof v === "boolean" ? { booleanValue: v }
    : v && typeof v === "object" ? { mapValue: { fields: fsFields(v) } }
    : { stringValue: String(v ?? "") };
  const fsFields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fsValue(v)]));

  async function saveFirestore(payload) {
    const { projectId, apiKey } = cfg.firebase;
    const { type, ...data } = payload;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/responses?documentId=${responseId(payload.submittedAt)}&key=${apiKey}`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: fsFields({ ...data, source: "form" }) }) });
    if (!res.ok && res.status !== 409) throw new Error(`Firestore ${res.status}`);
  }

  function saveSheet(payload) {
    // text/plain + no-cors keeps this a "simple" request Apps Script accepts without a preflight.
    return fetch(cfg.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  }

  // Main store is Firestore; the Google Sheet is the backup. Either one succeeding is enough.
  async function send(payload) {
    const jobs = [];
    if (cfg.firebase?.projectId) jobs.push(saveFirestore(payload));
    if (cfg.endpoint) jobs.push(saveSheet(payload));
    if (!jobs.length) {
      console.warn("[review] No backend configured: saved locally only.", payload);
      try {
        const k = `${STORE}:outbox`;
        localStorage.setItem(k, JSON.stringify([...(JSON.parse(localStorage.getItem(k)) || []), payload]));
      } catch {}
      return;
    }
    const results = await Promise.allSettled(jobs);
    results.filter((r) => r.status === "rejected").forEach((r) => console.warn("[review] one store failed:", r.reason));
    if (results.every((r) => r.status === "rejected")) throw results[0].reason;
  }

  async function submit(el, btn) {
    btn.disabled = true;
    const label = btn.innerHTML;
    btn.innerHTML = "Sealing…";
    const r = rel();
    const answers = {};
    cfg.questions.forEach((q) => {
      if (q.type === "place") { answers.country = state.answers.country || ""; answers.city = state.answers.city || ""; }
      else if (q.type === "met") { answers.metYear = state.answers.metYear || ""; answers.metHow = state.answers.metHow || ""; }
      else answers[q.id] = state.answers[q.id] ?? "";
    });
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

  // ---------- request your own link ----------
  $$("[data-request-link]").forEach((a) => (a.href = cfg.requestUrl));
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-home]")) { e.preventDefault(); goHome(); }
  });

  // ---------- ransom-note letters ----------
  $$("[data-ransom]").forEach((h, hi) => ransomify(h, hi * 3));

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
