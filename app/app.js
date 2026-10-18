/* French Study App: plain JS, no build step, works from file://.
 * Sections: storage · helpers · TTS · units · SRS flashcards · conjugation ·
 * gender · numbers · song workshop · today · boot
 */
"use strict";

// ───────────────────────── storage ─────────────────────────
// localStorage can throw (private mode, blocked storage): fall back to memory.
const PREFIX = "llc.fr.";
const memoryStore = {};
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in memoryStore ? memoryStore[key] : fallback;
    }
  },
  set(key, value) {
    memoryStore[key] = value;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  },
  exportAll() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(PREFIX)) out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k));
      }
    } catch (e) { Object.assign(out, memoryStore); }
    return out;
  },
};

const DEFAULT_SETTINGS = { unit: 0, newPerDay: 10, fr2en: true, en2fr: true, autoSpeak: true, rate: 0.9 };
const settings = Object.assign({}, DEFAULT_SETTINGS, store.get("settings", {}));
const saveSettings = () => store.set("settings", settings);

// ───────────────────────── helpers ─────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const stripAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
// Normalise an answer for comparison: case, curly quotes, spacing, punctuation.
function norm(s) {
  return s.toLowerCase().replace(/[’`]/g, "'").replace(/[!?.,;:…]/g, "").replace(/\s+/g, " ").trim();
}
// Compare typed vs expected: "ok", "accent" (right except accents) or "no".
function compare(typed, expectedList) {
  const t = norm(typed);
  if (expectedList.some((e) => norm(e) === t)) return "ok";
  if (expectedList.some((e) => stripAccents(norm(e)) === stripAccents(t))) return "accent";
  return "no";
}
function markStudied() {
  const days = store.get("days", []);
  const k = todayKey();
  if (!days.includes(k)) { days.push(k); store.set("days", days); }
}

// ───────────────────────── TTS ─────────────────────────
const tts = {
  voices: [],
  init() {
    if (!("speechSynthesis" in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr")); };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  // Turn card text like "beau / belle" or "enchanté(e)" into something speakable.
  clean(text) {
    return text.replace(/\(.*?\)/g, "").replace(/[…]/g, "").replace(/\s*\/\s*/g, ", ").replace(/\+/g, "").trim();
  },
  speak(text, lang = "fr-FR") {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.clean(text));
    u.lang = lang;
    const voice = this.voices.find((v) => v.lang.replace("_", "-") === lang) || this.voices.find((v) => v.lang.startsWith("fr"));
    if (voice) u.voice = voice;
    u.rate = settings.rate;
    speechSynthesis.speak(u);
  },
};
const speakBtn = (text, lang) => `<button class="small speak" data-say="${escapeHtml(text)}" data-lang="${lang || "fr-FR"}" title="Listen">🔊</button>`;
document.addEventListener("click", (e) => {
  const b = e.target.closest("button.speak");
  if (b) tts.speak(b.dataset.say, b.dataset.lang);
});

// ───────────────────────── units ─────────────────────────
const UNITS = [
  [0, "The sound system", "units/unit-00-sounds.md"],
  [1, "Bonjour! Who are you? (être)", "units/unit-01-etre.md"],
  [2, "Things and people (gender & articles)", "units/unit-02-gender-articles.md"],
  [3, "Having and describing (avoir + adjectives)", "units/unit-03-avoir-adjectives.md"],
  [4, "Doing things (-ER verbs)", "units/unit-04-er-verbs.md"],
  [5, "Saying no, asking why"], [6, "Mine, yours, theirs"], [7, "Going places"],
  [8, "Numbers, time and dates"], [9, "Want, can, must"], [10, "Food and quantities"],
  [11, "Tell me what to do"], [12, "Near future and near past"], [13, "A1 review + milestone"],
  [14, "Passé composé (avoir)"], [15, "Passé composé (être)"], [16, "Daily routine"],
  [17, "Object pronouns"], [18, "Imparfait"], [19, "Telling a story"], [20, "y and en"],
  [21, "Comparisons"], [22, "Futur simple"], [23, "Relative pronouns"], [24, "Conditionnel"],
  [25, "Subjonctif (intro)"], [26, "A2 milestone"],
];
// Links to the course's Markdown pages. GitHub Pages renders .md as .html
// (and README.md as the folder index), so adjust links when hosted there.
function docLink(path) {
  if (!location.hostname.endsWith("github.io")) return path;
  return path.replace(/README\.md$/, "").replace(/\.md$/, ".html");
}
const unitLink = (u) => docLink("../french/" + (UNITS[u][2] || "README.md"));

// ───────────────────────── SRS flashcards ─────────────────────────
// SM-2-style scheduler (same family as Anki's classic algorithm).
// Ratings: 0 Again · 1 Hard · 2 Good · 3 Easy
function schedule(prev, rating, now = Date.now()) {
  const s = Object.assign({ ease: 2.5, interval: 0, reps: 0, lapses: 0 }, prev || {});
  if (rating === 0) {
    s.reps = 0; s.lapses += 1; s.interval = 0;
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.due = now + 1 * MIN;
    return s;
  }
  if (rating === 1) {
    if (s.reps === 0) { s.due = now + 10 * MIN; return s; }
    s.interval = Math.max(1, s.interval * 1.2);
    s.ease = Math.max(1.3, s.ease - 0.15);
  } else if (rating === 2) {
    s.interval = s.reps === 0 ? 1 : s.reps === 1 ? 3 : s.interval * s.ease;
  } else {
    s.interval = s.reps === 0 ? 4 : Math.max(s.interval + 1, s.interval * s.ease * 1.3);
    s.ease += 0.15;
  }
  s.reps += 1;
  s.interval = Math.round(s.interval);
  // Due a few hours early so "tomorrow" cards are ready at any time tomorrow.
  s.due = now + s.interval * DAY - 4 * 60 * MIN;
  return s;
}
function formatDelay(ms) {
  if (ms < 60 * MIN) return Math.max(1, Math.round(ms / MIN)) + " min";
  const days = Math.round((ms + 4 * 60 * MIN) / DAY);
  if (days < 30) return days + " d";
  if (days < 365) return Math.round(days / 30) + " mo";
  return (days / 365).toFixed(1) + " y";
}

function allEntries() {
  const list = [];
  Object.keys(window.FR_VOCAB).forEach((u) => {
    window.FR_VOCAB[u].forEach(([fr, en, gender, note]) => list.push({ fr, en, gender, note, unit: Number(u) }));
  });
  store.get("custom", []).forEach(([fr, en, gender, note]) => list.push({ fr, en, gender: gender || null, note: note || "", unit: "custom" }));
  return list;
}
function activeCards() {
  const cards = [];
  allEntries().forEach((e) => {
    if (e.unit !== "custom" && e.unit > settings.unit) return;
    if (settings.fr2en) cards.push(Object.assign({ id: e.fr + "|fr2en", dir: "fr2en" }, e));
    if (settings.en2fr) cards.push(Object.assign({ id: e.fr + "|en2fr", dir: "en2fr" }, e));
  });
  return cards;
}
// Recognition before production: an EN→FR card is only introduced once its
// FR→EN sibling has graduated (been answered correctly on an earlier day).
function isNewEligible(c, srs) {
  if (srs[c.id]) return false;
  if (c.dir === "en2fr" && settings.fr2en) {
    const sibling = srs[c.fr + "|fr2en"];
    return !!sibling && sibling.interval >= 1;
  }
  return true;
}
function cardCounts() {
  const srs = store.get("srs", {});
  const now = Date.now();
  const cards = activeCards();
  const due = cards.filter((c) => srs[c.id] && srs[c.id].due <= now).length;
  const eligible = cards.filter((c) => isNewEligible(c, srs)).length;
  const seen = cards.filter((c) => srs[c.id]).length;
  const newToday = store.get("newLog", {})[todayKey()] || 0;
  const newLeft = Math.min(eligible, Math.max(0, settings.newPerDay - newToday));
  return { due, newLeft, total: cards.length, seen };
}
function buildQueue() {
  const srs = store.get("srs", {});
  const now = Date.now();
  const cards = activeCards();
  const due = shuffle(cards.filter((c) => srs[c.id] && srs[c.id].due <= now));
  const newToday = store.get("newLog", {})[todayKey()] || 0;
  // New cards in course order.
  const fresh = cards.filter((c) => isNewEligible(c, srs)).slice(0, Math.max(0, settings.newPerDay - newToday));
  // Interleave: one new card after every two reviews.
  const q = [];
  while (due.length || fresh.length) {
    if (due.length) q.push(due.shift());
    if (due.length) q.push(due.shift());
    if (fresh.length) q.push(fresh.shift());
  }
  return q;
}

const fc = { queue: [], current: null, revealed: false, done: 0 };

function renderCards() {
  const root = $("#tab-cards");
  const c = cardCounts();
  root.innerHTML = `
    <div class="panel">
      <div class="row" style="justify-content:space-between">
        <div><b>Unit ${settings.unit}</b> deck · <span class="muted">${c.seen}/${c.total} cards seen</span></div>
        <div class="row">
          <span class="tag">${c.due} due</span><span class="tag">${c.newLeft} new</span>
          <button class="small" id="fc-start">${fc.queue.length ? "Restart" : "Start session"}</button>
        </div>
      </div>
    </div>
    <div class="panel card" id="fc-card"></div>
    <details class="panel">
      <summary><b>Deck settings & import</b></summary>
      <div class="row" style="margin-top:12px">
        <label><input type="checkbox" id="fc-fr2en" ${settings.fr2en ? "checked" : ""}> FR → EN (recognise)</label>
        <label><input type="checkbox" id="fc-en2fr" ${settings.en2fr ? "checked" : ""}> EN → FR (produce)</label>
        <label><input type="checkbox" id="fc-auto" ${settings.autoSpeak ? "checked" : ""}> Auto-speak French</label>
        <label>New cards/day <input type="number" id="fc-new" min="0" max="50" value="${settings.newPerDay}" style="width:70px"></label>
      </div>
      <h3>Import cards (JSON from the Flashcard Maker prompt)</h3>
      <p class="muted">Format: <code>[{"fr":"la chanson","en":"song","gender":"f","note":"..."}]</code>. Imported cards are always active.</p>
      <textarea id="fc-import" placeholder='[{"fr": "avoir la flemme", "en": "to not be bothered", "gender": null, "note": "colloquial"}]'></textarea>
      <div class="row"><button id="fc-import-btn">Import</button><span id="fc-import-msg" class="muted"></span></div>
    </details>`;

  $("#fc-start").onclick = () => { fc.queue = buildQueue(); fc.done = 0; nextCard(); };
  $("#fc-fr2en").onchange = (e) => { settings.fr2en = e.target.checked; saveSettings(); renderCards(); };
  $("#fc-en2fr").onchange = (e) => { settings.en2fr = e.target.checked; saveSettings(); renderCards(); };
  $("#fc-auto").onchange = (e) => { settings.autoSpeak = e.target.checked; saveSettings(); };
  $("#fc-new").onchange = (e) => { settings.newPerDay = Math.max(0, Number(e.target.value) || 0); saveSettings(); renderCards(); };
  $("#fc-import-btn").onclick = importCards;

  if (!fc.queue.length && !fc.current) {
    fc.queue = buildQueue();
    fc.done = 0;
  }
  if (fc.current) drawCard(); else nextCard();
}

function importCards() {
  const msg = $("#fc-import-msg");
  try {
    const data = JSON.parse($("#fc-import").value);
    if (!Array.isArray(data)) throw new Error("Expected a JSON array");
    const custom = store.get("custom", []);
    const known = new Set(allEntries().map((e) => e.fr));
    let added = 0;
    data.forEach((d) => {
      if (d && d.fr && d.en && !known.has(d.fr)) {
        custom.push([String(d.fr), String(d.en), d.gender === "m" || d.gender === "f" ? d.gender : null, d.note ? String(d.note) : ""]);
        known.add(d.fr);
        added++;
      }
    });
    store.set("custom", custom);
    msg.textContent = `Added ${added} card(s).`;
    fc.queue = []; fc.current = null;
    setTimeout(renderCards, 800);
  } catch (e) {
    msg.textContent = "Couldn't parse: " + e.message;
  }
}

function nextCard() {
  fc.current = fc.queue.shift() || null;
  fc.revealed = false;
  drawCard();
}

function drawCard() {
  const box = $("#fc-card");
  if (!box) return;
  const c = fc.current;
  if (!c) {
    const counts = cardCounts();
    if (fc.done > 0) { markStudied(); tickChecklist("flash"); }
    box.innerHTML = fc.done > 0
      ? `<div class="prompt">🎉 Session done!</div><p>${fc.done} reviews. Minimum viable day ✅</p>
         <p class="muted">Next: the unit's rule drill, or the song for this unit.</p>`
      : counts.total === 0
        ? `<p>No cards active. Turn on a direction in Deck settings.</p>`
        : `<div class="prompt">Nothing due 🌿</div><p class="muted">Come back later, or raise "new cards/day", or move to the next unit on the Today tab.</p>`;
    return;
  }
  const isFr = c.dir === "fr2en";
  const promptText = isFr ? c.fr : c.en;
  const hint = !isFr && c.gender ? `<span class="tag">noun: include the article</span>` : "";
  const unitTag = `<span class="tag">${c.unit === "custom" ? "custom" : "unit " + c.unit}</span>`;
  box.innerHTML = `
    <div class="row">${unitTag} <span class="muted">${isFr ? "FR → EN" : "EN → FR"}</span> <span class="muted">· ${fc.queue.length} left</span></div>
    <div class="prompt">${escapeHtml(promptText)} ${isFr ? speakBtn(c.fr) : ""}</div>
    ${hint}
    <input type="text" id="fc-typed" placeholder="Type your answer (optional), then Enter" autocomplete="off" autocapitalize="off" spellcheck="false">
    <button class="primary" id="fc-reveal">Show answer (Enter)</button>
    <div id="fc-back"></div>`;
  const typed = $("#fc-typed");
  if (isFr && settings.autoSpeak) tts.speak(c.fr);
  typed.focus();
  typed.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); reveal(); } });
  $("#fc-reveal").onclick = reveal;
}

function reveal() {
  const c = fc.current;
  if (!c || fc.revealed) return;
  fc.revealed = true;
  const isFr = c.dir === "fr2en";
  const typedVal = $("#fc-typed").value;
  $("#fc-typed").blur();
  let fb = "";
  if (typedVal.trim()) {
    const expected = isFr ? c.en.split(/[,/]/).map((s) => s.trim()) : [c.fr, c.fr.replace(/\(.*?\)/g, "")].concat(c.fr.split("/").map((s) => s.trim()));
    const r = compare(typedVal, expected);
    fb = r === "ok" ? `<div class="feedback ok">✅ Matches</div>`
      : r === "accent" ? `<div class="feedback warn">Almost: check the accents</div>`
      : `<div class="feedback no">You typed: ${escapeHtml(typedVal)}. Compare carefully (meaning may still be right)</div>`;
  }
  const prev = store.get("srs", {})[c.id];
  const now = Date.now();
  const labels = ["Again", "Hard", "Good", "Easy"];
  const cls = ["again", "", "good", ""];
  $("#fc-reveal").remove();
  $("#fc-back").innerHTML = `
    <div class="answer">${escapeHtml(isFr ? c.en : c.fr)} ${!isFr ? speakBtn(c.fr) : ""}</div>
    ${c.note ? `<div class="note">${escapeHtml(c.note)}</div>` : ""}
    ${fb}
    <p class="muted">How well did you know it? (keys 1–4)</p>
    <div class="rate">${labels.map((l, i) => `<button class="${cls[i]}" data-r="${i}">${l}<small>${formatDelay(schedule(prev, i, now).due - now)}</small></button>`).join("")}</div>`;
  $$("#fc-back .rate button").forEach((b) => (b.onclick = () => rate(Number(b.dataset.r))));
  if (!isFr && settings.autoSpeak) tts.speak(c.fr);
}

function rate(r) {
  const c = fc.current;
  if (!c || !fc.revealed) return;
  const srs = store.get("srs", {});
  const now = Date.now();
  if (!srs[c.id]) {
    const log = store.get("newLog", {});
    log[todayKey()] = (log[todayKey()] || 0) + 1;
    store.set("newLog", log);
  }
  srs[c.id] = schedule(srs[c.id], r, now);
  store.set("srs", srs);
  fc.done++;
  // Short relearning steps come back in this same session.
  if (srs[c.id].due - now < 20 * MIN) fc.queue.push(c);
  nextCard();
}

document.addEventListener("keydown", (e) => {
  if (!$("#tab-cards").classList.contains("active")) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (fc.revealed && ["1", "2", "3", "4"].includes(e.key)) rate(Number(e.key) - 1);
  else if (!fc.revealed && (e.key === " " || e.key === "Enter") && fc.current) { e.preventDefault(); reveal(); }
});

// ───────────────────────── conjugation ─────────────────────────
const PERSONS = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"];
const AVOIR = ["ai", "as", "a", "avons", "avez", "ont"];
const ETRE = ["suis", "es", "est", "sommes", "êtes", "sont"];
const ALLER = ["vais", "vas", "va", "allons", "allez", "vont"];

// Returns { answers: [accepted...], display: "canonical form" }
function conjugate(v, tense, p) {
  if (tense === "present") return { answers: [v.present[p]], display: v.present[p] };
  if (tense === "futurProche") {
    const f = `${ALLER[p]} ${v.inf}`;
    return { answers: [f], display: f };
  }
  if (tense === "passeCompose") {
    if (v.aux === "avoir") { const f = `${AVOIR[p]} ${v.pp}`; return { answers: [f], display: f }; }
    const pp = v.pp;
    // Agreement with the subject: which endings are possible for each person.
    const variants = [[pp, pp + "e"], [pp, pp + "e"], [pp, pp + "e", pp + "s", pp + "es"], [pp + "s", pp + "es"], [pp, pp + "e", pp + "s", pp + "es"], [pp + "s", pp + "es"]][p];
    const disp = ["(e)", "(e)", "(e)", "(e)s", "(e)(s)", "(e)s"][p];
    return { answers: variants.map((x) => `${ETRE[p]} ${x}`), display: `${ETRE[p]} ${pp}${disp}` };
  }
  if (tense === "imparfait") {
    const endings = ["ais", "ais", "ait", "ions", "iez", "aient"];
    let stem = v.imp || v.present[3].replace(/ons$/, "");
    const e = endings[p];
    // mangeons → mangeais but mangions; commençons → commençais but commencions
    if (e[0] === "i" && stem.endsWith("ge")) stem = stem.slice(0, -1);
    if (e[0] === "i" && stem.endsWith("ç")) stem = stem.slice(0, -1) + "c";
    const f = stem + e;
    return { answers: [f], display: f };
  }
  if (tense === "futurSimple") {
    const endings = ["ai", "as", "a", "ons", "ez", "ont"];
    const answers = v.fut.map((s) => s + endings[p]);
    return { answers, display: answers[0] };
  }
  throw new Error("Unknown tense " + tense);
}
function subjectFor(p, form) {
  return p === 0 && /^[aeiouyéèêh]/i.test(form) ? "j'" : PERSONS[p];
}
// Remove a pronoun the learner may have typed in front of the verb.
const stripPronoun = (s) => norm(s).replace(/^(j'|je |tu |il |elle |on |nous |vous |ils |elles )/, "");

const conj = {
  verbs: store.get("conjVerbs", null),
  tenses: store.get("conjTenses", null),
  q: null, checked: false, right: 0, total: 0,
};

function renderConj() {
  const root = $("#tab-conj");
  const verbs = window.FR_VERBS;
  if (!conj.verbs) conj.verbs = verbs.filter((v) => v.unit <= Math.max(1, settings.unit)).map((v) => v.inf);
  if (!conj.tenses) conj.tenses = window.FR_TENSES.filter((t) => t.unit <= Math.max(1, settings.unit)).map((t) => t.id);
  const tenseNames = window.FR_TENSES.filter((t) => conj.tenses.includes(t.id)).map((t) => t.label).join(", ") || "none";
  root.innerHTML = `
    <div class="panel">
      <h2>Conjugation drill</h2>
      <p class="muted">Type only the verb form (e.g. <i>suis</i>, <i>ai parlé</i>). Mixing verbs and tenses is harder but works better: that's <b>interleaving</b>.</p>
    </div>
    <div class="panel card" id="conj-card"></div>
    <details class="panel" id="conj-opts">
      <summary><b>Choose verbs & tenses</b> <span class="muted">(${conj.verbs.length} verbs · ${escapeHtml(tenseNames)})</span></summary>
      <h3>Tenses</h3>
      <div class="picks" id="conj-tenses">${window.FR_TENSES.map((t) => `
        <label class="${t.unit > settings.unit ? "locked" : ""}"><input type="checkbox" value="${t.id}" ${conj.tenses.includes(t.id) ? "checked" : ""}> ${t.label}${t.unit > settings.unit ? ` <small>(unit ${t.unit})</small>` : ""}</label>`).join("")}
      </div>
      <h3>Verbs <button class="small" id="conj-unit">Select verbs up to my unit</button> <button class="small" id="conj-all">All</button></h3>
      <div class="picks" id="conj-verbs">${verbs.map((v) => `
        <label class="${v.unit > settings.unit ? "locked" : ""}"><input type="checkbox" value="${v.inf}" ${conj.verbs.includes(v.inf) ? "checked" : ""}> ${v.inf}</label>`).join("")}
      </div>
    </details>`;
  $$("#conj-tenses input").forEach((i) => (i.onchange = () => { conj.tenses = $$("#conj-tenses input:checked").map((x) => x.value); store.set("conjTenses", conj.tenses); newConjQ(); }));
  $$("#conj-verbs input").forEach((i) => (i.onchange = () => { conj.verbs = $$("#conj-verbs input:checked").map((x) => x.value); store.set("conjVerbs", conj.verbs); newConjQ(); }));
  $("#conj-unit").onclick = () => { conj.verbs = verbs.filter((v) => v.unit <= Math.max(1, settings.unit)).map((v) => v.inf); store.set("conjVerbs", conj.verbs); renderConj(); $("#conj-opts").open = true; };
  $("#conj-all").onclick = () => { conj.verbs = verbs.map((v) => v.inf); store.set("conjVerbs", conj.verbs); renderConj(); $("#conj-opts").open = true; };
  newConjQ();
}

function newConjQ() {
  const box = $("#conj-card");
  const pool = window.FR_VERBS.filter((v) => conj.verbs.includes(v.inf));
  if (!pool.length || !conj.tenses.length) {
    box.innerHTML = `<p>Pick at least one verb and one tense.</p>`;
    return;
  }
  const v = pick(pool);
  const tense = pick(conj.tenses);
  const p = Math.floor(Math.random() * 6);
  const res = conjugate(v, tense, p);
  conj.q = { v, tense, p, res };
  conj.checked = false;
  const tLabel = window.FR_TENSES.find((t) => t.id === tense).label;
  const acc = conj.total ? Math.round((100 * conj.right) / conj.total) : 0;
  box.innerHTML = `
    <div class="row"><span class="tag">${tLabel}</span><span class="muted">${v.inf}: ${v.en}</span>
      <span class="muted">· score ${conj.right}/${conj.total}${conj.total ? ` (${acc}%)` : ""}</span></div>
    <div class="prompt">${subjectFor(p, res.display)} ___ <small class="muted">(${v.inf})</small></div>
    <input type="text" id="conj-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="verb form, then Enter">
    <div id="conj-fb"></div>`;
  const input = $("#conj-in");
  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (conj.checked) newConjQ(); else checkConj();
  });
}

function checkConj() {
  const { res, p, v } = conj.q;
  const typed = stripPronoun($("#conj-in").value);
  if (!typed) return;
  conj.checked = true;
  const r = compare(typed, res.answers);
  conj.total++;
  if (r === "ok") conj.right++;
  const full = `${subjectFor(p, res.display)}${subjectFor(p, res.display) === "j'" ? "" : " "}${res.display}`;
  $("#conj-fb").innerHTML = `
    <div class="feedback ${r === "ok" ? "ok" : r === "accent" ? "warn" : "no"}">
      ${r === "ok" ? "✅ Correct" : r === "accent" ? "Almost: accent missing" : "❌ Not quite"}: <b>${escapeHtml(full)}</b> ${speakBtn(full.replace(/\(e\)|\(s\)/g, ""))}
    </div>
    ${conj.q.tense === "passeCompose" && v.aux === "être" ? `<p class="muted">${v.inf} uses <b>être</b> → the participle agrees with the subject.</p>` : ""}
    <p class="muted">Enter for next</p>`;
  if (r === "ok") markStudied();
}

// ───────────────────────── gender ─────────────────────────
const GENDER_RULES = [
  // [ending, gender] — checked in order; longer endings first
  ["tion", "f"], ["sion", "f"], ["ette", "f"], ["ence", "f"], ["ance", "f"], ["esse", "f"], ["ude", "f"], ["ade", "f"],
  ["ure", "f"], ["ée", "f"], ["té", "f"], ["ie", "f"],
  ["isme", "m"], ["ment", "m"], ["age", "m"], ["eau", "m"], ["oir", "m"], ["ail", "m"], ["eil", "m"], ["et", "m"], ["al", "m"],
];
function stripArticle(fr) {
  return fr.replace(/^(le |la |les |l'|un |une )/i, "");
}
function genderHint(word, gender) {
  const w = word.split(" ")[0].toLowerCase();
  const rule = GENDER_RULES.find(([end]) => w.endsWith(end));
  if (!rule) return "No reliable ending rule: memorise it with its article.";
  const [end, g] = rule;
  const name = (x) => (x === "m" ? "masculine" : "feminine");
  return g === gender
    ? `Rule: words ending in <b>-${end}</b> are usually ${name(g)} ✓`
    : `<b>Exception!</b> Words ending in -${end} are usually ${name(g)}, but this one is ${name(gender)}.`;
}
const gen = { pool: [], cur: null, answered: false, right: 0, total: 0, allUnits: false };

function renderGender() {
  const root = $("#tab-gender");
  gen.pool = allEntries().filter((e) => e.gender && !e.fr.startsWith("les ") && (gen.allUnits || e.unit === "custom" || e.unit <= settings.unit));
  root.innerHTML = `
    <div class="panel">
      <h2>Masculine or feminine?</h2>
      <p class="muted">Keys: <b>M</b> / ← for masculine, <b>F</b> / → for feminine. Read the rule hint after each answer, especially when you're wrong.</p>
      <label><input type="checkbox" id="gen-all" ${gen.allUnits ? "checked" : ""}> Include nouns from all units (${allEntries().filter((e) => e.gender).length})</label>
    </div>
    <div class="panel" id="gen-card"></div>`;
  $("#gen-all").onchange = (e) => { gen.allUnits = e.target.checked; renderGender(); };
  nextGender();
}
function nextGender() {
  const box = $("#gen-card");
  if (!gen.pool.length) {
    box.innerHTML = `<p>No nouns yet at your unit. Nouns start in Unit 0 and 2. Tick "all units" to practise anyway.</p>`;
    return;
  }
  gen.cur = pick(gen.pool);
  gen.answered = false;
  const word = stripArticle(gen.cur.fr);
  const acc = gen.total ? ` (${Math.round((100 * gen.right) / gen.total)}%)` : "";
  box.innerHTML = `
    <div class="row muted">score ${gen.right}/${gen.total}${acc}</div>
    <div class="gender-word">${escapeHtml(word)} ${speakBtn(word)}</div>
    <div class="gender-btns"><button data-g="m">le / un · masc.</button><button data-g="f">la / une · fém.</button></div>
    <div id="gen-fb" style="margin-top:12px"></div>`;
  $$("#gen-card .gender-btns button").forEach((b) => (b.onclick = () => answerGender(b.dataset.g)));
}
function answerGender(g) {
  if (gen.answered) { nextGender(); return; }
  gen.answered = true;
  if (document.activeElement) document.activeElement.blur(); // avoid Enter re-clicking a focused button
  const c = gen.cur;
  const ok = g === c.gender;
  gen.total++;
  if (ok) { gen.right++; markStudied(); }
  const word = stripArticle(c.fr);
  const article = c.gender === "m" ? "le / un" : "la / une";
  $("#gen-fb").innerHTML = `
    <div class="feedback ${ok ? "ok" : "no"}">${ok ? "✅" : "❌"} <b>${escapeHtml(c.fr)}</b> (${article}): ${escapeHtml(c.en)} ${speakBtn(c.fr)}</div>
    <p>${genderHint(word, c.gender)}</p>
    <button class="primary" id="gen-next">Next (Enter)</button>`;
  $("#gen-next").onclick = nextGender;
  tts.speak(c.fr);
}
document.addEventListener("keydown", (e) => {
  if (!$("#tab-gender").classList.contains("active") || e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase();
  if (gen.answered && (k === "enter" || k === " ")) { e.preventDefault(); nextGender(); }
  else if (!gen.answered && (k === "m" || k === "arrowleft")) answerGender("m");
  else if (!gen.answered && (k === "f" || k === "arrowright")) answerGender("f");
});

// ───────────────────────── numbers ─────────────────────────
const NUM_UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize"];
// variant: "fr" (France), "be" (Belgium: septante, nonante), "ch" (Switzerland: + huitante)
function below100(n, variant) {
  if (n < 17) return NUM_UNITS[n];
  if (n < 20) return "dix-" + NUM_UNITS[n - 10];
  const tens = Math.floor(n / 10);
  const u = n % 10;
  const regular = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante" };
  if (variant !== "fr") { regular[7] = "septante"; regular[9] = "nonante"; }
  if (variant === "ch") regular[8] = "huitante";
  if (regular[tens]) {
    if (u === 0) return regular[tens];
    if (u === 1) return regular[tens] + " et un";
    return regular[tens] + "-" + NUM_UNITS[u];
  }
  if (tens === 7) return u === 1 ? "soixante et onze" : "soixante-" + below100(10 + u, variant);
  if (tens === 8) return u === 0 ? "quatre-vingts" : "quatre-vingt-" + NUM_UNITS[u];
  return "quatre-vingt-" + below100(10 + u, variant); // 90–99 in France
}
function below1000(n, variant) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return below100(r, variant);
  const hw = h === 1 ? "cent" : NUM_UNITS[h] + " cent";
  if (r === 0) return h > 1 ? hw + "s" : hw;
  return hw + " " + below100(r, variant);
}
function frenchNumber(n, variant = "fr") {
  if (n < 1000) return below1000(n, variant);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  // "quatre-vingts" and "cents" lose their s before "mille"
  const tw = th === 1 ? "mille" : below1000(th, variant).replace(/(vingt|cent)s$/, "$1") + " mille";
  return r === 0 ? tw : tw + " " + below1000(r, variant);
}
const NUM_RANGES = {
  "0-20": [0, 20], "0-69": [0, 69], "70-99": [70, 99], "0-100": [0, 100], "100-1000": [100, 1000], years: [1900, 2030],
};
const num = { range: "0-20", variant: "fr", mode: "listen", n: null, checked: false, right: 0, total: 0 };
const VARIANT_LANG = { fr: "fr-FR", be: "fr-BE", ch: "fr-CH" };

function renderNumbers() {
  const root = $("#tab-numbers");
  root.innerHTML = `
    <div class="panel">
      <h2>Numbers</h2>
      <p class="muted">Numbers are the classic listening blind spot. Train until 70–99 feels automatic.</p>
      <div class="row">
        <label>Range <select id="num-range">${Object.keys(NUM_RANGES).map((k) => `<option ${k === num.range ? "selected" : ""}>${k}</option>`).join("")}</select></label>
        <label>Variant <select id="num-var">
          <option value="fr" ${num.variant === "fr" ? "selected" : ""}>🇫🇷 France</option>
          <option value="be" ${num.variant === "be" ? "selected" : ""}>🇧🇪 Belgium</option>
          <option value="ch" ${num.variant === "ch" ? "selected" : ""}>🇨🇭 Switzerland</option></select></label>
        <label>Mode <select id="num-mode">
          <option value="listen" ${num.mode === "listen" ? "selected" : ""}>🔊 Listen → type digits</option>
          <option value="read" ${num.mode === "read" ? "selected" : ""}>👀 Read words → type digits</option>
          <option value="write" ${num.mode === "write" ? "selected" : ""}>✍️ See digits → write in French</option></select></label>
      </div>
    </div>
    <div class="panel card" id="num-card"></div>`;
  $("#num-range").onchange = (e) => { num.range = e.target.value; nextNumber(); };
  $("#num-var").onchange = (e) => { num.variant = e.target.value; nextNumber(); };
  $("#num-mode").onchange = (e) => { num.mode = e.target.value; nextNumber(); };
  nextNumber();
}
function nextNumber() {
  const [lo, hi] = NUM_RANGES[num.range];
  num.n = lo + Math.floor(Math.random() * (hi - lo + 1));
  num.checked = false;
  const words = frenchNumber(num.n, num.variant);
  const lang = VARIANT_LANG[num.variant];
  const box = $("#num-card");
  const prompt = num.mode === "listen" ? `<button class="primary speak" data-say="${escapeHtml(words)}" data-lang="${lang}">🔊 Play again</button>`
    : num.mode === "read" ? `<div class="prompt">${escapeHtml(words)}</div>`
    : `<div class="prompt">${num.n}</div>`;
  box.innerHTML = `
    <div class="muted">score ${num.right}/${num.total}</div>
    ${prompt}
    <input type="text" id="num-in" autocomplete="off" spellcheck="false" placeholder="${num.mode === "write" ? "en français…" : "digits"}">
    <div id="num-fb"></div>`;
  if (num.mode === "listen") tts.speak(words, lang);
  const input = $("#num-in");
  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (num.checked) { nextNumber(); return; }
    if (!input.value.trim()) return;
    num.checked = true;
    num.total++;
    let r;
    if (num.mode === "write") {
      // Hyphens and spaces are interchangeable (1990 spelling reform allows hyphens everywhere).
      const clean = (s) => norm(s).replace(/-/g, " ");
      r = compare(clean(input.value), [clean(words)]);
    } else {
      r = Number(input.value.replace(/\s/g, "")) === num.n ? "ok" : "no";
    }
    if (r === "ok") { num.right++; markStudied(); }
    $("#num-fb").innerHTML = `
      <div class="feedback ${r === "ok" ? "ok" : r === "accent" ? "warn" : "no"}">${r === "ok" ? "✅" : r === "accent" ? "Almost (accents)" : "❌"} <b>${num.n}</b> = ${escapeHtml(words)} ${speakBtn(words, lang)}</div>
      <p class="muted">Enter for next</p>`;
  });
}

// ───────────────────────── song workshop ─────────────────────────
const FUNCTION_WORDS = new Set(("le la les un une des du de au aux je tu il elle on nous vous ils elles me te se moi toi " +
  "ne pas plus rien jamais que qui quoi est suis es sont ai as a ont et ou mais dans sur pour avec sans ce cette ces " +
  "mon ma mes ton ta tes son sa ses y en si").split(" "));
const songs = { list: store.get("songs", []), sel: null, mode: "read", density: "0.2", blanks: null };
const saveSongs = () => store.set("songs", songs.list);
// Split a line into word and non-word tokens; apostrophes split elisions (j'aime → j ' aime).
const tokenize = (line) => line.match(/[\p{L}\p{M}]+(?:-[\p{L}\p{M}]+)*|[^\p{L}\p{M}]+/gu) || [];
const isWord = (t) => /^[\p{L}\p{M}]/u.test(t);

function renderSongs() {
  const root = $("#tab-songs");
  const s = songs.list.find((x) => x.id === songs.sel);
  root.innerHTML = `
    <div class="panel">
      <h2>Song Workshop</h2>
      <p class="muted">Paste lyrics from YouTube Music (or Genius) for a song you're studying. <b>They stay in this browser only</b>.
      Don't commit lyrics to the repo (copyright). Method: <a href="${docLink("../french/media/music.md")}">6-step song study</a>.</p>
    </div>
    <div class="songs-layout">
      <div class="panel song-list">
        ${songs.list.map((x) => `<button data-id="${x.id}" class="${x.id === songs.sel ? "active" : ""}">${escapeHtml(x.title)}<br><small class="muted">${escapeHtml(x.artist)}</small></button>`).join("")}
        <button id="song-new" class="${songs.sel === null ? "active" : ""}">＋ New song</button>
      </div>
      <div class="panel" id="song-main"></div>
    </div>`;
  $$(".song-list button[data-id]").forEach((b) => (b.onclick = () => { songs.sel = b.dataset.id; songs.blanks = null; renderSongs(); }));
  $("#song-new").onclick = () => { songs.sel = null; renderSongs(); };
  const main = $("#song-main");
  if (!s) { renderSongForm(main); return; }
  main.innerHTML = `
    <div class="row" style="justify-content:space-between">
      <div><b>${escapeHtml(s.title)}</b> · ${escapeHtml(s.artist)}</div>
      <div class="row">
        <button class="small ${songs.mode === "read" ? "primary" : ""}" data-mode="read">📖 Read</button>
        <button class="small ${songs.mode === "cloze" ? "primary" : ""}" data-mode="cloze">✏️ Cloze</button>
        <button class="small" id="song-del">🗑️</button>
      </div>
    </div>
    <div id="song-body" style="margin-top:12px"></div>`;
  $$("#song-main [data-mode]").forEach((b) => (b.onclick = () => { songs.mode = b.dataset.mode; songs.blanks = null; renderSongs(); }));
  $("#song-del").onclick = () => {
    if (!confirm(`Delete "${s.title}" from this browser?`)) return;
    songs.list = songs.list.filter((x) => x.id !== s.id); saveSongs(); songs.sel = null; renderSongs();
  };
  if (songs.mode === "read") renderSongRead(s); else renderSongCloze(s);
}

function renderSongForm(main) {
  main.innerHTML = `
    <h3>Add a song</h3>
    <div class="row"><input type="text" id="sf-title" placeholder="Title (e.g. Flemme)"><input type="text" id="sf-artist" placeholder="Artist (e.g. Angèle)"></div>
    <p class="muted">Tip: start with just the chorus + one verse.</p>
    <textarea id="sf-lyrics" placeholder="Paste lyrics here, one line per line"></textarea>
    <button class="primary" id="sf-save">Save</button>`;
  $("#sf-save").onclick = () => {
    const title = $("#sf-title").value.trim();
    const lyrics = $("#sf-lyrics").value.trim();
    if (!title || !lyrics) { alert("Title and lyrics are needed."); return; }
    const song = { id: String(Date.now()), title, artist: $("#sf-artist").value.trim(), lyrics };
    songs.list.push(song); saveSongs(); songs.sel = song.id; songs.mode = "read"; renderSongs();
  };
}

function renderSongRead(s) {
  const body = $("#song-body");
  body.innerHTML = `
    <p class="muted">Click a word to make a flashcard (you can extend it to a chunk, e.g. <i>avoir la flemme</i>). 🔊 reads a line with the computer voice. Use it for checking words, not as a model of the singer's pronunciation.</p>
    <div class="panel" id="song-addcard" style="display:none">
      <div class="row">
        <input type="text" id="sa-fr" placeholder="French (with article for nouns)">
        <input type="text" id="sa-en" placeholder="English meaning">
        <select id="sa-g"><option value="">no gender</option><option value="m">m.</option><option value="f">f.</option></select>
        <button class="primary small" id="sa-add">Add card</button><span id="sa-msg" class="muted"></span>
      </div>
    </div>
    <div class="lyrics">${s.lyrics.split("\n").map((line) => `
      <div class="line">${line.trim() ? speakBtn(line) : ""}<span>${tokenize(line).map((t) => (isWord(t) ? `<span class="w">${escapeHtml(t)}</span>` : escapeHtml(t))).join("")}</span></div>`).join("")}
    </div>`;
  $$("#song-body .w").forEach((w) => (w.onclick = () => {
    $("#song-addcard").style.display = "block";
    $("#sa-fr").value = w.textContent;
    $("#sa-msg").textContent = "";
    $("#sa-en").focus();
  }));
  $("#sa-add").onclick = () => {
    const fr = $("#sa-fr").value.trim();
    const en = $("#sa-en").value.trim();
    if (!fr || !en) return;
    const custom = store.get("custom", []);
    if (allEntries().some((e) => e.fr === fr)) { $("#sa-msg").textContent = "Already in your deck."; return; }
    custom.push([fr, en, $("#sa-g").value || null, `from "${s.title}"`]);
    store.set("custom", custom);
    fc.queue = []; fc.current = null;
    $("#sa-msg").textContent = `✅ Added "${fr}"`;
    $("#sa-en").value = "";
  };
}

function renderSongCloze(s) {
  const body = $("#song-body");
  const lines = s.lyrics.split("\n").map(tokenize);
  if (!songs.blanks) {
    // Choose which word tokens become gaps.
    songs.blanks = new Set();
    lines.forEach((toks, li) => toks.forEach((t, ti) => {
      if (!isWord(t)) return;
      const lower = t.toLowerCase();
      const eligible = songs.density === "func" ? FUNCTION_WORDS.has(lower) : t.length >= 3;
      const p = songs.density === "func" ? 0.6 : Number(songs.density);
      if (eligible && Math.random() < p) songs.blanks.add(`${li}:${ti}`);
    }));
  }
  body.innerHTML = `
    <div class="row">
      <label>Gaps <select id="cz-density">
        <option value="0.1">Easy (10%)</option><option value="0.2">Medium (20%)</option><option value="0.35">Hard (35%)</option>
        <option value="func">Grammar words (le, ne, que, est…)</option></select></label>
      <button class="small" id="cz-new">🔀 New gaps</button>
      <button class="small primary" id="cz-check">Check</button>
      <button class="small" id="cz-reveal">Reveal</button>
      <span id="cz-score" class="muted"></span>
    </div>
    <p class="muted">Play the song and fill the gaps <i>while listening</i>. Accents count, capitals don't.</p>
    <div class="lyrics">${lines.map((toks, li) => `<div class="line"><span>${toks.map((t, ti) => songs.blanks.has(`${li}:${ti}`)
      ? `<input class="gap" data-a="${escapeHtml(t)}" style="width:${Math.max(3, t.length + 1)}ch" autocomplete="off" spellcheck="false">`
      : escapeHtml(t)).join("")}</span></div>`).join("")}
    </div>`;
  $("#cz-density").value = songs.density;
  $("#cz-density").onchange = (e) => { songs.density = e.target.value; songs.blanks = null; renderSongCloze(s); };
  $("#cz-new").onclick = () => { songs.blanks = null; renderSongCloze(s); };
  $("#cz-check").onclick = () => {
    const gaps = $$("#song-body input.gap");
    let ok = 0;
    gaps.forEach((g) => {
      const right = norm(g.value) === norm(g.dataset.a);
      g.classList.toggle("ok", right);
      g.classList.toggle("no", !right && g.value.trim() !== "");
      if (right) ok++;
    });
    $("#cz-score").textContent = `${ok}/${gaps.length} correct`;
    if (ok) markStudied();
  };
  $("#cz-reveal").onclick = () => $$("#song-body input.gap").forEach((g) => { if (norm(g.value) !== norm(g.dataset.a)) { g.value = g.dataset.a; g.classList.add("no"); } });
}

// ───────────────────────── today ─────────────────────────
const CHECK_ITEMS = [
  ["flash", "🟢 Flashcards (minimum viable day)"],
  ["rule", "📐 Rule of the unit + drill"],
  ["media", "🎧 Media + Hunt task"],
  ["output", "🗣️ Output: write/speak and get corrected"],
];
function tickChecklist(id) {
  const all = store.get("checklist", {});
  const k = todayKey();
  all[k] = Object.assign({}, all[k], { [id]: true });
  store.set("checklist", all);
}
const timer = { total: 25 * 60, left: 25 * 60, handle: null };

function renderToday() {
  const root = $("#tab-today");
  const c = cardCounts();
  const days = store.get("days", []);
  const check = store.get("checklist", {})[todayKey()] || {};
  const u = UNITS[settings.unit];
  root.innerHTML = `
    <div class="panel">
      <div class="row" style="justify-content:space-between">
        <div>
          <div class="muted">Current unit</div>
          <h2 style="margin:0">Unit ${u[0]}: ${escapeHtml(u[1])}</h2>
          <a href="${unitLink(settings.unit)}" target="_blank">Open the unit →</a>
        </div>
        <label class="unit-pick">Change unit <select id="t-unit">${UNITS.map(([n, t]) => `<option value="${n}" ${n === settings.unit ? "selected" : ""}>${n}: ${escapeHtml(t)}</option>`).join("")}</select></label>
      </div>
    </div>
    <div class="grid">
      <div class="panel"><div class="muted">Due now</div><div class="big-stat">${c.due}</div><div class="muted">+ ${c.newLeft} new today</div>
        <button class="primary" id="t-go" style="margin-top:8px">Start flashcards</button></div>
      <div class="panel"><div class="muted">Days studied (total, not a streak)</div><div class="big-stat">${days.length}</div>
        <div class="muted">Missed a day? Nothing is lost. Just come back.</div></div>
      <div class="panel"><div class="muted">Focus block</div><div class="timer" id="t-timer"></div>
        <div class="row"><button id="t-start">Start</button><button id="t-reset">Reset</button>
        <select id="t-len"><option value="5">5 min</option><option value="25" selected>25 min</option><option value="45">45 min</option></select></div></div>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">Today's session</h3>
      ${CHECK_ITEMS.map(([id, label]) => `<label class="check"><input type="checkbox" data-c="${id}" ${check[id] ? "checked" : ""}> ${label}</label>`).join("")}
      <p class="muted">Only the first one is required. The others are bonuses.</p>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">🅿️ Parking lot</h3>
      <p class="muted">Had an idea or a tangent mid-session ("I should build…", "let me research…")? Write it here and get back to studying. Review it on Sunday.</p>
      <textarea id="t-park" placeholder="- idea...">${escapeHtml(store.get("parking", ""))}</textarea>
    </div>
    <details class="panel">
      <summary><b>Backup & settings</b></summary>
      <p class="muted">Your progress lives in this browser's storage. Export it now and then (e.g. into your repo, it's not secret).</p>
      <div class="row">
        <button id="t-export">⬇️ Export progress</button>
        <label class="btn">⬆️ Import <input type="file" id="t-import" accept="application/json" hidden></label>
        <label>Voice speed <input type="range" id="t-rate" min="0.5" max="1.2" step="0.05" value="${settings.rate}"></label>
        <button class="small speak" data-say="Bonjour ! Je m'appelle Angèle, et j'habite à Bruxelles.">Test voice</button>
      </div>
      <p class="muted" id="t-voice"></p>
    </details>`;

  $("#t-unit").onchange = (e) => {
    settings.unit = Number(e.target.value); saveSettings();
    conj.verbs = null; conj.tenses = null; fc.queue = []; fc.current = null;
    renderToday();
  };
  $("#t-go").onclick = () => showTab("cards");
  $$("[data-c]").forEach((i) => (i.onchange = () => {
    const all = store.get("checklist", {});
    all[todayKey()] = Object.assign({}, all[todayKey()], { [i.dataset.c]: i.checked });
    store.set("checklist", all);
    if (i.checked) markStudied();
  }));
  $("#t-park").oninput = (e) => store.set("parking", e.target.value);
  $("#t-export").onclick = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `french-progress-${todayKey()}.json`;
    a.click();
  };
  $("#t-import").onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((txt) => {
      const data = JSON.parse(txt);
      if (!confirm("Replace current progress with this backup?")) return;
      Object.keys(data).forEach((k) => store.set(k, data[k]));
      location.reload();
    }).catch((err) => alert("Import failed: " + err.message));
  };
  $("#t-rate").oninput = (e) => { settings.rate = Number(e.target.value); saveSettings(); };
  $("#t-voice").textContent = "speechSynthesis" in window
    ? (tts.voices.length ? `French voices found: ${tts.voices.map((v) => v.name + " (" + v.lang + ")").join(", ")}` : "No French voice found yet. Install one in your OS speech settings for 🔊 to sound French.")
    : "This browser has no speech synthesis, so 🔊 buttons won't work.";

  // Timer
  const draw = () => {
    const el = $("#t-timer");
    if (el) el.textContent = `${String(Math.floor(timer.left / 60)).padStart(2, "0")}:${String(timer.left % 60).padStart(2, "0")}`;
    const b = $("#t-start");
    if (b) b.textContent = timer.handle ? "Pause" : "Start";
  };
  $("#t-len").value = String(timer.total / 60);
  $("#t-len").onchange = (e) => { if (!timer.handle) { timer.total = timer.left = Number(e.target.value) * 60; draw(); } };
  $("#t-start").onclick = () => {
    if (timer.handle) { clearInterval(timer.handle); timer.handle = null; draw(); return; }
    timer.handle = setInterval(() => {
      timer.left--;
      if (timer.left <= 0) {
        clearInterval(timer.handle); timer.handle = null; timer.left = timer.total;
        chime();
        alert("⏰ Focus block done! Take a 5-minute break. Bravo !");
      }
      draw();
    }, 1000);
    draw();
  };
  $("#t-reset").onclick = () => { clearInterval(timer.handle); timer.handle = null; timer.left = timer.total; draw(); };
  draw();
}
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.4);
      o.start(ctx.currentTime + i * 0.25); o.stop(ctx.currentTime + i * 0.25 + 0.4);
    });
  } catch (e) { /* no audio */ }
}

// ───────────────────────── accent bar ─────────────────────────
let lastInput = null;
document.addEventListener("focusin", (e) => {
  if (e.target.matches("input[type=text], textarea")) { lastInput = e.target; document.body.classList.add("typing"); }
});
document.addEventListener("focusout", (e) => {
  if (e.target.matches("input[type=text], textarea")) document.body.classList.remove("typing");
});
function setupAccentBar() {
  const bar = $("#accent-bar");
  "é è ê à â ç ù û ô î ï ë œ".split(" ").forEach((ch) => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.type = "button";
    // mousedown + preventDefault keeps focus in the input
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.onclick = () => {
      if (!lastInput) return;
      const { selectionStart: s, selectionEnd: en, value } = lastInput;
      lastInput.value = value.slice(0, s) + ch + value.slice(en);
      lastInput.setSelectionRange(s + 1, s + 1);
      lastInput.focus();
    };
    bar.appendChild(b);
  });
}

// ───────────────────────── theme ─────────────────────────
// Auto (follow the device) → Light → Dark. Stored as "llc.theme", shared with the course site.
const THEME_KEY = "llc.theme";
const THEME_ORDER = ["auto", "light", "dark"];
const THEME_LABEL = { auto: "🌓 Auto", light: "☀️ Light", dark: "🌙 Dark" };
function setupThemeToggle() {
  const btn = $("#theme-toggle");
  let current = "auto";
  try { current = localStorage.getItem(THEME_KEY) || "auto"; } catch (e) { /* default */ }
  const render = () => {
    btn.textContent = THEME_LABEL[current];
    btn.setAttribute("aria-label", `Theme: ${current}. Click to change.`);
  };
  btn.onclick = () => {
    current = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
    try { localStorage.setItem(THEME_KEY, current); } catch (e) { /* this page only */ }
    if (current === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", current);
    render();
  };
  render();
}

// ───────────────────────── boot ─────────────────────────
const RENDER = { today: renderToday, cards: renderCards, conj: renderConj, gender: renderGender, numbers: renderNumbers, songs: renderSongs };
function showTab(name) {
  $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
  try { sessionStorage.setItem(PREFIX + "tab", name); } catch (e) { /* ignore */ }
  RENDER[name]();
}
$$("#tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
tts.init();
setupAccentBar();
setupThemeToggle();
let startTab = "today";
try { startTab = sessionStorage.getItem(PREFIX + "tab") || "today"; } catch (e) { /* ignore */ }
showTab(RENDER[startTab] ? startTab : "today");

// Exposed for tests (see app/test.mjs)
window.__fr = { schedule, frenchNumber, conjugate, genderHint, stripArticle, compare, tokenize };
