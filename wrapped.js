// Precious Wrapped: login, data, stats, board. The story itself lives in wrapped-story.js (Remotion).
const cfg = window.REVIEW_CONFIG;
const { hasGsap, esc, ransomify, dropTiles, confetti, responseId } = window.CURO;
const COUNTRIES = window.COUNTRIES;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const NAME = cfg.name;
const DEMO = !cfg.firebase?.projectId || new URLSearchParams(location.search).has("demo");
const FB_VER = "10.12.2";
const AUDIO = "assets/audio/" + encodeURIComponent("Goodness of God - Worship Instrumental ✝️ Acoustic Guitar (Bethel Music).mp3");

let fb = null;
let data = [];
let stats = null;
let storyCtl = null;

// ---------- helpers ----------
const toast = (msg) => {
  const t = $(".toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 3200);
};
const isAnon = (r) => r.anonymous || !r.name;
const by = (r) => (isAnon(r) ? "Anonymous 🤫" : r.name);
const strip = (h) => h.replace(/<[^>]+>/g, "");
// Questions exactly as friends saw them, e.g. "What's her biggest strength?"
const tplQ = (s) => strip(s).replace(/\{\{(\w+)\}\}/g, (_, k) => (k === "name" ? NAME : k === "role" ? "friend" : cfg.pronoun[k] || ""));
const COLORS = ["#FFD43B", "#FF6FB5", "#5AA9FF", "#35D49C", "#FF8A3D", "#B8A1FF"];
const relColor = (rel) => COLORS[Math.abs([...String(rel)].reduce((a, c) => a + c.charCodeAt(0), 0)) % COLORS.length];
const fmtDate = (s) => { const d = new Date(s); return isNaN(d) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short" }); };
const place = (r) => [r.answers?.city, r.answers?.country].filter(Boolean).join(", ");
const flagOf = (r) => COUNTRIES?.flagFor(r.answers?.country) || "";
const metaLine = (r) => [r.relationship, place(r) && `${flagOf(r)} ${place(r)}`.trim()].filter(Boolean).join(" · ");
const initial = (r) => (isAnon(r) ? "🤫" : r.name.trim()[0].toUpperCase());

function show(id) {
  $$(".w-screen").forEach((s) => (s.hidden = s.id !== id));
  document.body.dataset.screen = id;
  window.scrollTo(0, 0);
}

// ---------- data ----------
const DEMO_DATA = [
  { name: "Tolu", relationship: "Best friend", answers: { country: "Nigeria", city: "Lekki, Lagos", metYear: "2012", metHow: "JSS3, she defended me from a senior and we've been inseparable since.", kind: 10, loving: 10, available: 9, fun: 10, words: "Loyal, hilarious, golden", strength: "You make everyone feel seen. Like, actually seen.", love: "The way you hype me up like I'm Beyoncé every single time.", improve: "Reply my voice notes before 3 business days 😭", showup: "More random 'thinking of you' texts. I love those.", single: "Because the men are intimidated, simple.", valueadd: "Value-add, 100%. Premium package.", meal: "Party jollof with extra plantain, because everybody wants you at their event.", memory: "When you cried at the Lion King stage show and denied it.", note: "Happy birthday my person! This is your year, I can feel it. I pray God blesses every single thing you lay your hands on and gives you rest on every side. Love you forever." } },
  { name: "Mummy", relationship: "Family", answers: { country: "Nigeria", city: "Ibadan", metYear: "Since day one 👶", metHow: "I carried you for nine months, my dear.", kind: 9, loving: 10, available: 7, fun: 8, words: "Prayerful, driven, kind", strength: "Your heart for God and for people.", love: "Your laugh fills the whole house.", improve: "Come home more often, my dear.", showup: "Call me on Sundays after church.", single: "", valueadd: "", meal: "Ofada rice and ayamase: rich, a bit spicy, and worth the wait.", memory: "You preached to your dolls at age 5.", note: "God's faithfulness over you is just beginning. May His face shine upon you and give you peace. I am so proud of you." } },
  { name: "", anonymous: true, relationship: "Close friend", answers: { country: "United Kingdom", city: "London", metYear: "2018", metHow: "Uni orientation week.", kind: 8, loving: 9, available: 6, fun: 9, words: "Driven, loud, loyal", strength: "You never give up on anything.", love: "Your playlists honestly.", improve: "Rest! You do too much.", showup: "Check on me even when I go quiet.", single: "You're too busy being iconic.", valueadd: "Value-add, she's my therapist on a budget", meal: "Small chops, a bit of everything and always the best part of the party.", memory: "The day we got lost in Lekki for 3 hours.", note: "You're one of the good ones. Happy birthday!" } },
  { name: "Daniel", relationship: "Colleague / business", answers: { country: "Nigeria", city: "Victoria Island, Lagos", metYear: "2023", metHow: "First day at the new job, she showed me where the good coffee was.", kind: 9, loving: 8, available: 8, fun: 9, words: "Sharp, organised, golden", strength: "Leadership. People follow you naturally.", love: "How calm you stay under deadline pressure.", improve: "Delegate more, we got you.", showup: "Keep pushing us to dream bigger.", single: "", valueadd: "Massive value-add", meal: "Suya: spicy and everyone's favourite.", memory: "", note: "Working with you is a gift. Have the best year yet." } },
  { name: "Ada", relationship: "Best friend", answers: { country: "Canada", city: "Toronto", metYear: "2014", metHow: "Church youth camp, we were the only two who didn't know the dance.", kind: 10, loving: 9, available: 8, fun: 10, words: "Hilarious, loyal, beautiful", strength: "Your honesty, even when it stings.", love: "You remember everyone's birthdays (except your own self-care).", improve: "Say no sometimes!", showup: "Monthly girls' dinner. Non-negotiable.", single: "Waiting for God's best and refusing to settle 💅", valueadd: "Value-add forever", meal: "Pounded yam and egusi, because you're my comfort person.", memory: "Our 2am Shoprite run for ice cream.", note: "To my sister from another mister: I love you, I'm proud of you, I'm here for all of it." } },
  { name: "Chidi", relationship: "Church / community", answers: { country: "Nigeria", city: "Abuja", metYear: "2019", metHow: "Choir rehearsals.", kind: 9, loving: 9, available: 9, fun: 7, words: "Faithful, warm, driven", strength: "You serve without expecting anything back.", love: "Your worship leading gives me chills.", improve: "Take a real holiday.", showup: "Keep praying with me.", single: "", valueadd: "", meal: "Moi moi: wholesome and always there.", memory: "", note: "Another year of grace! The Lord bless you and keep you. Happy birthday." } },
  { name: "Kemi", relationship: "Casual friend", answers: { country: "United States", city: "Houston", metYear: "2025", metHow: "A friend's wedding this year!", kind: 8, loving: 8, available: 7, fun: 9, words: "Stylish, fun, confident", strength: "Your style is unmatched honestly.", love: "Your energy at every party.", improve: "Let's hang out more!", showup: "Invite me to the next outing 👀", single: "I genuinely don't know, it's a mystery to science.", valueadd: "Value-add", meal: "Chapman with extra cucumber: sweet, fun, and the drink everyone orders.", memory: "That wedding where you caught the bouquet.", note: "Happy birthday gorgeous! More life!" } },
];

async function loadFirebase() {
  if (fb) return fb;
  const base = `https://www.gstatic.com/firebasejs/${FB_VER}`;
  const [app, auth, fs] = await Promise.all([import(`${base}/firebase-app.js`), import(`${base}/firebase-auth.js`), import(`${base}/firebase-firestore.js`)]);
  const a = app.initializeApp(cfg.firebase);
  fb = { auth: auth.getAuth(a), db: fs.getFirestore(a), A: auth, F: fs };
  return fb;
}

async function fetchResponses() {
  if (DEMO) return DEMO_DATA.map((r, i) => ({ ...r, anonymous: !!r.anonymous, submittedAt: new Date(Date.now() - i * 3.6e6).toISOString(), id: "demo" + i }));
  const { db, F } = fb;
  const snap = await F.getDocs(F.collection(db, "responses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- stats ----------
function computeStats(rows) {
  const n = rows.length;
  const relCounts = {};
  rows.forEach((r) => { const k = r.relationship || "Friend"; relCounts[k] = (relCounts[k] || 0) + 1; });
  const rels = Object.entries(relCounts).sort((a, b) => b[1] - a[1]);

  const ratings = cfg.questions.filter((q) => q.type === "rating").map((q) => {
    const vals = rows.map((r) => Number(r.answers?.[q.id])).filter((v) => v >= 1 && v <= 10);
    const dist = Array.from({ length: 10 }, (_, i) => vals.filter((v) => v === i + 1).length);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const word = (q.q.match(/<em>(.*?)<\/em>/) || [, q.id])[1];
    return { id: q.id, word, avg, dist, count: vals.length };
  });
  const top = [...ratings].filter((r) => r.count).sort((a, b) => b.avg - a.avg)[0];

  const wc = {};
  rows.forEach((r) => {
    const raw = String(r.answers?.words || "").toLowerCase();
    const parts = raw.includes(",") || raw.includes("\n") ? raw.split(/[,;\n/]|\band\b/) : raw.split(/\s+/);
    parts.map((w) => w.replace(/[^\p{L}\p{N}'\- ]/gu, "").trim()).filter((w) => w && w.length < 24).forEach((w) => (wc[w] = (wc[w] || 0) + 1));
  });
  const words = Object.entries(wc).sort((a, b) => b[1] - a[1]).slice(0, 14);

  // Places
  const pc = {}, cc = {};
  rows.forEach((r) => {
    const c = r.answers?.country; if (!c) return;
    cc[c] = (cc[c] || 0) + 1;
    const city = String(r.answers?.city || "").split(",").pop().trim();
    const label = city ? `${city}, ${c}` : c;
    pc[label] = pc[label] || { label, flag: COUNTRIES?.flagFor(c) || "", count: 0 };
    pc[label].count++;
  });
  const places = Object.values(pc).sort((a, b) => b.count - a.count);
  const countries = Object.entries(cc).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count, flag: COUNTRIES?.flagFor(name) || "" }));

  // When they met
  const metRows = rows.filter((r) => r.answers?.metYear).map((r) => {
    const y = String(r.answers.metYear);
    const dayOne = /day one/i.test(y), before = /before/i.test(y);
    return { year: dayOne ? 1 : before ? 1984 : Number(y), label: dayOne ? "day one 👶" : before ? "before 1985" : "", who: by(r), how: String(r.answers.metHow || "").slice(0, 110) };
  }).filter((m) => m.year).sort((a, b) => a.year - b.year);
  let met = null;
  if (metRows.length) {
    const firstReal = metRows.find((m) => m.year > 1)?.year || new Date().getFullYear();
    const yc = {};
    metRows.forEach((m) => { const y = m.year === 1 ? firstReal - 1 : m.year; yc[y] = (yc[y] || 0) + 1; });
    met = { oldest: metRows[0], newest: metRows[metRows.length - 1], years: Object.entries(yc).map(([year, count]) => ({ year: +year, count })).sort((a, b) => a.year - b.year) };
  }

  const answers = (qid) => rows.map((r) => ({ text: String(r.answers?.[qid] ?? "").trim(), r })).filter((x) => x.text);
  const toBy = (r) => ({ label: by(r), name: r.name || "", anon: isAnon(r), meta: metaLine(r) });
  // Story highlights: the most substantial answers, kept in arrival order.
  const highlights = (qid, max) => {
    const list = answers(qid);
    const keep = new Set([...list].sort((a, b) => b.text.length - a.text.length).slice(0, max));
    return list.filter((x) => keep.has(x)).map((x) => ({ text: x.text, by: toBy(x.r) }));
  };

  const ARCH = {
    kind: ["The Soft-Life Sweetheart", "gentle with everyone, including the ones who don't deserve it"],
    loving: ["The Heart of the Group", "the glue, the hype woman, the warm hug in human form"],
    available: ["The Ride-or-Die", "first to pick up, last to leave, always there"],
    fun: ["The Main Character", "the party doesn't start until she walks in"],
  };
  const arch = ARCH[top?.id] || ["The One and Only", "there's nobody else like her"];
  return {
    n, rels, ratings, top, words, places, countries, met, arch, answers, highlights,
    count: (qid) => answers(qid).length,
    name: NAME, year: cfg.wrappedYear, giftFrom: cfg.giftFrom,
  };
}

// ---------- LOGIN ----------
async function boot() {
  $$("[data-ransom]").forEach((h) => ransomify(h, +h.dataset.ransom || 0));
  if (DEMO) { $(".demo-flag").hidden = false; $(".login-hint").hidden = false; return showLogin(); }
  try {
    await loadFirebase();
    fb.A.onAuthStateChanged(fb.auth, (u) => (u && u.email === cfg.ownerEmail ? unlocked() : showLogin()));
  } catch (e) {
    console.error(e);
    showLogin();
    toast("Couldn't reach the server. Check your connection.");
  }
}

function showLogin() {
  closeStory();
  show("login");
  if (hasGsap) {
    gsap.from(".login-card", { y: 60, rotate: -6, opacity: 0, duration: 0.7, ease: "back.out(1.6)" });
    dropTiles($$(".login .tile"));
    gsap.from(".login-lock", { scale: 0, rotate: -90, duration: 0.6, delay: 0.6, ease: "back.out(3)" });
    gsap.from(".login-peek", { y: 200, duration: 0.9, delay: 0.4, ease: "back.out(1.4)" });
  }
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pass = $("#passcode").value.trim();
  const err = $(".login-form .form-error");
  const btn = $(".login-form button");
  err.hidden = true; btn.disabled = true;
  try {
    if (DEMO) { if (pass.toLowerCase() !== "demo") throw new Error("bad"); await unlocked(); }
    else await fb.A.signInWithEmailAndPassword(fb.auth, cfg.ownerEmail, pass);
  } catch {
    err.textContent = "nope 🙈 that's not it. try again?"; err.hidden = false;
    if (hasGsap) gsap.fromTo(".login-card", { x: -12 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  } finally { btn.disabled = false; }
});

let unlocking = false;
async function unlocked() {
  if (unlocking) return; unlocking = true;
  try { data = (await fetchResponses()).sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt))); }
  catch (e) { console.error(e); toast("Couldn't load the reviews. Try refreshing."); data = []; }
  stats = computeStats(data);
  confetti($(".w-confetti"), { count: 120, originY: 0.5 });
  showPicker();
  unlocking = false;
}

function showPicker() {
  closeStory();
  show("picker");
  $(".js-count").textContent = stats.n;
  if (hasGsap) {
    dropTiles($$(".picker .tile"));
    gsap.from(".mode-card", { y: 80, rotate: (i) => (i ? 12 : -12), opacity: 0, stagger: 0.12, duration: 0.7, ease: "back.out(1.6)", delay: 0.3 });
  }
  import("./wrapped-story.js").catch(() => {}); // warm up the player while she chooses
}

async function logout() {
  closeStory();
  if (!DEMO) await fb.A.signOut(fb.auth);
  $("#passcode").value = "";
  showLogin();
}

document.addEventListener("click", (e) => {
  const m = e.target.closest("[data-mode]");
  if (m) { const mode = m.dataset.mode; mode === "story" ? startStory() : mode === "board" ? openBoard() : showPicker(); }
  if (e.target.closest("[data-logout]")) logout();
});

// ---------- STORY (Remotion) ----------
async function startStory() {
  if (!stats) return;
  show("story");
  const host = $(".story-host");
  host.innerHTML = `<p class="story-loading hand">getting your Wrapped ready…</p>`;
  try {
    const { mountStory } = await import("./wrapped-story.js");
    closeStory();
    storyCtl = mountStory(host, {
      stats, cfg, audio: AUDIO,
      onBoard: () => openBoard(),
      onClose: () => showPicker(),
      onDownload: (btn) => downloadCard(btn),
    });
  } catch (e) {
    console.error(e);
    host.innerHTML = `<p class="story-loading hand">couldn't load the player 😢 check your connection</p>`;
  }
}
function closeStory() { storyCtl?.destroy(); storyCtl = null; }

// Share card (rendered off-screen and saved as a 1080×1920 image)
function shareCardHTML() {
  const s = stats;
  return `<div class="sc-inner">
      <p class="sc-top"><span class="brand-tile">W</span>${esc(NAME)} Wrapped ${cfg.wrappedYear}</p>
      <img class="sc-cut" src="assets/img/sticker-hero.webp" alt="" />
      <p class="sc-kicker">my personality is</p>
      <h3 class="sc-arch">${esc(s.arch[0])}</h3>
      <p class="sc-desc">${esc(s.arch[1])}</p>
      <div class="sc-grid">${s.ratings.map((r, i) => `<div style="background:${COLORS[(i + 1) % 6]}"><b>${r.avg.toFixed(1)}</b><span>${esc(r.word)}</span></div>`).join("")}</div>
      <div class="sc-words">${s.words.slice(0, 3).map(([w], i) => `<span style="background:${COLORS[(i + 3) % 6]}">${esc(w)}</span>`).join("")}</div>
      <p class="sc-foot">${s.n} reviews${s.countries.length > 1 ? ` · ${s.countries.length} countries` : ""} · ${esc(cfg.site)}</p>
    </div>`;
}

async function fontCSS() {
  if (fontCSS.v) return fontCSS.v;
  const href = document.querySelector('link[href*="fonts.googleapis.com/css"]').href;
  const css = await (await fetch(href)).text();
  const blocks = css.match(/\/\* latin \*\/[^}]*}/g) || [];
  const out = await Promise.all(blocks.map(async (b) => {
    const url = (b.match(/url\((.*?)\)/) || [])[1];
    if (!url) return "";
    const blob = await (await fetch(url)).blob();
    const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    return b.replace(url, dataUrl);
  }));
  return (fontCSS.v = out.join("\n"));
}

async function downloadCard(btn) {
  if (!window.htmlToImage) return toast("Saving isn't available here, screenshot it instead 📸");
  const holder = document.createElement("div");
  holder.className = "share-holder";
  holder.innerHTML = `<div class="share-card">${shareCardHTML()}</div>`;
  document.body.appendChild(holder);
  const card = holder.firstElementChild;
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = "Making it pretty…";
  try {
    await new Promise((r) => setTimeout(r, 120));
    const blob = await htmlToImage.toBlob(card, { pixelRatio: 1080 / card.offsetWidth, backgroundColor: "#ffd43b", fontEmbedCSS: await fontCSS().catch(() => "") });
    const file = new File([blob], `${NAME.toLowerCase()}-wrapped-${cfg.wrappedYear}.png`, { type: "image/png" });
    const phone = matchMedia("(pointer: coarse)").matches;
    if (phone && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `${NAME} Wrapped` });
    else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    toast("Saved! Go post it 💅");
  } catch (e) {
    if (e?.name !== "AbortError") { console.error(e); toast("Couldn't save it, take a screenshot instead 📸"); }
  } finally { btn.disabled = false; btn.textContent = label; holder.remove(); }
}

// ---------- BOARD ----------
const board = { tab: "answers", rel: "all", q: "", favOnly: false };
const FAV_KEY = `curo-wrapped-favs:${NAME.toLowerCase()}`;
const favs = new Set((() => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } })());
const saveFavs = () => { try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch {} };
const TEXT_QS = () => cfg.questions.filter((q) => q.type === "text" || q.type === "short");

function openBoard() {
  closeStory();
  show("board");
  renderBoard();
  if (hasGsap) gsap.from(".ov-card, .bd-panel", { y: 18, opacity: 0, stagger: 0.04, duration: 0.45, ease: "power3.out", clearProps: "all" });
}

function renderBoard() {
  const s = stats;
  const last = data.length ? fmtDate(data[data.length - 1].submittedAt) : "";
  $(".board-meta").textContent = `${s.n} ${s.n === 1 ? "review" : "reviews"}${last ? ` · latest ${last}` : ""}`;
  const rated = s.ratings.filter((r) => r.count);
  const avgAll = rated.length ? rated.reduce((a, r) => a + r.avg, 0) / rated.length : 0;
  const oldest = s.met?.oldest;

  $(".board-overview").innerHTML = `
    ${ov("💌", "Reviews", s.n, "people wrote to you", "#FFD43B")}
    ${ov("⭐", "Average score", avgAll ? avgAll.toFixed(1) + "<small>/10</small>" : "–", s.top ? `top trait: ${esc(s.top.word)}` : "", "#FF6FB5")}
    ${ov("🌍", "Countries", s.countries.length || "–", s.countries.slice(0, 3).map((c) => `${c.flag} ${esc(c.name)}`.trim()).join(" · ") || "no locations yet", "#5AA9FF")}
    ${ov("⏳", "Oldest friendship", oldest ? esc(oldest.label || String(oldest.year)) : "–", oldest ? `with ${esc(oldest.who)}` : "", "#35D49C")}
    <section class="bd-panel">
      <h3>Your scores</h3>
      ${s.ratings.map((r, i) => `<div class="sc-row"><span class="sc-name">${esc(r.word)}</span>
        <span class="sc-track"><i style="width:${r.avg * 10}%;background:${COLORS[(i + 1) % 6]}"></i></span>
        <b>${r.count ? r.avg.toFixed(1) : "–"}</b></div>`).join("")}
    </section>
    <section class="bd-panel">
      <h3>Who wrote</h3>
      ${s.rels.map(([k, v]) => `<div class="sc-row"><span class="sc-name">${esc(k)}</span>
        <span class="sc-track"><i style="width:${(v / (s.rels[0]?.[1] || 1)) * 100}%;background:${relColor(k)}"></i></span><b>${v}</b></div>`).join("") || `<p class="muted">nobody yet</p>`}
    </section>
    <section class="bd-panel bd-words">
      <h3>You in 3 words</h3>
      <div class="w-chips">${s.words.map(([w, c]) => `<span class="w-chip" style="--s:${1 + (c / (s.words[0]?.[1] || 1)) * 0.35}">${esc(w)}${c > 1 ? ` <em>×${c}</em>` : ""}</span>`).join("") || `<p class="muted">no words yet</p>`}</div>
    </section>`;

  $(".chips").innerHTML = [["all", "Everyone"], ...s.rels.map(([k]) => [k, k])]
    .map(([v, l]) => `<button class="chip" type="button" data-rel="${esc(v)}" aria-pressed="${board.rel === v}">${esc(l)}</button>`).join("");
  renderBoardBody();
}
const ov = (icon, label, value, sub, color) => `
  <div class="ov-card"><span class="ov-icon" style="background:${color}">${icon}</span>
    <span class="ov-label">${label}</span><b class="ov-value">${value}</b><span class="ov-sub">${sub}</span></div>`;

const visibleRows = () => data.filter((r) => board.rel === "all" || r.relationship === board.rel);
const matches = (text) => !board.q || text.toLowerCase().includes(board.q);

function renderBoardBody() {
  const body = $(".board-body");
  const nav = $(".q-nav");
  const rows = visibleRows();
  if (!rows.length) { body.innerHTML = `<p class="empty">Nothing here yet 👀</p>`; nav.innerHTML = ""; return; }

  if (board.tab === "answers") {
    const sections = [];
    const metItems = rows.filter((r) => r.answers?.metYear && matches(`${r.answers.metYear} ${r.answers.metHow || ""} ${by(r)}`))
      .map((r) => ({ r, text: `${r.answers.metYear}${r.answers.metHow ? ` — ${r.answers.metHow}` : ""}`, key: `${r.id}:met` }));
    if (metItems.length) sections.push({ id: "met", title: "When & how they met you", items: metItems });
    TEXT_QS().forEach((q) => {
      const items = rows.map((r) => ({ r, text: String(r.answers?.[q.id] ?? "").trim(), key: `${r.id}:${q.id}` }))
        .filter((x) => x.text && matches(x.text + " " + by(x.r)));
      if (items.length) sections.push({ id: q.id, title: tplQ(q.q), items });
    });
    sections.forEach((sec) => { if (board.favOnly) sec.items = sec.items.filter((x) => favs.has(x.key)); });
    const shown = sections.filter((s) => s.items.length);
    nav.innerHTML = shown.map((sec, i) => `<a href="#sec-${sec.id}" class="q-link"><span class="dot" style="background:${COLORS[i % 6]}"></span><span class="q-link-t">${esc(sec.title)}</span><b>${sec.items.length}</b></a>`).join("");
    body.innerHTML = shown.map((sec, i) => `
      <section class="a-section" id="sec-${sec.id}">
        <h2 class="a-title"><span class="dot" style="background:${COLORS[i % 6]}"></span><span>${esc(sec.title)}</span><span class="a-count">${sec.items.length}</span></h2>
        <div class="a-grid">${sec.items.map(answerCard).join("")}</div>
      </section>`).join("") || `<p class="empty">No matches 🙈</p>`;
  } else {
    nav.innerHTML = "";
    const list = rows.filter((r) => matches(Object.values(r.answers || {}).join(" ") + " " + by(r)));
    body.innerHTML = `<div class="p-grid">${list.map((r) => `
      <button class="p-card" type="button" data-open="${esc(r.id)}">
        <span class="avatar" style="background:${relColor(r.relationship)}">${esc(initial(r))}</span>
        <span class="p-info"><b>${esc(by(r))}</b><span>${esc(metaLine(r))}</span>
          ${r.answers?.metYear ? `<span class="p-met">known since ${esc(r.answers.metYear)}</span>` : ""}</span>
        <span class="p-open" aria-hidden="true">Read →</span>
      </button>`).join("") || `<p class="empty">No matches 🙈</p>`}</div>`;
  }
}

function answerCard(x) {
  return `<figure class="a-card">
    <blockquote>${esc(x.text)}</blockquote>
    <figcaption>
      <span class="avatar sm" style="background:${relColor(x.r.relationship)}">${esc(initial(x.r))}</span>
      <span class="a-by"><b>${esc(by(x.r))}</b><span>${esc(metaLine(x.r))}</span></span>
      <button class="fav" type="button" data-fav="${esc(x.key)}" aria-pressed="${favs.has(x.key)}" aria-label="Favourite">♥</button>
    </figcaption>
  </figure>`;
}

function openLetter(id) {
  const r = data.find((x) => x.id === id);
  if (!r) return;
  const ratingQs = cfg.questions.filter((q) => q.type === "rating");
  const qa = TEXT_QS().filter((q) => String(r.answers?.[q.id] ?? "").trim());
  $(".letter-body").innerHTML = `
    <header class="lt-head">
      <span class="avatar lg" style="background:${relColor(r.relationship)}">${esc(initial(r))}</span>
      <div><h3>${esc(by(r))}</h3><p>${esc(metaLine(r))}${r.submittedAt ? ` · ${fmtDate(r.submittedAt)}` : ""}</p></div>
    </header>
    ${r.answers?.metYear ? `<p class="lt-met"><b>Met you:</b> ${esc(r.answers.metYear)}${r.answers.metHow ? ` — ${esc(r.answers.metHow)}` : ""}</p>` : ""}
    <div class="lt-scores">${ratingQs.map((q, i) => `<span><i style="background:${COLORS[(i + 1) % 6]}"></i>${esc((q.q.match(/<em>(.*?)<\/em>/) || [, q.id])[1])} <b>${esc(r.answers?.[q.id] ?? "–")}</b></span>`).join("")}</div>
    ${qa.map((q) => `<div class="lt-qa"><p class="lt-q">${esc(tplQ(q.q))}</p><p class="lt-a">${esc(r.answers[q.id])}</p></div>`).join("")}`;
  $("#letter").showModal();
  if (hasGsap) gsap.from(".letter", { y: 40, opacity: 0, duration: 0.35, ease: "power3.out" });
}

$("#board").addEventListener("click", async (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.tab) { board.tab = t.dataset.tab; $$(".tab").forEach((b) => b.setAttribute("aria-selected", b === t)); renderBoardBody(); }
  else if (t.dataset.rel !== undefined) { board.rel = t.dataset.rel; $$(".chips .chip").forEach((b) => b.setAttribute("aria-pressed", b === t)); renderBoardBody(); }
  else if (t.classList.contains("fav-toggle")) { board.favOnly = !board.favOnly; t.setAttribute("aria-pressed", board.favOnly); renderBoardBody(); }
  else if (t.dataset.fav) {
    const k = t.dataset.fav;
    favs.has(k) ? favs.delete(k) : favs.add(k); saveFavs();
    t.setAttribute("aria-pressed", favs.has(k));
    if (hasGsap) gsap.fromTo(t, { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
  }
  else if (t.dataset.open) openLetter(t.dataset.open);
  else if (t.dataset.refresh !== undefined) { t.disabled = true; await reload(); t.disabled = false; toast("Up to date ✨"); }
  else if (t.dataset.sync !== undefined) syncBackup(t);
});
$(".search input").addEventListener("input", (e) => { board.q = e.target.value.trim().toLowerCase(); renderBoardBody(); });
$("#letter").addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.id === "letter") $("#letter").close(); });

async function reload() {
  try {
    data = (await fetchResponses()).sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt)));
    stats = computeStats(data);
    renderBoard();
  } catch (e) { console.error(e); toast("Couldn't refresh. Check your connection."); }
}

// Import Sheet rows that never made it into Firestore (the Sheet is the backup).
async function syncBackup(btn) {
  if (DEMO) return toast("Sync works once Firebase is connected.");
  if (!cfg.endpoint) return toast("No backup sheet connected.");
  let key = ""; try { key = localStorage.getItem("curo-sheet-key") || ""; } catch {}
  if (!key) key = (prompt("Backup sheet key (REVEAL_KEY in the Apps Script):") || "").trim();
  if (!key) return;
  btn.disabled = true; const label = btn.textContent; btn.textContent = "Syncing…";
  try {
    const res = await fetch(`${cfg.endpoint}?key=${encodeURIComponent(key)}`);
    const json = await res.json();
    if (!json.ok) { try { localStorage.removeItem("curo-sheet-key"); } catch {} throw new Error("bad key"); }
    try { localStorage.setItem("curo-sheet-key", key); } catch {}
    const have = new Set(data.map((r) => r.id));
    const META = new Set(["submittedAt", "name", "relationship"]);
    const NUM = new Set(cfg.questions.filter((q) => q.type === "rating").map((q) => q.id));
    let added = 0;
    for (const row of json.responses) {
      if (!row.submittedAt) continue;
      const submittedAt = new Date(row.submittedAt).toISOString();
      const id = responseId(submittedAt);
      if (have.has(id) || String(row.relationship) === "Test") continue;
      const answers = {};
      Object.keys(row).forEach((k) => { if (!META.has(k) && row[k] !== "" && row[k] != null) answers[k] = NUM.has(k) ? Number(row[k]) : String(row[k]); });
      const anonymous = row.name === "Anonymous";
      try {
        await fb.F.setDoc(fb.F.doc(fb.db, "responses", id), {
          for: NAME, submittedAt, name: anonymous ? "" : String(row.name || ""), anonymous,
          relationship: String(row.relationship || ""), answers, source: "sheet",
        });
        added++;
      } catch (e) { console.warn("skip", id, e.code || e); }
    }
    await reload();
    toast(added ? `Imported ${added} from backup ✨` : "Everything's already here ✨");
  } catch (e) {
    console.error(e);
    toast(e.message === "bad key" ? "That key didn't work." : "Couldn't reach the backup sheet.");
  } finally { btn.disabled = false; btn.textContent = label; }
}

boot();
