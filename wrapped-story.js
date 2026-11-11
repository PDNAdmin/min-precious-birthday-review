// Precious Wrapped: the story, built as a Remotion composition and played with @remotion/player.
// The composition is sized to the viewer's exact screen shape, so it fills phones and laptops alike.
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import htm from "htm";

const html = htm.bind(React.createElement);
const FPS = 30;
const T = 16; // frames each scene overlaps the previous one (circle-reveal transition)
const C = { yellow: "#FFD43B", pink: "#FF6FB5", blue: "#5AA9FF", green: "#35D49C", orange: "#FF8A3D", lilac: "#B8A1FF", red: "#FF5A5A", ink: "#1B1B1F", paper: "#FCFBFF", white: "#FFFFFF" };
const PAL = [C.yellow, C.pink, C.blue, C.green, C.orange, C.lilac];
const F = { d: "'Bricolage Grotesque', system-ui, sans-serif", h: "Caveat, cursive", m: "'Rubik Mono One', sans-serif", s: "'Abril Fatface', serif" };
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// ---------- motion helpers ----------
const sp = (f, delay = 0, config = {}) => spring({ frame: f - delay, fps: FPS, config: { damping: 15, stiffness: 140, mass: 0.9, ...config } });
const useU = () => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 100, L: width > height * 1.15, W: width, H: height };
};
const fg = (bg) => (bg === C.ink ? C.white : C.ink);

function Stage({ bg, first, children }) {
  const f = useCurrentFrame();
  const { u, W, H } = useU();
  const r = first ? 150 : interpolate(f, [0, T], [0, 150], { ...CL, easing: Easing.bezier(0.6, 0, 0.2, 1) });
  const drift = (k) => Math.sin((f + k * 40) / 50) * u * 3;
  const dot = bg === C.ink ? "rgba(255,255,255,.10)" : "rgba(27,27,31,.10)";
  return html`<${AbsoluteFill} style=${{ background: bg, color: fg(bg), clipPath: `circle(${r}% at 50% 55%)`, fontFamily: F.d, overflow: "hidden" }}>
    <div style=${{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${dot} ${u * 0.18}px, transparent ${u * 0.2}px)`, backgroundSize: `${u * 2.4}px ${u * 2.4}px` }} />
    <div style=${{ position: "absolute", width: u * 60, height: u * 60, borderRadius: "50%", border: `${u * 0.5}px solid ${dot}`, left: -u * 18 + drift(1), top: -u * 14 + drift(2) }} />
    <div style=${{ position: "absolute", width: u * 44, height: u * 44, borderRadius: "50%", background: dot, right: -u * 12 + drift(3), bottom: -u * 10 - drift(1) }} />
    ${children}
  <//>`;
}

// Kinetic text: words rise in one after another.
function Words({ text, delay = 0, per = 2, style = {} }) {
  const f = useCurrentFrame();
  const words = String(text).split(/(\s+)/);
  let k = 0;
  return html`<span style=${{ display: "inline", ...style }}>${words.map((w, i) => {
    if (/^\s+$/.test(w)) return w;
    const p = sp(f, delay + k++ * per, { damping: 18 });
    return html`<span key=${i} style=${{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 0.6}em)` }}>${w}</span>`;
  })}</span>`;
}

function Count({ to, dec = 0, delay = 0, dur = 40 }) {
  const f = useCurrentFrame();
  const v = interpolate(f, [delay, delay + dur], [0, to], { ...CL, easing: Easing.out(Easing.cubic) });
  return html`<span>${v.toFixed(dec)}</span>`;
}

const TILE_BG = [C.yellow, C.pink, C.blue, C.white, C.green, C.orange, C.lilac, C.ink];
const TILE_FONT = [F.d, F.s, F.m, F.h, F.s, F.d, F.h, F.m];
const TILE_ROT = [-6, 4, -3, 7, -5, 3, -7, 5];
function Ransom({ text, delay = 0, maxW, maxSize, offset = 0 }) {
  const f = useCurrentFrame();
  const chars = [...String(text)];
  const size = Math.min(maxSize, maxW / (chars.length * 1.02));
  return html`<div style=${{ display: "flex", gap: size * 0.08, flexWrap: "nowrap" }}>${chars.map((c, i) => {
    if (c === " ") return html`<span key=${i} style=${{ width: size * 0.3 }} />`;
    const k = i + offset, p = sp(f, delay + i * 3, { damping: 11, stiffness: 160 });
    const bg = TILE_BG[k % 8];
    const font = TILE_FONT[k % 8];
    return html`<span key=${i} style=${{
      width: size * 0.9, height: size * 1.08, display: "grid", placeItems: "center", flex: "0 0 auto",
      background: bg, color: bg === C.ink ? C.white : C.ink, border: `${size * 0.035}px solid ${C.ink}`, borderRadius: size * 0.08,
      boxShadow: `${size * 0.05}px ${size * 0.05}px 0 ${C.ink}`, fontFamily: font, fontWeight: font === F.d ? 800 : 700,
      fontSize: size * (font === F.m ? 0.62 : font === F.h ? 0.95 : 0.78), lineHeight: 1,
      opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -size * 1.6}px) rotate(${TILE_ROT[k % 8] + (1 - p) * 40}deg) scale(${1 + (1 - p) * 0.6})`,
    }}>${c}</span>`;
  })}</div>`;
}

function Sticker({ id, size, style = {}, delay = 0, float = true }) {
  const f = useCurrentFrame();
  const p = sp(f, delay, { damping: 10, stiffness: 180 });
  const bob = float ? Math.sin((f + delay * 7) / 18) * size * 0.06 : 0;
  return html`<svg style=${{ position: "absolute", width: size, height: size, overflow: "visible", filter: "drop-shadow(4px 5px 0 rgba(27,27,31,.25))", transform: `translateY(${bob}px) scale(${p}) rotate(${(1 - p) * -90}deg)`, ...style }}><use href=${"#st-" + id} /></svg>`;
}

function Tape({ children, delay = 0, bg = C.ink, color = C.white, u }) {
  const f = useCurrentFrame();
  const p = sp(f, delay);
  return html`<div style=${{ display: "inline-block", alignSelf: "flex-start", background: bg, color, fontFamily: F.m, fontSize: u * 2.3, letterSpacing: "0.06em", padding: `${u * 1}px ${u * 1.8}px`, borderRadius: u * 0.4, transform: `rotate(-2deg) translateX(${(1 - p) * -u * 20}px)`, opacity: p }}>${children}</div>`;
}

function Avatar({ name, color, size }) {
  const ch = (name || "?").trim()[0]?.toUpperCase() || "🤫";
  return html`<span style=${{ width: size, height: size, borderRadius: "50%", background: color, border: `${size * 0.06}px solid ${C.ink}`, display: "inline-grid", placeItems: "center", fontWeight: 800, fontSize: size * 0.48, flex: "0 0 auto", color: C.ink }}>${ch}</span>`;
}

// ---------- scenes ----------
function Intro({ s }) {
  const f = useCurrentFrame();
  const { u, L, W } = useU();
  const colW = L ? W * 0.5 : W * 0.86;
  const cut = sp(f, 26, { damping: 13 });
  const mq = (f * u * 0.5) % (u * 100);
  return html`<${Stage} bg=${C.ink} first=${true}>
    <div style=${{ position: "absolute", top: L ? "6%" : "8%", left: -mq, whiteSpace: "nowrap", fontFamily: F.m, fontSize: u * 16, color: "transparent", WebkitTextStroke: `${u * 0.25}px rgba(255,255,255,.18)` }}>${`${s.year} · ${s.year} · ${s.year} · ${s.year} · ${s.year}`}</div>
    <div style=${{ position: "absolute", left: u * 7, top: L ? "28%" : "24%", width: colW, display: "flex", flexDirection: "column", gap: u * 2.4 }}>
      <${Tape} u=${u} delay=${2} bg=${C.yellow} color=${C.ink}>${s.year} EDITION<//>
      <${Ransom} text=${s.name} delay=${6} maxW=${colW} maxSize=${u * 14} />
      <${Ransom} text="Wrapped" delay=${26} maxW=${colW} maxSize=${u * 14} offset=${5} />
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 7, color: C.white, marginTop: u }}><${Words} text="your people have spoken." delay=${52} per=${4} /></div>
    </div>
    <img src="assets/img/sticker-hero.webp" style=${{ position: "absolute", right: L ? "8%" : "-6%", bottom: L ? "-8%" : "-6%", height: L ? "96%" : "50%", transform: `translateY(${(1 - cut) * 60}%) rotate(${4 + (1 - cut) * 10}deg)`, filter: `drop-shadow(${u}px ${u}px 0 ${C.pink})` }} />
    <${Sticker} id="star" size=${u * 12} delay=${40} style=${{ left: L ? "52%" : "70%", top: L ? "18%" : "16%" }} />
    <${Sticker} id="sparkle" size=${u * 8} delay=${48} style=${{ left: L ? "44%" : "12%", bottom: L ? "14%" : "30%" }} />
  <//>`;
}

function Turnout({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: u * 8 }}>
      <${Tape} u=${u} delay=${T}>THE TURNOUT<//>
      <div style=${{ fontFamily: F.m, fontSize: u * (L ? 34 : 42), lineHeight: 1, margin: `${u * 3}px 0`, textShadow: `${u * 1.4}px ${u * 1.4}px 0 ${C.white}` }}><${Count} to=${s.n} delay=${T + 4} /></div>
      <div style=${{ fontWeight: 800, fontSize: u * 8, lineHeight: 1.1, maxWidth: u * 90 }}><${Words} text=${`${s.n === 1 ? "person" : "people"} wrote about you`} delay=${T + 20} per=${3} /></div>
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 6.4, marginTop: u * 3 }}><${Words} text=${`that's ${s.n} ${s.n === 1 ? "heart" : "hearts"} on paper 💌`} delay=${T + 44} /></div>
    <//>
    ${[0, 1, 2, 3, 4, 5].map((k) => {
      const t = ((f + k * 22) % 120) / 120;
      return html`<svg key=${k} style=${{ position: "absolute", width: u * 9, height: u * 9, left: `${8 + k * 16}%`, bottom: `${-10 + t * 120}%`, opacity: Math.sin(t * Math.PI), transform: `rotate(${(k % 2 ? 1 : -1) * 12}deg)` }}><use href="#st-heart" /></svg>`;
    })}
  <//>`;
}

function Places({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const n = s.countries.length;
  const big = n > 1 ? `${n} countries` : `${s.places.length} ${s.places.length === 1 ? "place" : "places"}`;
  const globe = html`<svg viewBox="0 0 200 200" style=${{ width: u * (L ? 60 : 56), height: u * (L ? 60 : 56), transform: `rotate(${f * 0.6}deg) scale(${sp(f, T + 6)})` }}>
    <circle cx="100" cy="100" r="92" fill=${C.white} stroke=${C.ink} stroke-width="5" />
    ${[30, 60].map((rx) => html`<ellipse key=${rx} cx="100" cy="100" rx=${rx} ry="92" fill="none" stroke=${C.ink} stroke-width="3" stroke-dasharray="6 8" />`)}
    <line x1="8" y1="100" x2="192" y2="100" stroke=${C.ink} stroke-width="3" stroke-dasharray="6 8" />
    ${s.places.slice(0, 6).map((p, i) => html`<circle key=${i} cx=${100 + Math.cos(i * 1.7) * 55} cy=${100 + Math.sin(i * 2.3) * 55} r=${8 * sp(f, T + 20 + i * 6)} fill=${PAL[(i + 1) % 6]} stroke=${C.ink} stroke-width="3" />`)}
  </svg>`;
  const list = html`<div style=${{ display: "flex", flexDirection: "column", gap: u * 1.6, alignItems: L ? "flex-start" : "stretch", width: L ? "auto" : "100%" }}>
    ${s.places.slice(0, L ? 4 : 5).map((p, i) => {
      const q = sp(f, T + 30 + i * 6);
      return html`<div key=${i} style=${{ display: "flex", alignItems: "center", gap: u * 1.6, background: C.white, border: `${u * 0.35}px solid ${C.ink}`, borderRadius: u * 1.6, padding: `${u * 1.4}px ${u * 2.2}px`, boxShadow: `${u * 0.6}px ${u * 0.6}px 0 ${C.ink}`, fontWeight: 800, fontSize: u * (L ? 3.4 : 4.2), transform: `translateX(${(1 - q) * (i % 2 ? 40 : -40) * u}px)`, opacity: q }}>
        <span style=${{ fontSize: u * 5 }}>${p.flag || "📍"}</span><span style=${{ flex: 1 }}>${p.label}</span><span style=${{ fontFamily: F.m, fontSize: u * 3.4 }}>×${p.count}</span>
      </div>`;
    })}
  </div>`;
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 8}px`, flexDirection: L ? "row" : "column", alignItems: "center", justifyContent: "center", gap: u * 5 }}>
      <div style=${{ display: "flex", flexDirection: "column", gap: u * 2.4, flex: L ? 1 : "0 0 auto", width: L ? "auto" : "100%" }}>
        <${Tape} u=${u} delay=${T}>WHERE YOUR PEOPLE ARE<//>
        <div style=${{ fontWeight: 800, fontSize: u * 8, lineHeight: 1.08 }}><${Words} text=${`Love from ${big} 🌍`} delay=${T + 6} per=${3} /></div>
        ${L ? list : null}
      </div>
      ${globe}
      ${L ? null : list}
    <//>
  <//>`;
}

function Met({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const o = s.met.oldest, nw = s.met.newest;
  const now = new Date().getFullYear();
  const yrs = s.met.years; // [{year, count}]
  const min = yrs[0].year, max = Math.max(yrs[yrs.length - 1].year, min + 1);
  const yearNum = interpolate(f, [T + 6, T + 50], [now, o.year], { ...CL, easing: Easing.out(Easing.cubic) });
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 8}px`, justifyContent: "center", gap: u * 3 }}>
      <${Tape} u=${u} delay=${T}>YOUR OLDEST FRIENDSHIP<//>
      <div style=${{ fontWeight: 800, fontSize: u * 6.5 }}><${Words} text="You've known someone since" delay=${T + 4} /></div>
      <div style=${{ fontFamily: F.m, fontSize: o.label ? u * (L ? 12 : 13) : u * (L ? 26 : 30), lineHeight: 1, textShadow: `${u * 1.2}px ${u * 1.2}px 0 ${C.white}` }}>${o.label || Math.round(yearNum)}</div>
      <div style=${{ display: "flex", alignItems: "center", gap: u * 2, opacity: sp(f, T + 50), fontSize: u * 4.6, fontWeight: 700 }}>
        <${Avatar} name=${o.who} color=${C.yellow} size=${u * 8} />
        <span><b>${o.who}</b>${o.how ? html`<br /><span style=${{ fontFamily: F.h, fontSize: u * 5.4 }}>“${o.how}”</span>` : null}</span>
      </div>
      <div style=${{ marginTop: u * 4, position: "relative", height: u * 12 }}>
        <div style=${{ position: "absolute", left: 0, right: 0, top: u * 4, height: u * 1.2, background: C.ink, borderRadius: u, transformOrigin: "left", transform: `scaleX(${interpolate(f, [T + 60, T + 90], [0, 1], CL)})` }} />
        ${yrs.map((y, i) => {
          const x = ((y.year - min) / (max - min)) * 100;
          const q = sp(f, T + 70 + i * 4);
          return html`<div key=${i} style=${{ position: "absolute", left: `calc(${x}% - ${u * 2.4}px)`, top: u * 2.2, width: u * 4.8, height: u * 4.8, borderRadius: "50%", background: PAL[i % 6], border: `${u * 0.4}px solid ${C.ink}`, transform: `scale(${q * (1 + Math.min(y.count, 4) * 0.12)})`, display: "grid", placeItems: "center", fontWeight: 800, fontSize: u * 2.2 }}>${y.count > 1 ? y.count : ""}</div>`;
        })}
        <div style=${{ position: "absolute", left: 0, top: u * 8.4, fontFamily: F.m, fontSize: u * 2.6 }}>${min}</div>
        <div style=${{ position: "absolute", right: 0, top: u * 8.4, fontFamily: F.m, fontSize: u * 2.6 }}>${max}</div>
      </div>
      ${nw && nw.who !== o.who ? html`<div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 5.4, opacity: sp(f, T + 100) }}>newest member of the fan club: ${nw.who} (${nw.year}) 🫶</div>` : null}
    <//>
  <//>`;
}

function People({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const max = s.rels[0][1];
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 8}px`, justifyContent: "center", gap: u * 2.6, maxWidth: L ? u * 150 : "none", margin: "0 auto" }}>
      <${Tape} u=${u} delay=${T}>WHO SHOWED UP<//>
      <div style=${{ fontWeight: 800, fontSize: u * 8, marginBottom: u * 2 }}><${Words} text="Your people, sorted" delay=${T + 4} /></div>
      ${s.rels.slice(0, 7).map(([k, v], i) => {
        const w = interpolate(f, [T + 14 + i * 5, T + 40 + i * 5], [0, v / max], { ...CL, easing: Easing.out(Easing.cubic) });
        return html`<div key=${k} style=${{ display: "grid", gridTemplateColumns: `${L ? u * 42 : u * 36}px 1fr ${u * 8}px`, alignItems: "center", gap: u * 2, fontWeight: 800, fontSize: u * 4 }}>
          <span>${k}</span>
          <span style=${{ height: u * 5.4, background: "rgba(255,255,255,.55)", border: `${u * 0.35}px solid ${C.ink}`, borderRadius: u * 4, overflow: "hidden" }}><span style=${{ display: "block", height: "100%", width: `${w * 100}%`, background: PAL[(i + 3) % 6], borderRight: w ? `${u * 0.35}px solid ${C.ink}` : "none" }} /></span>
          <span style=${{ fontFamily: F.m, fontSize: u * 4.4, textAlign: "right" }}>${v}</span>
        </div>`;
      })}
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 6, marginTop: u * 2, opacity: sp(f, T + 60) }}>biggest fan club: <span style=${{ background: C.white, padding: `0 ${u}px`, borderRadius: u }}>${s.rels[0][0]}</span> 🏆</div>
    <//>
  <//>`;
}

function Scores({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const R = 50, CIRC = 2 * Math.PI * R;
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 8}px`, justifyContent: "center", alignItems: "center", gap: u * 4 }}>
      <div style=${{ alignSelf: "flex-start" }}><${Tape} u=${u} delay=${T}>YOUR SCORES<//></div>
      <div style=${{ alignSelf: "flex-start", fontWeight: 800, fontSize: u * 8 }}><${Words} text="Out of 10, you're…" delay=${T + 4} /></div>
      <div style=${{ display: "grid", gridTemplateColumns: L ? "repeat(4, 1fr)" : "1fr 1fr", gap: `${u * 4}px ${u * 6}px`, width: "100%" }}>
        ${s.ratings.map((r, i) => {
          const p = interpolate(f, [T + 16 + i * 10, T + 56 + i * 10], [0, r.avg / 10], { ...CL, easing: Easing.out(Easing.cubic) });
          return html`<div key=${r.id} style=${{ display: "flex", flexDirection: "column", alignItems: "center", gap: u * 1.4, transform: `scale(${sp(f, T + 10 + i * 8)})` }}>
            <div style=${{ position: "relative", width: u * (L ? 30 : 34), height: u * (L ? 30 : 34) }}>
              <svg viewBox="0 0 120 120" style=${{ width: "100%", height: "100%", transform: "rotate(-90deg)", filter: `drop-shadow(${u * 0.8}px ${u * 0.8}px 0 ${C.ink})` }}>
                <circle cx="60" cy="60" r=${R} fill=${C.white} stroke="rgba(27,27,31,.14)" stroke-width="12" />
                <circle cx="60" cy="60" r=${R} fill="none" stroke=${PAL[(i + 1) % 6]} stroke-width="12" stroke-linecap="round" stroke-dasharray=${CIRC} stroke-dashoffset=${CIRC * (1 - p)} />
              </svg>
              <div style=${{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 800, fontSize: u * 8 }}>${(p * 10).toFixed(1)}</div>
            </div>
            <span style=${{ fontWeight: 800, fontSize: u * 4.4, textTransform: "capitalize" }}>${r.word}</span>
          </div>`;
        })}
      </div>
    <//>
  <//>`;
}

function Trait({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L, W } = useU();
  const stamp = sp(f, T + 50, { damping: 9, stiffness: 220 });
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px`, justifyContent: "center", alignItems: L ? "center" : "flex-start", gap: u * 3 }}>
      <${Tape} u=${u} delay=${T}>YOUR TOP TRAIT<//>
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 7.4 }}><${Words} text="officially certified…" delay=${T + 4} per=${4} /></div>
      <${Ransom} text=${s.top.word.toUpperCase()} delay=${T + 18} maxW=${W * (L ? 0.6 : 0.86)} maxSize=${u * 20} offset=${2} />
      <div style=${{ fontFamily: F.m, fontSize: u * 16, lineHeight: 1, textShadow: `${u}px ${u}px 0 ${C.white}` }}><${Count} to=${s.top.avg} dec=${1} delay=${T + 30} /><span style=${{ fontSize: u * 6 }}>/10</span></div>
    <//>
    <svg style=${{ position: "absolute", width: u * 32, height: u * 32, right: "7%", bottom: L ? "10%" : "8%", opacity: Math.min(1, stamp * 1.5), transform: `scale(${1 + (1 - stamp) * 2.5}) rotate(${-12 - (1 - stamp) * 30}deg)` }}><use href="#st-stamp" /></svg>
  <//>`;
}

function WordsScene({ s, bg }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const max = s.words[0][1];
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 8}px`, justifyContent: "center", gap: u * 3 }}>
      <${Tape} u=${u} delay=${T}>YOU IN 3 WORDS<//>
      <div style=${{ fontWeight: 800, fontSize: u * 8 }}><${Words} text="What they said about you" delay=${T + 4} /></div>
      <div style=${{ display: "flex", flexWrap: "wrap", gap: u * 2, alignItems: "center", maxWidth: L ? "80%" : "100%" }}>
        ${s.words.slice(0, 12).map(([w, c], i) => {
          const p = sp(f, T + 18 + i * 4, { damping: 11 });
          const ang = (i * 137.5) % 360;
          return html`<span key=${w} style=${{
            display: "inline-block", fontWeight: 800, fontSize: u * (3.6 + (c / max) * 5.4), lineHeight: 1.1,
            padding: `${u * 0.6}px ${u * 2}px ${u * 0.9}px`, background: PAL[i % 6], border: `${u * 0.35}px solid ${C.ink}`, borderRadius: u * 1.4,
            boxShadow: `${u * 0.5}px ${u * 0.5}px 0 ${C.ink}`,
            transform: `translate(${(1 - p) * Math.cos(ang) * u * 60}px, ${(1 - p) * Math.sin(ang) * u * 60}px) rotate(${[-5, 3, -2, 6, -4, 2][i % 6] * p}deg)`, opacity: Math.min(1, p * 1.5),
          }}>${w}${c > 1 ? html`<sup style=${{ fontFamily: F.m, fontSize: "0.42em", marginLeft: "0.25em" }}>×${c}</sup>` : null}</span>`;
        })}
      </div>
    <//>
  <//>`;
}

function Chapter({ title, sub, sticker, bg }) {
  const f = useCurrentFrame();
  const { u } = useU();
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: u * 8, gap: u * 3 }}>
      ${sticker ? html`<div style=${{ position: "relative", width: u * 22, height: u * 22 }}><${Sticker} id=${sticker} size=${u * 22} delay=${T} style=${{ left: 0, top: 0 }} /></div>` : null}
      <div style=${{ fontWeight: 800, fontSize: u * 13, lineHeight: 1, letterSpacing: "-0.03em" }}><${Words} text=${title} delay=${T + 4} per=${4} /></div>
      ${sub ? html`<div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 7 }}><${Words} text=${sub} delay=${T + 18} per=${3} /></div>` : null}
    <//>
  <//>`;
}

const qSize = (len, u) => u * (len < 50 ? 8.4 : len < 110 ? 7 : len < 200 ? 5.8 : len < 320 ? 4.9 : 4.2);
function Quote({ q, label, bg, by }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const text = q.text.length > 420 ? q.text.slice(0, 400).replace(/\s+\S*$/, "") + "…" : q.text;
  const author = sp(f, T + 10 + Math.min(40, text.split(" ").length));
  return html`<${Stage} bg=${bg}>
    <${AbsoluteFill} style=${{ padding: `${u * 15}px ${u * 7}px ${u * 10}px`, justifyContent: "center", alignItems: "center" }}>
      <div style=${{ width: "100%", maxWidth: L ? u * 140 : "100%", display: "flex", flexDirection: "column", gap: u * 3 }}>
        <${Tape} u=${u} delay=${T}>${label}<//>
        <div style=${{ fontFamily: F.s, fontSize: u * 22, lineHeight: 0.6, height: u * 9, opacity: sp(f, T + 2), color: bg === C.ink ? C.yellow : C.ink }}>“</div>
        <div style=${{ fontWeight: 700, fontSize: qSize(text.length, u), lineHeight: 1.22, letterSpacing: "-0.01em", textWrap: "pretty" }}><${Words} text=${text} delay=${T + 6} per=${text.length > 160 ? 0.5 : 1} /></div>
        <div style=${{ display: "flex", alignItems: "center", gap: u * 2, marginTop: u * 2, opacity: author, transform: `translateY(${(1 - author) * u * 4}px)` }}>
          <${Avatar} name=${by.anon ? "" : by.name} color=${bg === C.white ? C.yellow : C.white} size=${u * 8} />
          <div style=${{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style=${{ fontWeight: 800, fontSize: u * 4.2 }}>${by.label}</span>
            <span style=${{ fontWeight: 600, fontSize: u * 3.2, opacity: 0.8 }}>${by.meta}</span>
          </div>
        </div>
      </div>
    <//>
  <//>`;
}

function Letter({ q, by, i, total, name }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const text = q.text.length > 700 ? q.text.slice(0, 680).replace(/\s+\S*$/, "") + "… (the rest is on your board 💌)" : q.text;
  const fs = u * (text.length < 120 ? 5.6 : text.length < 300 ? 4.6 : text.length < 500 ? 3.8 : 3.2);
  const card = sp(f, T + 2, { damping: 14 });
  return html`<${Stage} bg=${C.lilac}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 6}px ${u * 9}px`, alignItems: "center", justifyContent: "center" }}>
      <div style=${{ width: "100%", maxWidth: L ? u * 120 : "100%", background: C.white, border: `${u * 0.4}px solid ${C.ink}`, borderRadius: u * 2, boxShadow: `${u * 1.2}px ${u * 1.2}px 0 ${C.ink}`, padding: `${u * 6}px ${u * 6}px ${u * 5}px`, transform: `translateY(${(1 - card) * u * 30}px) rotate(${(1 - card) * 6 - 1}deg)`, opacity: card, color: C.ink }}>
        <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: u * 2 }}>
          <span style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 7 }}>Dear ${name},</span>
          <span style=${{ fontFamily: F.m, fontSize: u * 2.2 }}>${i + 1}/${total}</span>
        </div>
        <div style=${{ fontWeight: 500, fontSize: fs, lineHeight: 1.45 }}><${Words} text=${text} delay=${T + 12} per=${text.length > 200 ? 0.4 : 1} /></div>
        <div style=${{ marginTop: u * 3, textAlign: "right", fontFamily: F.h, fontWeight: 700, fontSize: u * 6 }}>with love, ${by.label}</div>
        <div style=${{ textAlign: "right", fontWeight: 600, fontSize: u * 3, opacity: 0.7 }}>${by.meta}</div>
      </div>
    <//>
    <${Sticker} id="heart" size=${u * 12} delay=${T + 30} style=${{ right: "6%", bottom: "5%" }} />
  <//>`;
}

function Personality({ s }) {
  const f = useCurrentFrame();
  const { u, L } = useU();
  const card = sp(f, T + 20, { damping: 13 });
  return html`<${Stage} bg=${C.ink}>
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 22}px`, alignItems: "center", justifyContent: "center", gap: u * 3, color: C.white }}>
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 7 }}><${Words} text=${`your ${s.year} personality is…`} delay=${T + 2} per=${4} /></div>
      <div style=${{ position: "relative", width: L ? u * 120 : "100%", background: C.yellow, color: C.ink, border: `${u * 0.4}px solid ${C.white}`, borderRadius: u * 3, padding: u * 5, boxShadow: `${u * 1.4}px ${u * 1.4}px 0 ${C.pink}`, transform: `scale(${0.6 + card * 0.4}) rotate(${(1 - card) * -8}deg)`, opacity: card, overflow: "hidden" }}>
        <img src="assets/img/sticker-hero.webp" style=${{ position: "absolute", right: -u * 3, top: -u * 2, height: L ? "120%" : u * 42, transform: "rotate(6deg)", opacity: 0.95 }} />
        <div style=${{ position: "relative", maxWidth: "68%" }}>
          <div style=${{ fontWeight: 800, fontSize: u * (s.arch[0].length > 18 ? 7.4 : 8.6), lineHeight: 1.02, background: C.white, border: `${u * 0.35}px solid ${C.ink}`, borderRadius: u * 1.6, padding: `${u * 1.6}px ${u * 2.2}px`, boxShadow: `${u * 0.7}px ${u * 0.7}px 0 ${C.ink}`, transform: "rotate(-2deg)", display: "inline-block" }}>${s.arch[0]}</div>
          <div style=${{ fontWeight: 600, fontSize: u * 3.6, lineHeight: 1.35, marginTop: u * 2.4 }}>${s.arch[1]}</div>
        </div>
        <div style=${{ position: "relative", display: "grid", gridTemplateColumns: L ? "repeat(4,1fr)" : "1fr 1fr", gap: u * 1.6, marginTop: u * 4 }}>
          ${s.ratings.map((r, i) => html`<div key=${r.id} style=${{ background: PAL[(i + 1) % 6], border: `${u * 0.3}px solid ${C.ink}`, borderRadius: u * 1.6, padding: `${u * 1.4}px ${u * 2}px`, opacity: sp(f, T + 40 + i * 5) }}>
            <div style=${{ fontWeight: 800, fontSize: u * 6.4, lineHeight: 1 }}>${r.avg.toFixed(1)}</div>
            <div style=${{ fontWeight: 700, fontSize: u * 3, textTransform: "capitalize" }}>${r.word}</div></div>`)}
        </div>
        <div style=${{ position: "relative", display: "flex", gap: u * 1.4, flexWrap: "wrap", marginTop: u * 2.4 }}>
          ${s.words.slice(0, 3).map(([w], i) => html`<span key=${w} style=${{ background: C.white, border: `${u * 0.3}px solid ${C.ink}`, borderRadius: u, padding: `${u * 0.5}px ${u * 1.6}px`, fontWeight: 800, fontSize: u * 3.4, opacity: sp(f, T + 60 + i * 5) }}>${w}</span>`)}
        </div>
      </div>
    <//>
  <//>`;
}

function Outro({ s }) {
  const f = useCurrentFrame();
  const { u, L, W } = useU();
  const colW = W * (L ? 0.56 : 0.86);
  return html`<${Stage} bg=${C.pink}>
    ${Array.from({ length: 36 }, (_, k) => {
      const x = (k * 53) % 100, sp0 = 0.6 + ((k * 7) % 10) / 10, y = ((f * sp0 + k * 37) % 160) - 30;
      return html`<span key=${k} style=${{ position: "absolute", left: `${x}%`, top: `${y}%`, width: u * 1.6, height: u * 2.6, background: PAL[k % 6], border: `2px solid ${C.ink}`, transform: `rotate(${f * 4 + k * 20}deg)` }} />`;
    })}
    <${AbsoluteFill} style=${{ padding: `${u * 14}px ${u * 7}px ${u * 26}px`, justifyContent: "center", alignItems: L ? "center" : "flex-start", textAlign: L ? "center" : "left", gap: u * 2.4 }}>
      <${Ransom} text="Happy" delay=${T} maxW=${colW * 0.7} maxSize=${u * 15} offset=${3} />
      <${Ransom} text="Birthday" delay=${T + 16} maxW=${colW} maxSize=${u * 15} offset=${7} />
      <div style=${{ fontWeight: 800, fontSize: u * 5.6, lineHeight: 1.2, maxWidth: u * 110, marginTop: u * 2 }}><${Words} text=${`Here's to another year of God's faithfulness, ${s.name} ✦`} delay=${T + 44} per=${3} /></div>
      <div style=${{ fontFamily: F.h, fontWeight: 700, fontSize: u * 6.4 }}><${Words} text=${`a little gift from ${s.giftFrom} 🎁`} delay=${T + 80} per=${3} /></div>
    <//>
  <//>`;
}

const SCENES = { intro: Intro, turnout: Turnout, places: Places, met: Met, people: People, scores: Scores, trait: Trait, words: WordsScene, chapter: Chapter, quote: Quote, letter: Letter, personality: Personality, outro: Outro };

function Main({ scenes, audio, s }) {
  const { durationInFrames } = useVideoConfig();
  return html`<${AbsoluteFill} style=${{ background: C.ink }}>
    ${audio ? html`<${Audio} src=${audio} loop volume=${(fr) => interpolate(fr, [0, 45, durationInFrames - 60, durationInFrames], [0, 0.7, 0.7, 0], CL)} />` : null}
    ${scenes.map((sc, i) => html`<${Sequence} key=${i} from=${sc.from} durationInFrames=${sc.dur} layout="none">
      <${SCENES[sc.type]} ...${sc.props} s=${s} />
    <//>`)}
  <//>`;
}

// ---------- scene list from the data ----------
const secs = (x) => Math.round(x * FPS);
export function buildScenes(s, cfg) {
  const out = [];
  const push = (type, sec, props = {}, meta = {}) => out.push({ type, dur: secs(sec), props, ...meta });
  push("intro", 6.2);
  if (!s.n) {
    push("chapter", 5, { title: "No reviews yet 👀", sub: "share your link and check back soon", bg: C.yellow });
  } else {
    push("turnout", 6, { bg: C.yellow });
    if (s.places.length) push("places", 7, { bg: C.blue });
    if (s.met) push("met", 8.5, { bg: C.green });
    push("people", 6.5, { bg: C.pink });
    push("scores", 7.5, { bg: C.lilac });
    if (s.top) push("trait", 5.5, { bg: C.orange });
    if (s.words.length) push("words", 6.5, { bg: C.yellow });

    const quotes = (qid, label, bg, max) => {
      const list = s.highlights(qid, max);
      list.forEach((x, i) => push("quote", Math.min(14, Math.max(4.5, 2.6 + x.text.length / 15)), { q: { text: x.text }, by: x.by, bg, label: `${label}${list.length > 1 ? ` · ${i + 1}/${list.length}` : ""}` }));
      return list.length;
    };
    const chapter = (title, sub, sticker, bg) => push("chapter", 3, { title, sub, sticker, bg });

    if (s.count("strength") || s.count("love")) chapter("The good stuff 🥹", "what they love about you", "sparkle", C.pink);
    quotes("strength", "YOUR SUPERPOWER", C.white, 3);
    quotes("love", "WHAT THEY LOVE", C.yellow, 3);
    if (s.count("improve") || s.count("showup")) chapter("Okay… real talk 🫣", "they love you, so they're honest", null, C.ink);
    quotes("improve", "ROOM TO GROW", C.white, 2);
    quotes("showup", "SHOW UP FOR ME", C.blue, 2);
    if (s.count("single") || s.count("valueadd") || s.count("meal") || s.count("memory")) chapter("The spicy round", "brace yourself 🌶️", "flame", C.red);
    quotes("single", "WHY STILL SINGLE?? 👀", C.pink, 2);
    quotes("valueadd", "VALUE-ADD OR NAH?", C.green, 2);
    quotes("meal", "IF YOU WERE A MEAL 🍲", C.yellow, 3);
    quotes("memory", "MEMORY LANE", C.orange, 2);

    const notes = s.highlights("note", 8);
    if (notes.length) {
      chapter("Love letters & prayers", "read these slowly 💌", "letter", C.green);
      notes.forEach((x, i) => push("letter", Math.min(18, Math.max(6, 3 + x.text.length / 14)), { q: { text: x.text }, by: x.by, i, total: notes.length, name: s.name }));
    }
    push("personality", 9, {}, { share: true });
  }
  push("outro", 9, {}, { end: true });

  // Overlap scenes by T frames for the reveal transition.
  let t = 0;
  out.forEach((sc, i) => { sc.from = i ? t - T : 0; t = sc.from + sc.dur; });
  return { scenes: out, total: t };
}

// ---------- player + controls ----------
export function mountStory(host, { stats, cfg, audio, onBoard, onClose, onDownload }) {
  const { scenes, total } = buildScenes(stats, cfg);
  const starts = scenes.map((s) => s.from);
  host.innerHTML = `
    <div class="ws-player"></div>
    <div class="ws-ui">
      <div class="ws-bars">${scenes.map(() => "<span><i></i></span>").join("")}</div>
      <div class="ws-top">
        <span class="ws-brand"><span class="brand-tile">W</span>${stats.name} Wrapped</span>
        <span class="ws-ctrls">
          <button class="icon-btn" type="button" data-ws="mute" aria-label="Mute">🔊</button>
          <button class="icon-btn" type="button" data-ws="pause" aria-label="Pause">❚❚</button>
          <button class="icon-btn" type="button" data-ws="board" aria-label="Open board">📒</button>
          <button class="icon-btn" type="button" data-ws="close" aria-label="Close">×</button>
        </span>
      </div>
      <div class="ws-tap" aria-hidden="true"></div>
      <div class="ws-ctx ws-share" hidden><button class="btn btn-primary" type="button" data-ws="save">Save my card ⇣</button></div>
      <div class="ws-ctx ws-end" hidden>
        <button class="btn" type="button" data-ws="replay">↺ Replay</button>
        <button class="btn btn-yellow" type="button" data-ws="board">📒 Open my board</button>
        <a class="ws-own" href="${cfg.requestUrl}" target="_blank" rel="noopener">get your own Wrapped → ${cfg.brand}</a>
      </div>
      <button class="ws-start" type="button" data-ws="start">
        <span class="ws-start-card"><svg class="ws-start-icon"><use href="#st-play"/></svg>
          <b>Tap to play</b><span class="hand">turn your sound up 🎧</span></span>
      </button>
    </div>`;

  const ui = host.querySelector(".ws-ui");
  const bars = [...host.querySelectorAll(".ws-bars i")];
  const playerEl = host.querySelector(".ws-player");
  const ref = React.createRef();
  const root = createRoot(playerEl);
  let dims = null, lastFrame = 0, started = false, muted = false;

  const sceneAt = (fr) => { let i = 0; for (let k = 0; k < starts.length; k++) if (starts[k] <= fr) i = k; return i; };
  const sizeFor = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    return w >= h ? { cw: Math.min(2560, Math.round((1080 * w) / h)), ch: 1080 } : { cw: 1080, ch: Math.min(2560, Math.round((1080 * h) / w)) };
  };
  function render(seekTo) {
    dims = sizeFor();
    root.render(html`<${Player} ref=${ref} component=${Main} inputProps=${{ scenes, audio, s: stats }} durationInFrames=${total} fps=${FPS}
      compositionWidth=${dims.cw} compositionHeight=${dims.ch} style=${{ width: "100%", height: "100%" }}
      controls=${false} clickToPlay=${false} doubleClickToFullscreen=${false} spaceKeyToPlayOrPause=${false} loop=${false} initiallyMuted=${muted} />`);
    if (seekTo != null) requestAnimationFrame(() => { ref.current?.seekTo(seekTo); if (started) ref.current?.play(); });
  }
  render();

  // Re-fit when the screen shape changes (rotate phone, resize window).
  let rt;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const d = sizeFor();
      if (!dims || Math.abs(d.cw / d.ch - dims.cw / dims.ch) > 0.04) render(ref.current?.getCurrentFrame() ?? lastFrame);
    }, 200);
  };
  addEventListener("resize", onResize);

  // UI sync loop (cheap, reads the current frame).
  let raf;
  const tick = () => {
    const p = ref.current;
    if (p) {
      const fr = p.getCurrentFrame();
      lastFrame = fr;
      const i = sceneAt(fr);
      bars.forEach((b, k) => {
        const sc = scenes[k];
        b.style.width = k < i ? "100%" : k > i ? "0%" : `${Math.min(100, ((fr - sc.from) / sc.dur) * 100)}%`;
      });
      ui.querySelector(".ws-share").hidden = !scenes[i].share || fr - starts[i] < 50;
      ui.querySelector(".ws-end").hidden = !scenes[i].end || fr - starts[i] < 110;
      ui.querySelector('[data-ws="pause"]').textContent = p.isPlaying() ? "❚❚" : "▶";
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const go = (i) => {
    const p = ref.current; if (!p) return;
    if (i < 0) i = 0;
    if (i >= scenes.length) return onBoard();
    p.seekTo(i === 0 ? 0 : starts[i]);
    if (started) p.play();
  };
  const togglePause = (force) => {
    const p = ref.current; if (!p || !started) return;
    const pause = force ?? p.isPlaying();
    pause ? p.pause() : p.play();
  };

  // Tap left/right, hold to pause, swipe.
  const tap = ui.querySelector(".ws-tap");
  let down = null, holdT = null, held = false;
  tap.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY }; held = false;
    holdT = setTimeout(() => { held = true; togglePause(true); }, 260);
  });
  tap.addEventListener("pointerup", (e) => {
    clearTimeout(holdT);
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y, x0 = down.x; down = null;
    if (held) return togglePause(false);
    const i = sceneAt(ref.current?.getCurrentFrame() ?? 0);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) return go(i + (dx < 0 ? 1 : -1));
    if (Math.abs(dy) > 60) return;
    const r = tap.getBoundingClientRect();
    go(i + (x0 - r.left < r.width * 0.3 ? -1 : 1));
  });
  tap.addEventListener("pointercancel", () => { clearTimeout(holdT); down = null; });

  const onKey = (e) => {
    if (!host.isConnected || host.closest("[hidden]")) return;
    const i = sceneAt(ref.current?.getCurrentFrame() ?? 0);
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === " ") { e.preventDefault(); started ? togglePause() : start(e); }
    else if (e.key === "Escape") onClose();
  };
  addEventListener("keydown", onKey);

  function start(e) {
    started = true;
    ui.querySelector(".ws-start").hidden = true;
    ref.current?.play(e);
    if (!muted) ref.current?.unmute();
  }

  ui.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ws]");
    if (!b) return;
    const a = b.dataset.ws, p = ref.current;
    if (a === "start") start(e);
    else if (a === "pause") togglePause();
    else if (a === "mute") { muted = !muted; muted ? p?.mute() : p?.unmute(); b.textContent = muted ? "🔇" : "🔊"; }
    else if (a === "board") onBoard();
    else if (a === "close") onClose();
    else if (a === "replay") go(0);
    else if (a === "save") onDownload(b);
  });

  return {
    destroy() {
      cancelAnimationFrame(raf); clearTimeout(rt);
      removeEventListener("resize", onResize); removeEventListener("keydown", onKey);
      try { ref.current?.pause(); } catch {}
      root.unmount(); host.innerHTML = "";
    },
  };
}
