/* Language Study App: plain JS, no build step, works from file://.
 * Sections: course & language · storage · helpers · TTS · units · SRS flashcards ·
 * conjugation · gender · numbers · song workshop · today · tutor · theme · pickers · boot
 */
"use strict";

// ───────────────────────── course & language ─────────────────────────
// Both choices apply to every course, like the theme: "llc.course" and "llc.lang".
// Courses live in data/courses.js, interface text in i18n.js.
const LANGS = ["en", "pt-BR"];
function readGlobal(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeGlobal(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* this page only */ }
}
const COURSE = window.LLC_COURSES.find((c) => c.id === readGlobal("llc.course")) || window.LLC_COURSES[0];
// First visit: Portuguese if the device is set to it, otherwise English.
let lang = LANGS.includes(readGlobal("llc.lang")) ? readGlobal("llc.lang") : /^pt/i.test(navigator.language || "") ? "pt-BR" : "en";
// Pick the current language's value from a { en, "pt-BR" } object.
const local = (obj) => obj[lang] || obj.en;
// Interface text for a key, with {placeholders} filled in from vars.
function t(key, vars = {}) {
  const dict = window.LLC_I18N;
  const s = dict[lang][key] ?? dict.en[key] ?? key;
  if (typeof s !== "string") return s;
  const all = Object.assign({ course: local(COURSE.name), Course: local(COURSE.label) }, vars);
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in all ? all[k] : m));
}

// ───────────────────────── storage ─────────────────────────
// localStorage can throw (private mode, blocked storage): fall back to memory.
// Progress is kept per course.
const PREFIX = COURSE.storagePrefix;
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
const VOICE_PREFIX = COURSE.voiceLang.slice(0, 2).toLowerCase();
const tts = {
  voices: [],
  init() {
    if (!("speechSynthesis" in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(VOICE_PREFIX)); };
    load();
    speechSynthesis.onvoiceschanged = load;
  },
  // Turn card text like "beau / belle" or "enchanté(e)" into something speakable.
  clean(text) {
    return text.replace(/\(.*?\)/g, "").replace(/[…]/g, "").replace(/\s*\/\s*/g, ", ").replace(/\+/g, "").trim();
  },
  speak(text, voiceLang = COURSE.voiceLang) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.clean(text));
    u.lang = voiceLang;
    const voice = this.voices.find((v) => v.lang.replace("_", "-") === voiceLang) || this.voices.find((v) => v.lang.toLowerCase().startsWith(VOICE_PREFIX));
    if (voice) u.voice = voice;
    u.rate = settings.rate;
    speechSynthesis.speak(u);
  },
};
const speakBtn = (text, voiceLang) => `<button class="small speak" data-say="${escapeHtml(text)}" data-lang="${voiceLang || COURSE.voiceLang}" title="🔊">🔊</button>`;
document.addEventListener("click", (e) => {
  const b = e.target.closest("button.speak");
  if (b) tts.speak(b.dataset.say, b.dataset.lang);
});

// ───────────────────────── units ─────────────────────────
// Index = unit number; each unit is { en, "pt-BR", page? } (see data/courses.js).
const UNITS = COURSE.units;
// Links to the course's Markdown pages. GitHub Pages renders .md as .html
// (and README.md as the folder index), so adjust links when hosted there.
function docLink(path) {
  if (!location.hostname.endsWith("github.io")) return path;
  return path.replace(/README\.md$/, "").replace(/\.md$/, ".html");
}
const unitLink = (u) => docLink(`../${COURSE.folder}/` + (UNITS[u].page || "README.md"));

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
  if (ms < 60 * MIN) return Math.max(1, Math.round(ms / MIN)) + " " + t("delay.min");
  const days = Math.round((ms + 4 * 60 * MIN) / DAY);
  if (days < 30) return days + " " + t("delay.d");
  if (days < 365) return Math.round(days / 30) + " " + t("delay.mo");
  return (days / 365).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " " + t("delay.y");
}

function allEntries() {
  const list = [];
  Object.keys(COURSE.vocab).forEach((u) => {
    COURSE.vocab[u].forEach(([fr, en, gender, note]) => list.push({ fr, en, gender, note, unit: Number(u) }));
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
  const code = COURSE.id.toUpperCase();
  root.innerHTML = `
    <div class="panel">
      <div class="row" style="justify-content:space-between">
        <div>${t("cards.deck", { n: settings.unit })} · <span class="muted">${t("cards.seen", { seen: c.seen, total: c.total })}</span></div>
        <div class="row">
          <span class="tag">${t("cards.due", { n: c.due })}</span><span class="tag">${t("cards.new", { n: c.newLeft })}</span>
          <button class="small" id="fc-start">${fc.queue.length ? t("cards.restart") : t("cards.startSession")}</button>
        </div>
      </div>
    </div>
    <div class="panel card" id="fc-card"></div>
    <details class="panel">
      <summary><b>${t("cards.settings")}</b></summary>
      <div class="row" style="margin-top:12px">
        <label><input type="checkbox" id="fc-fr2en" ${settings.fr2en ? "checked" : ""}> ${code} → EN (${t("cards.recognise")})</label>
        <label><input type="checkbox" id="fc-en2fr" ${settings.en2fr ? "checked" : ""}> EN → ${code} (${t("cards.produce")})</label>
        <label><input type="checkbox" id="fc-auto" ${settings.autoSpeak ? "checked" : ""}> ${t("cards.autoSpeak")}</label>
        <label>${t("cards.newPerDay")} <input type="number" id="fc-new" min="0" max="50" value="${settings.newPerDay}" style="width:70px"></label>
      </div>
      ${t("cards.meaningsNote") ? `<p class="muted">${t("cards.meaningsNote")}</p>` : ""}
      <h3>${t("cards.importTitle")}</h3>
      <p class="muted">${t("cards.importFormat", { format: '<code>[{"fr":"la chanson","en":"song","gender":"f","note":"..."}]</code>' })}</p>
      <textarea id="fc-import" placeholder='[{"fr": "avoir la flemme", "en": "to not be bothered", "gender": null, "note": "colloquial"}]'></textarea>
      <div class="row"><button id="fc-import-btn">${t("cards.import")}</button><span id="fc-import-msg" class="muted"></span></div>
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
    if (!Array.isArray(data)) throw new Error(t("cards.importArray"));
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
    msg.textContent = t("cards.imported", { n: added });
    fc.queue = []; fc.current = null;
    setTimeout(renderCards, 800);
  } catch (e) {
    msg.textContent = t("cards.importFailed", { msg: e.message });
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
      ? `<div class="prompt">${t("cards.sessionDone")}</div><p>${t("cards.reviews", { n: fc.done })}</p>
         <p class="muted">${t("cards.nextStep")}</p>`
      : counts.total === 0
        ? `<p>${t("cards.noneActive")}</p>`
        : `<div class="prompt">${t("cards.nothingDue")}</div><p class="muted">${t("cards.comeBack")}</p>`;
    return;
  }
  const isFr = c.dir === "fr2en";
  const promptText = isFr ? c.fr : c.en;
  const hint = !isFr && c.gender ? `<span class="tag">${t("cards.includeArticle")}</span>` : "";
  const unitTag = `<span class="tag">${c.unit === "custom" ? t("common.custom") : t("common.unitLower", { n: c.unit })}</span>`;
  const code = COURSE.id.toUpperCase();
  box.innerHTML = `
    <div class="row">${unitTag} <span class="muted">${isFr ? `${code} → EN` : `EN → ${code}`}</span> <span class="muted">${t("cards.left", { n: fc.queue.length })}</span></div>
    <div class="prompt">${escapeHtml(promptText)} ${isFr ? speakBtn(c.fr) : ""}</div>
    ${hint}
    <input type="text" id="fc-typed" placeholder="${t("cards.typePlaceholder")}" autocomplete="off" autocapitalize="off" spellcheck="false">
    <button class="primary" id="fc-reveal">${t("cards.show")}</button>
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
    fb = r === "ok" ? `<div class="feedback ok">${t("cards.matches")}</div>`
      : r === "accent" ? `<div class="feedback warn">${t("cards.checkAccents")}</div>`
      : `<div class="feedback no">${t("cards.youTyped", { typed: escapeHtml(typedVal) })}</div>`;
  }
  const prev = store.get("srs", {})[c.id];
  const now = Date.now();
  const labels = [t("cards.again"), t("cards.hard"), t("cards.good"), t("cards.easy")];
  const cls = ["again", "", "good", ""];
  $("#fc-reveal").remove();
  $("#fc-back").innerHTML = `
    <div class="answer">${escapeHtml(isFr ? c.en : c.fr)} ${!isFr ? speakBtn(c.fr) : ""}</div>
    ${c.note ? `<div class="note">${escapeHtml(c.note)}</div>` : ""}
    ${fb}
    <p class="muted">${t("cards.howWell")}</p>
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

// ───────────────────────── drill button ─────────────────────────
// Typed drills advance with Enter or this button: "Check" until answered, then "Next".
const drillButton = (id) => `<button class="primary" id="${id}" type="button">${t("common.check")}</button>`;
function bindDrillButton(id, advance) {
  const b = $("#" + id);
  // Keep focus in the answer box, so a phone keyboard stays open between questions.
  b.addEventListener("mousedown", (e) => e.preventDefault());
  b.onclick = advance;
}

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
  const verbs = COURSE.verbs;
  if (!conj.verbs) conj.verbs = verbs.filter((v) => v.unit <= Math.max(1, settings.unit)).map((v) => v.inf);
  if (!conj.tenses) conj.tenses = COURSE.tenses.filter((t) => t.unit <= Math.max(1, settings.unit)).map((t) => t.id);
  const tenseNames = COURSE.tenses.filter((t) => conj.tenses.includes(t.id)).map((x) => x.label).join(", ") || t("conj.none");
  root.innerHTML = `
    <div class="panel">
      <h2>${t("conj.title")}</h2>
      <p class="muted">${t("conj.intro")}</p>
    </div>
    <div class="panel card" id="conj-card"></div>
    <details class="panel" id="conj-opts">
      <summary><b>${t("conj.choose")}</b> <span class="muted">${t("conj.summary", { n: conj.verbs.length, tenses: escapeHtml(tenseNames) })}</span></summary>
      <h3>${t("conj.tenses")}</h3>
      <div class="picks" id="conj-tenses">${COURSE.tenses.map((x) => `
        <label class="${x.unit > settings.unit ? "locked" : ""}"><input type="checkbox" value="${x.id}" ${conj.tenses.includes(x.id) ? "checked" : ""}> ${x.label}${x.unit > settings.unit ? ` <small>(${t("common.unitLower", { n: x.unit })})</small>` : ""}</label>`).join("")}
      </div>
      <h3>${t("conj.verbs")} <button class="small" id="conj-unit">${t("conj.upToUnit")}</button> <button class="small" id="conj-all">${t("conj.all")}</button></h3>
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
  const pool = COURSE.verbs.filter((v) => conj.verbs.includes(v.inf));
  if (!pool.length || !conj.tenses.length) {
    box.innerHTML = `<p>${t("conj.pickOne")}</p>`;
    return;
  }
  const v = pick(pool);
  const tense = pick(conj.tenses);
  const p = Math.floor(Math.random() * 6);
  const res = conjugate(v, tense, p);
  conj.q = { v, tense, p, res };
  conj.checked = false;
  const tLabel = COURSE.tenses.find((x) => x.id === tense).label;
  const acc = conj.total ? Math.round((100 * conj.right) / conj.total) : 0;
  box.innerHTML = `
    <div class="row"><span class="tag">${tLabel}</span><span class="muted">${v.inf}: ${v.en}</span>
      <span class="muted">· ${t("common.score", { right: conj.right, total: conj.total })}${conj.total ? ` (${acc}%)` : ""}</span></div>
    <div class="prompt">${subjectFor(p, res.display)} ___ <small class="muted">(${v.inf})</small></div>
    <input type="text" id="conj-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t("conj.placeholder")}">
    ${drillButton("conj-go")}
    <div id="conj-fb"></div>`;
  const advance = () => { if (conj.checked) newConjQ(); else checkConj(); };
  const input = $("#conj-in");
  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    advance();
  });
  bindDrillButton("conj-go", advance);
}

function checkConj() {
  const { res, p, v } = conj.q;
  const typed = stripPronoun($("#conj-in").value);
  if (!typed) return;
  conj.checked = true;
  $("#conj-go").textContent = t("common.next");
  const r = compare(typed, res.answers);
  conj.total++;
  if (r === "ok") conj.right++;
  const full = `${subjectFor(p, res.display)}${subjectFor(p, res.display) === "j'" ? "" : " "}${res.display}`;
  $("#conj-fb").innerHTML = `
    <div class="feedback ${r === "ok" ? "ok" : r === "accent" ? "warn" : "no"}">
      ${r === "ok" ? t("conj.correct") : r === "accent" ? t("conj.accent") : t("conj.wrong")}: <b>${escapeHtml(full)}</b> ${speakBtn(full.replace(/\(e\)|\(s\)/g, ""))}
    </div>
    ${conj.q.tense === "passeCompose" && v.aux === "être" ? `<p class="muted">${t("conj.etre", { verb: v.inf })}</p>` : ""}`;
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
  if (!rule) return t("gender.noRule");
  const [end, g] = rule;
  const usual = t(`gender.${g}Plural`);
  return g === gender ? t("gender.rule", { end, usual }) : t("gender.exception", { end, usual, actual: t(`gender.${gender}`) });
}
const gen = { pool: [], cur: null, answered: false, right: 0, total: 0, allUnits: false };

function renderGender() {
  const root = $("#tab-gender");
  gen.pool = allEntries().filter((e) => e.gender && !e.fr.startsWith("les ") && (gen.allUnits || e.unit === "custom" || e.unit <= settings.unit));
  root.innerHTML = `
    <div class="panel">
      <h2>${t("gender.title")}</h2>
      <p class="muted">${t("gender.keys")}</p>
      <label><input type="checkbox" id="gen-all" ${gen.allUnits ? "checked" : ""}> ${t("gender.allUnits", { n: allEntries().filter((e) => e.gender).length })}</label>
    </div>
    <div class="panel" id="gen-card"></div>`;
  $("#gen-all").onchange = (e) => { gen.allUnits = e.target.checked; renderGender(); };
  nextGender();
}
function nextGender() {
  const box = $("#gen-card");
  if (!gen.pool.length) {
    box.innerHTML = `<p>${t("gender.noNouns")}</p>`;
    return;
  }
  gen.cur = pick(gen.pool);
  gen.answered = false;
  const word = stripArticle(gen.cur.fr);
  const acc = gen.total ? ` (${Math.round((100 * gen.right) / gen.total)}%)` : "";
  box.innerHTML = `
    <div class="row muted">${t("common.score", { right: gen.right, total: gen.total })}${acc}</div>
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
    <button class="primary" id="gen-next">${t("common.next")}</button>`;
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
      <h2>${t("num.title")}</h2>
      <p class="muted">${t("num.intro")}</p>
      <div class="row">
        <label>${t("num.range")} <select id="num-range">${Object.keys(NUM_RANGES).map((k) => `<option value="${k}" ${k === num.range ? "selected" : ""}>${k === "years" ? t("num.years") : k}</option>`).join("")}</select></label>
        <label>${t("num.variant")} <select id="num-var">${["fr", "be", "ch"].map((v) => `
          <option value="${v}" ${num.variant === v ? "selected" : ""}>${t("num." + v)}</option>`).join("")}</select></label>
        <label>${t("num.mode")} <select id="num-mode">${["listen", "read", "write"].map((m) => `
          <option value="${m}" ${num.mode === m ? "selected" : ""}>${t("num." + m)}</option>`).join("")}</select></label>
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
  const voiceLang = VARIANT_LANG[num.variant];
  const box = $("#num-card");
  const prompt = num.mode === "listen" ? `<button class="primary speak" data-say="${escapeHtml(words)}" data-lang="${voiceLang}">${t("num.playAgain")}</button>`
    : num.mode === "read" ? `<div class="prompt">${escapeHtml(words)}</div>`
    : `<div class="prompt">${num.n}</div>`;
  box.innerHTML = `
    <div class="muted">${t("common.score", { right: num.right, total: num.total })}</div>
    ${prompt}
    <input type="text" id="num-in" autocomplete="off" spellcheck="false" placeholder="${num.mode === "write" ? "en français…" : t("num.digits")}">
    ${drillButton("num-go")}
    <div id="num-fb"></div>`;
  if (num.mode === "listen") tts.speak(words, voiceLang);
  const input = $("#num-in");
  input.focus();
  const advance = () => {
    if (num.checked) { nextNumber(); return; }
    if (!input.value.trim()) return;
    num.checked = true;
    num.total++;
    $("#num-go").textContent = t("common.next");
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
      <div class="feedback ${r === "ok" ? "ok" : r === "accent" ? "warn" : "no"}">${r === "ok" ? "✅" : r === "accent" ? t("num.accents") : "❌"} <b>${num.n}</b> = ${escapeHtml(words)} ${speakBtn(words, voiceLang)}</div>`;
  };
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    advance();
  });
  bindDrillButton("num-go", advance);
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
      <h2>${t("songs.title")}</h2>
      <p class="muted">${t("songs.intro", { link: docLink(`../${COURSE.folder}/media/music.md`) })}</p>
    </div>
    <div class="songs-layout">
      <div class="panel song-list">
        ${songs.list.map((x) => `<button data-id="${x.id}" class="${x.id === songs.sel ? "active" : ""}">${escapeHtml(x.title)}<br><small class="muted">${escapeHtml(x.artist)}</small></button>`).join("")}
        <button id="song-new" class="${songs.sel === null ? "active" : ""}">${t("songs.new")}</button>
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
        <button class="small ${songs.mode === "read" ? "primary" : ""}" data-mode="read">${t("songs.read")}</button>
        <button class="small ${songs.mode === "cloze" ? "primary" : ""}" data-mode="cloze">${t("songs.cloze")}</button>
        <button class="small" id="song-del">🗑️</button>
      </div>
    </div>
    <div id="song-body" style="margin-top:12px"></div>`;
  $$("#song-main [data-mode]").forEach((b) => (b.onclick = () => { songs.mode = b.dataset.mode; songs.blanks = null; renderSongs(); }));
  $("#song-del").onclick = () => {
    if (!confirm(t("songs.confirmDelete", { title: s.title }))) return;
    songs.list = songs.list.filter((x) => x.id !== s.id); saveSongs(); songs.sel = null; renderSongs();
  };
  if (songs.mode === "read") renderSongRead(s); else renderSongCloze(s);
}

function renderSongForm(main) {
  main.innerHTML = `
    <h3>${t("songs.add")}</h3>
    <div class="row"><input type="text" id="sf-title" placeholder="${t("songs.titlePh")}"><input type="text" id="sf-artist" placeholder="${t("songs.artistPh")}"></div>
    <p class="muted">${t("songs.tip")}</p>
    <textarea id="sf-lyrics" placeholder="${t("songs.lyricsPh")}"></textarea>
    <button class="primary" id="sf-save">${t("common.save")}</button>`;
  $("#sf-save").onclick = () => {
    const title = $("#sf-title").value.trim();
    const lyrics = $("#sf-lyrics").value.trim();
    if (!title || !lyrics) { alert(t("songs.needed")); return; }
    const song = { id: String(Date.now()), title, artist: $("#sf-artist").value.trim(), lyrics };
    songs.list.push(song); saveSongs(); songs.sel = song.id; songs.mode = "read"; renderSongs();
  };
}

function renderSongRead(s) {
  const body = $("#song-body");
  body.innerHTML = `
    <p class="muted">${t("songs.readHelp")}</p>
    <div class="panel" id="song-addcard" style="display:none">
      <div class="row">
        <input type="text" id="sa-fr" placeholder="${t("songs.wordPh")}">
        <input type="text" id="sa-en" placeholder="${t("songs.meaningPh")}">
        <select id="sa-g"><option value="">${t("songs.noGender")}</option><option value="m">m.</option><option value="f">f.</option></select>
        <button class="primary small" id="sa-add">${t("songs.addCard")}</button><span id="sa-msg" class="muted"></span>
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
    if (allEntries().some((e) => e.fr === fr)) { $("#sa-msg").textContent = t("songs.already"); return; }
    custom.push([fr, en, $("#sa-g").value || null, t("songs.fromSong", { title: s.title })]);
    store.set("custom", custom);
    fc.queue = []; fc.current = null;
    $("#sa-msg").textContent = t("songs.added", { word: fr });
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
      <label>${t("songs.gaps")} <select id="cz-density">
        <option value="0.1">${t("songs.easy")}</option><option value="0.2">${t("songs.medium")}</option><option value="0.35">${t("songs.hard")}</option>
        <option value="func">${t("songs.func")}</option></select></label>
      <button class="small" id="cz-new">${t("songs.newGaps")}</button>
      <button class="small primary" id="cz-check">${t("songs.check")}</button>
      <button class="small" id="cz-reveal">${t("songs.reveal")}</button>
      <span id="cz-score" class="muted"></span>
    </div>
    <p class="muted">${t("songs.clozeHelp")}</p>
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
    $("#cz-score").textContent = t("songs.score", { ok, n: gaps.length });
    if (ok) markStudied();
  };
  $("#cz-reveal").onclick = () => $$("#song-body input.gap").forEach((g) => { if (norm(g.value) !== norm(g.dataset.a)) { g.value = g.dataset.a; g.classList.add("no"); } });
}

// ───────────────────────── today ─────────────────────────
// Labels: "today.<id>" in i18n.js
const CHECK_ITEMS = ["flash", "rule", "media", "output"];
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
          <div class="muted">${t("today.currentUnit")}</div>
          <h2 style="margin:0">${t("today.unitTitle", { n: settings.unit, title: escapeHtml(local(u)) })}</h2>
          <a href="${unitLink(settings.unit)}" target="_blank">${t("today.openUnit")}</a>
        </div>
        <label class="unit-pick">${t("today.changeUnit")} <select id="t-unit">${UNITS.map((x, n) => `<option value="${n}" ${n === settings.unit ? "selected" : ""}>${n}: ${escapeHtml(local(x))}</option>`).join("")}</select></label>
      </div>
    </div>
    <div class="grid">
      <div class="panel"><div class="muted">${t("today.dueNow")}</div><div class="big-stat">${c.due}</div><div class="muted">${t("today.newToday", { n: c.newLeft })}</div>
        <button class="primary" id="t-go" style="margin-top:8px">${t("today.startCards")}</button></div>
      <div class="panel"><div class="muted">${t("today.days")}</div><div class="big-stat">${days.length}</div>
        <div class="muted">${t("today.missed")}</div></div>
      <div class="panel"><div class="muted">${t("today.focus")}</div><div class="timer" id="t-timer"></div>
        <div class="row"><button id="t-start">${t("common.start")}</button><button id="t-reset">${t("today.reset")}</button>
        <select id="t-len"><option value="5">5 min</option><option value="25" selected>25 min</option><option value="45">45 min</option></select></div></div>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">${t("today.session")}</h3>
      ${CHECK_ITEMS.map((id) => `<label class="check"><input type="checkbox" data-c="${id}" ${check[id] ? "checked" : ""}> ${t("today." + id)}</label>`).join("")}
      <p class="muted">${t("today.onlyFirst")}</p>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">${t("today.parking")}</h3>
      <p class="muted">${t("today.parkingHelp")}</p>
      <textarea id="t-park" placeholder="${t("today.parkingPh")}">${escapeHtml(store.get("parking", ""))}</textarea>
    </div>
    <details class="panel">
      <summary><b>${t("today.backup")}</b></summary>
      <p class="muted">${t("today.backupHelp")}</p>
      <div class="row">
        <button id="t-export">${t("today.export")}</button>
        <label class="btn">${t("today.import")} <input type="file" id="t-import" accept="application/json" hidden></label>
        <label>${t("today.voiceSpeed")} <input type="range" id="t-rate" min="0.5" max="1.2" step="0.05" value="${settings.rate}"></label>
        <button class="small speak" data-say="${escapeHtml(COURSE.voiceSample)}">${t("today.testVoice")}</button>
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
    a.download = `${COURSE.folder}-progress-${todayKey()}.json`;
    a.click();
  };
  $("#t-import").onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((txt) => {
      const data = JSON.parse(txt);
      if (!confirm(t("today.confirmImport"))) return;
      Object.keys(data).forEach((k) => store.set(k, data[k]));
      location.reload();
    }).catch((err) => alert(t("today.importFailed", { msg: err.message })));
  };
  $("#t-rate").oninput = (e) => { settings.rate = Number(e.target.value); saveSettings(); };
  $("#t-voice").textContent = "speechSynthesis" in window
    ? (tts.voices.length ? t("today.voices", { list: tts.voices.map((v) => v.name + " (" + v.lang + ")").join(", ") }) : t("today.noVoice"))
    : t("today.noSpeech");

  // Timer
  const draw = () => {
    const el = $("#t-timer");
    if (el) el.textContent = `${String(Math.floor(timer.left / 60)).padStart(2, "0")}:${String(timer.left % 60).padStart(2, "0")}`;
    const b = $("#t-start");
    if (b) b.textContent = timer.handle ? t("today.pause") : t("common.start");
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
        alert(t("today.timerDone"));
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
  COURSE.accents.split(" ").forEach((ch) => {
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

// ───────────────────────── tutor (Claude) ─────────────────────────
// Bring-your-own-key chat with Claude, called straight from the browser with the
// official Anthropic SDK (loaded from a CDN only when the Tutor is used). The key
// stays on this device and is only ever sent to api.anthropic.com.
const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm";
// Outside PREFIX on purpose: progress backups (store.exportAll) never include the key.
const KEY_NAME = "llc.secret.anthropicKey";
// $ per million tokens (input, output, cache read); used only for the cost estimate.
// tier: label key "tutor.tier.<tier>" in i18n.js
const TUTOR_MODELS = {
  "claude-opus-5-5": { name: "Claude Opus 5.5", tier: "best", in: 4, out: 20, cacheRead: 0.2, fallbacks: true },
  "claude-sonnet-5-5": { name: "Claude Sonnet 5.5", tier: "balanced", in: 2, out: 10, cacheRead: 0.2, fallbacks: true },
  "claude-haiku-5-5": { name: "Claude Haiku 5.5", tier: "cheapest", in: 0.1, out: 0.5, cacheRead: 0.01, fallbacks: false },
};
// Role-play scenarios, in the interface language (the learner reads and picks them).
const scenarios = () => local(COURSE.scenarios);
// Instructions for Claude, kept in English. L is the course language; course-specific
// lines come from the course's "tutor" entry in data/courses.js.
const L = COURSE.name.en;
const MODE_PROMPTS = {
  tutor: `MODE: Tutor.
- Explain grammar explicitly and briefly: the rule, 3 examples, then the most common exception.
- After explaining, quiz the learner immediately, one question at a time. Don't give the answer until they try (retrieval practice).
- When they make a mistake, first give a hint so they can self-correct (e.g. "check the ending"). If they fail twice, give the correct form and a one-line explanation.
- Keep ${L} at their level: words from their current unit plus the ~500 most common ${L} words.
- Start by offering a 3-question warm-up on the current unit, or ask what they want to practise.`,
  corrector: `MODE: Corrector. The learner sends ${L} text they wrote. Reply with:
1. Their original with errors marked like this: ~~wrong~~ **right**
2. A short list: error → rule → category (gender / agreement / case / conjugation / word choice / spelling / word order)
3. ONE pattern they keep repeating that they should focus on.
4. A more natural version a native speaker might write, at the same level.
Don't rewrite their ideas, only their ${L}. If they send English or a question instead, help briefly and ask for ${L} text.`,
  conversation: `MODE: Conversation partner. Role-play the scenario the learner gives you.
- Speak ONLY ${L}, short simple sentences at their level.
- If they make a mistake, recast it naturally in your reply (say it correctly back to them) without stopping the conversation.
- If they write "??", re-say your last line more simply.
- After 10 exchanges, or when they write "stop", switch to English and give: 3 errors they made and 3 useful new phrases.
Start the scene yourself with one line.`,
  song: `MODE: Song explainer. The learner pastes a few lines of a ${L} song (from YouTube Music or similar) and names the song and artist. For each line:
- a literal translation and a natural translation,
- grammar at their level,
- ${COURSE.tutor.song}, and places where the singer bends pronunciation or grammar for the rhythm,
then list 3 chunks worth memorising. Work ONLY with the lines they paste: never continue, complete or invent lyrics.`,
  reading: `MODE: Reading companion. The learner pastes one paragraph from a book or article and says what they're reading.
1. A natural English translation.
2. ${COURSE.tutor.reading}
3. The 3 most useful chunks to memorise.
4. Two short comprehension questions in ${L}.
Never summarise or reveal anything beyond the pasted paragraph (no spoilers).`,
};
// Labels and hints: "tutor.mode.<id>" and "tutor.hint.<id>" in i18n.js. The kickoff is sent to Claude.
const TUTOR_MODES = {
  tutor: { kickoff: "Let's start the session." },
  corrector: {},
  conversation: {},
  song: {},
  reading: {},
};

const tutor = Object.assign({ mode: "tutor", model: "claude-opus-5-5", lang: t("tutor.defaultLang"), remember: true }, store.get("tutor", {}));
const saveTutor = () => store.set("tutor", { mode: tutor.mode, model: tutor.model, lang: tutor.lang, remember: tutor.remember });
let tutorChats = store.get("tutorChats", {});
let tutorStream = null;
let memoryKey = "";

const keyStore = {
  get() {
    try { return localStorage.getItem(KEY_NAME) || sessionStorage.getItem(KEY_NAME) || memoryKey; } catch (e) { return memoryKey; }
  },
  set(key, remember) {
    memoryKey = key;
    try {
      localStorage.removeItem(KEY_NAME);
      sessionStorage.removeItem(KEY_NAME);
      (remember ? localStorage : sessionStorage).setItem(KEY_NAME, key);
    } catch (e) { /* memory only */ }
  },
  clear() {
    memoryKey = "";
    try { localStorage.removeItem(KEY_NAME); sessionStorage.removeItem(KEY_NAME); } catch (e) { /* nothing stored */ }
  },
};

function keyRemembered() {
  try { return !!localStorage.getItem(KEY_NAME); } catch (e) { return false; }
}
function tutorLevel() {
  return settings.unit === 0 ? "A0 (complete beginner)" : settings.unit <= COURSE.a1Until ? "A1" : "A2";
}
// The system prompt depends only on mode, unit and language, so it stays byte-stable
// for a whole chat (good for prompt caching).
function tutorSystem(mode) {
  const u = UNITS[settings.unit];
  return `You are a ${L} tutor inside a self-study app.
Learner: an adult who speaks ${tutor.lang}. Level: CEFR ${tutorLevel()}. Current unit: ${settings.unit}, "${u.en}". ${COURSE.tutor.course}
How to talk to them:
- They have ADHD: keep replies short (about 8 lines or fewer unless they ask for more), use bullets, one task at a time.
- If they drift off-topic, point it out kindly and offer to "park" it for later.
- Use comparisons with ${tutor.lang} when they genuinely help.
- ${COURSE.tutor.mark}
- Never invent song lyrics or quotes.
- Format with simple Markdown only: **bold**, *italics*, bullet or numbered lists.

${MODE_PROMPTS[mode]}`;
}
function chatFor(mode) {
  if (!tutorChats[mode]) tutorChats[mode] = { messages: [], hidden: [], cost: 0 };
  return tutorChats[mode];
}
const saveChats = () => store.set("tutorChats", tutorChats);

function estimateCost(model, usage) {
  const m = TUTOR_MODELS[model];
  if (!m || !usage) return 0;
  const cacheWrite = (usage.cache_creation_input_tokens || 0) * m.in * 1.25;
  const cacheRead = (usage.cache_read_input_tokens || 0) * m.cacheRead;
  return ((usage.input_tokens || 0) * m.in + (usage.output_tokens || 0) * m.out + cacheWrite + cacheRead) / 1e6;
}

// Minimal, safe Markdown: escape first, then add a few inline styles and lists.
function renderMd(text) {
  const inline = (s) => s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>");
  const out = [];
  let list = null;
  escapeHtml(text).split("\n").forEach((line) => {
    const ul = line.match(/^\s*[-•*]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    const kind = ul ? "ul" : ol ? "ol" : null;
    if (list && list !== kind) { out.push(`</${list}>`); list = null; }
    if (kind) {
      if (!list) { out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
    } else if (line.trim()) {
      out.push(`<p>${inline(line)}</p>`);
    }
  });
  if (list) out.push(`</${list}>`);
  return out.join("");
}
const blocksText = (content) => (typeof content === "string" ? content
  : content.filter((b) => b.type === "text").map((b) => b.text).join(""));

let sdkPromise = null;
function loadSdk() {
  if (!sdkPromise) sdkPromise = import(SDK_URL).then((m) => m.default).catch((e) => { sdkPromise = null; throw e; });
  return sdkPromise;
}

function claudeAiPrompt(mode) {
  const kickoff = mode === "conversation" ? `Scenario: you are ${scenarios()[0]}.` : TUTOR_MODES[mode].kickoff || "I'll paste my text next.";
  return `${tutorSystem(mode)}\n\n---\n${kickoff}`;
}

function renderTutor() {
  const root = $("#tab-tutor");
  const hasKey = !!keyStore.get();
  const level = settings.unit === 0 ? t("tutor.beginner") : tutorLevel();
  root.innerHTML = `
    <div class="panel">
      <h2>${t("tutor.title")} <span class="muted" style="font-size:0.85rem;font-weight:400">· ${t("common.unit", { n: settings.unit })} · ${level}</span></h2>
      <div class="picks" id="tm-modes">${Object.keys(TUTOR_MODES).map((id) =>
        `<button class="small ${id === tutor.mode ? "primary" : ""}" data-mode="${id}">${t("tutor.mode." + id)}</button>`).join("")}</div>
      <p class="muted" style="margin-bottom:0">${escapeHtml(t("tutor.hint." + tutor.mode))}</p>
    </div>
    ${hasKey ? `<div id="tm-chat" class="chat"></div><div class="panel" id="tm-compose"></div>` : tutorSetupHtml()}
    <details class="panel" id="tm-settings">
      <summary><b>${t("tutor.settings")}</b></summary>
      <div class="row" style="margin-top:12px">
        <label>${t("tutor.model")} <select id="tm-model">${Object.entries(TUTOR_MODELS).map(([id, m]) =>
          `<option value="${id}" ${id === tutor.model ? "selected" : ""}>${m.name} · ${t("tutor.tier." + m.tier)} ${t("tutor.price", { in: m.in, out: m.out })}</option>`).join("")}</select></label>
        <label>${t("tutor.yourLang")} <input type="text" id="tm-lang" value="${escapeHtml(tutor.lang)}" style="width:140px"></label>
      </div>
      <p class="muted">${t("tutor.modelHelp")}</p>
      ${hasKey ? `<p class="muted">${keyRemembered() ? t("tutor.keyDevice") : t("tutor.keyTab")}
        <button class="small" id="tm-forget">${t("tutor.forget")}</button></p>` : ""}
      <p><button class="small" id="tm-copy">${t("tutor.copy")}</button>
        <span class="muted">${t("tutor.copyHelp")}</span></p>
      <textarea id="tm-copybox" readonly style="display:none"></textarea>
    </details>`;

  $$("#tm-modes [data-mode]").forEach((b) => (b.onclick = () => { tutor.mode = b.dataset.mode; saveTutor(); renderTutor(); }));
  $("#tm-model").onchange = (e) => { tutor.model = e.target.value; saveTutor(); };
  $("#tm-lang").onchange = (e) => { tutor.lang = e.target.value.trim() || t("tutor.defaultLang"); saveTutor(); };
  $("#tm-copy").onclick = () => copyForClaudeAi(tutor.mode);
  if ($("#tm-forget")) $("#tm-forget").onclick = () => { keyStore.clear(); renderTutor(); };
  if (hasKey) { renderTutorChat(); renderCompose(); } else bindSetup();
}

function tutorSetupHtml() {
  return `
    <div class="panel" id="tm-setup">
      <h3 style="margin-top:0">${t("tutor.twoWays")}</h3>
      <div class="grid">
        <div>
          <b>${t("tutor.wayA")}</b>
          <p class="muted">${t("tutor.wayAHelp")}</p>
          <button id="tm-copy2">${t("tutor.copyOpen")}</button>
        </div>
        <div>
          <b>${t("tutor.wayB")}</b>
          <p class="muted">${t("tutor.wayBHelp", { console: '<a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener">Claude Console</a>' })}</p>
          <input type="password" id="tm-key" placeholder="sk-ant-…" autocomplete="off" style="width:100%">
          <label class="check"><input type="checkbox" id="tm-remember" ${tutor.remember ? "checked" : ""}> ${t("tutor.remember")}</label>
          <button class="primary" id="tm-save">${t("tutor.saveKey")}</button> <span id="tm-keymsg" class="muted"></span>
          <p class="muted" style="font-size:0.8rem">${t("tutor.keyPrivacy")}</p>
        </div>
      </div>
    </div>`;
}
function bindSetup() {
  $("#tm-copy2").onclick = () => copyForClaudeAi(tutor.mode, true);
  $("#tm-save").onclick = () => {
    const key = $("#tm-key").value.trim();
    if (!/^sk-ant-/.test(key)) { $("#tm-keymsg").textContent = t("tutor.badKey"); return; }
    tutor.remember = $("#tm-remember").checked; saveTutor();
    keyStore.set(key, tutor.remember);
    renderTutor();
  };
}

async function copyForClaudeAi(mode, open) {
  const text = claudeAiPrompt(mode);
  let copied = false;
  try { await navigator.clipboard.writeText(text); copied = true; } catch (e) { /* show it instead */ }
  const box = $("#tm-copybox");
  if (!copied && box) {
    $("#tm-settings").open = true;
    box.style.display = "block"; box.value = text; box.select();
  }
  if (open) window.open("https://claude.ai/new", "_blank", "noopener");
  if (copied) toast(open ? t("tutor.copiedOpen") : t("tutor.copied"));
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function renderTutorChat() {
  const box = $("#tm-chat");
  if (!box) return;
  const chat = chatFor(tutor.mode);
  box.innerHTML = chat.messages.map((m, i) => {
    if (chat.hidden.includes(i)) return `<div class="msg note">${t("tutor.started")}</div>`;
    return m.role === "user"
      ? `<div class="msg user">${renderMd(m.content)}</div>`
      : `<div class="msg ai">${renderMd(blocksText(m.content))}</div>`;
  }).join("");
}

function renderCompose() {
  const box = $("#tm-compose");
  const chat = chatFor(tutor.mode);
  const empty = chat.messages.length === 0;
  const starter = !empty ? "" : tutor.mode === "tutor"
    ? `<button class="primary" id="tm-start">${t("tutor.startUnit", { n: settings.unit })}</button>`
    : tutor.mode === "conversation"
      ? `<div class="row"><label>${t("tutor.scenario")} <select id="tm-scn">${scenarios().map((s) => `<option>${escapeHtml(s)}</option>`).join("")}<option value="">${t("tutor.other")}</option></select></label>
         <input type="text" id="tm-scn-own" placeholder="${t("tutor.ownPh")}" style="flex:1;min-width:160px">
         <button class="primary" id="tm-start">${t("tutor.start")}</button></div>`
      : "";
  box.innerHTML = `
    ${starter}
    <textarea id="tm-input" placeholder="${empty && starter ? t("tutor.orType") : t("tutor.writePh")}" style="min-height:70px;margin-top:${starter ? "10px" : "0"}"></textarea>
    <div class="row" style="justify-content:space-between;margin-top:8px">
      <div class="row">
        <button class="primary" id="tm-send">${t("tutor.send")}</button>
        <button id="tm-stop" style="display:none">${t("tutor.stop")}</button>
        <button class="small" id="tm-new">${t("tutor.newChat")}</button>
      </div>
      <span class="muted" id="tm-cost">${chat.cost ? t("tutor.cost", { cost: chat.cost.toFixed(3) }) : ""}</span>
    </div>
    <div id="tm-status" class="muted"></div>`;
  const input = $("#tm-input");
  $("#tm-send").onclick = () => { const t = input.value.trim(); if (t) { input.value = ""; tutorSend(t); } };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("#tm-send").click(); }
  });
  $("#tm-stop").onclick = () => { if (tutorStream) tutorStream.abort(); };
  $("#tm-new").onclick = () => { delete tutorChats[tutor.mode]; saveChats(); renderTutor(); };
  if ($("#tm-start")) $("#tm-start").onclick = () => {
    if (tutor.mode === "conversation") {
      const own = $("#tm-scn-own").value.trim();
      tutorSend(`Scenario: you are ${own || $("#tm-scn").value || scenarios()[0]}. Start the scene.`, { hidden: true });
    } else {
      tutorSend(TUTOR_MODES.tutor.kickoff, { hidden: true });
    }
  };
}

async function tutorSend(text, opts = {}) {
  if (tutorStream) return; // one reply at a time
  const mode = tutor.mode;
  const model = tutor.model;
  const chat = chatFor(mode);
  chat.messages.push({ role: "user", content: text });
  if (opts.hidden) chat.hidden.push(chat.messages.length - 1);
  // The conversation is append-only: earlier turns (including Claude's own content
  // blocks) are always sent back unchanged.
  const rollback = () => {
    chat.messages.pop();
    if (opts.hidden) chat.hidden.pop();
    saveChats();
  };
  renderTutorChat();
  renderCompose(); // the chat is no longer empty, so the starter buttons go away
  const chatBox = $("#tm-chat");
  const bubble = document.createElement("div");
  bubble.className = "msg ai pending";
  bubble.textContent = "…";
  chatBox.appendChild(bubble);
  bubble.scrollIntoView({ block: "nearest" });
  $("#tm-send").disabled = true;
  $("#tm-stop").style.display = "";
  $("#tm-status").textContent = "";

  const info = TUTOR_MODELS[model];
  const params = {
    model,
    max_tokens: 16000,
    system: tutorSystem(mode),
    messages: chat.messages,
    output_config: { effort: "low" },
    cache_control: { type: "ephemeral" },
  };
  if (info.fallbacks) {
    // If Claude declines on a safety classifier, the API retries on its recommended fallback model.
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }

  let Anthropic;
  try {
    Anthropic = await loadSdk();
  } catch (e) {
    rollback(); bubble.remove(); finishSend();
    $("#tm-status").textContent = t("tutor.sdkFailed");
    return;
  }
  const client = new Anthropic({ apiKey: keyStore.get(), dangerouslyAllowBrowser: true });
  let acc = "";
  try {
    tutorStream = client.beta.messages.stream(params);
    tutorStream.on("text", (delta) => {
      acc += delta;
      bubble.classList.remove("pending");
      bubble.innerHTML = renderMd(acc);
    });
    const msg = await tutorStream.finalMessage();
    if (msg.stop_reason === "refusal") {
      // A declined turn isn't kept: drop any partial text and the question.
      rollback();
      bubble.className = "msg note";
      bubble.textContent = t("tutor.declined");
      if (!opts.hidden) $("#tm-input").value = text;
    } else {
      chat.messages.push({ role: "assistant", content: msg.content });
      chat.cost += estimateCost(model, msg.usage);
      saveChats();
      bubble.classList.remove("pending");
      bubble.innerHTML = renderMd(blocksText(msg.content));
      if (msg.content.some((b) => b.type === "fallback")) $("#tm-status").textContent = t("tutor.fallback", { model: msg.model });
      if (msg.stop_reason === "max_tokens") $("#tm-status").textContent = t("tutor.cutOff");
      $("#tm-cost").textContent = t("tutor.cost", { cost: chat.cost.toFixed(3) });
      markStudied();
    }
  } catch (err) {
    rollback();
    bubble.remove();
    if (!opts.hidden) $("#tm-input").value = text;
    $("#tm-status").textContent = tutorError(Anthropic, err);
  } finally {
    finishSend();
  }
}
function finishSend() {
  tutorStream = null;
  if ($("#tm-send")) $("#tm-send").disabled = false;
  if ($("#tm-stop")) $("#tm-stop").style.display = "none";
}
function tutorError(Anthropic, err) {
  if (Anthropic.APIUserAbortError && err instanceof Anthropic.APIUserAbortError) return t("tutor.err.stopped");
  if (err instanceof Anthropic.AuthenticationError) return t("tutor.err.auth");
  if (err instanceof Anthropic.PermissionDeniedError) return t("tutor.err.permission");
  if (err instanceof Anthropic.RateLimitError) return t("tutor.err.rate");
  if (err instanceof Anthropic.BadRequestError) return t("tutor.err.bad", { msg: err.message }); // e.g. credit balance too low
  if (err instanceof Anthropic.APIConnectionError) return t("tutor.err.connection");
  if (err instanceof Anthropic.APIError) return t("tutor.err.api", { status: err.status ?? "", msg: err.message });
  return t("tutor.err.other", { msg: err.message || err });
}

// ───────────────────────── theme ─────────────────────────
// Auto (follow the device) → Light → Dark. Stored as "llc.theme", shared with the course site.
const THEME_KEY = "llc.theme";
const THEME_ORDER = ["auto", "light", "dark"];
let theme = readGlobal(THEME_KEY) || "auto";
function renderThemeButton() {
  const btn = $("#theme-toggle");
  btn.textContent = t("theme." + theme);
  btn.setAttribute("aria-label", t("theme.aria", { theme: t("theme." + theme) }));
}
function setupThemeToggle() {
  $("#theme-toggle").onclick = () => {
    theme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    writeGlobal(THEME_KEY, theme);
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
    renderThemeButton();
  };
}

// ───────────────────────── course & language pickers ─────────────────────────
function setupPickers() {
  // Switching course reloads: all state above is built for one course.
  $("#course-select").onchange = (e) => { writeGlobal("llc.course", e.target.value); location.reload(); };
  $("#lang-select").onchange = (e) => setLang(e.target.value);
}
// Static text in index.html, the pickers and the theme button, in the current language.
function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t("app.title");
  $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  const cs = $("#course-select");
  cs.innerHTML = window.LLC_COURSES.map((c) => `<option value="${c.id}" ${c === COURSE ? "selected" : ""}>${c.flag} ${escapeHtml(local(c.label))}</option>`).join("")
    + `<option disabled>${t("top.moreCourses")}</option>`;
  cs.setAttribute("aria-label", t("top.course"));
  $("#lang-select").value = lang;
  $("#lang-select").setAttribute("aria-label", t("top.language"));
  renderThemeButton();
}
function setLang(next) {
  // The tutor's "your language" follows the interface unless the learner typed their own.
  const followsInterface = tutor.lang === t("tutor.defaultLang");
  lang = LANGS.includes(next) ? next : "en";
  writeGlobal("llc.lang", lang);
  if (followsInterface) { tutor.lang = t("tutor.defaultLang"); saveTutor(); }
  applyLanguage();
  showTab(currentTab);
}

// ───────────────────────── boot ─────────────────────────
const RENDER = { today: renderToday, cards: renderCards, conj: renderConj, gender: renderGender, numbers: renderNumbers, songs: renderSongs, tutor: renderTutor };
let currentTab = "today";
function showTab(name) {
  currentTab = name;
  $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
  try { sessionStorage.setItem(PREFIX + "tab", name); } catch (e) { /* ignore */ }
  RENDER[name]();
}
$$("#tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
// Only show the drills this course has.
$$("#tabs button").forEach((b) => (b.hidden = !COURSE.tabs.includes(b.dataset.tab)));
tts.init();
setupAccentBar();
setupThemeToggle();
setupPickers();
applyLanguage();
let startTab = "today";
try { startTab = sessionStorage.getItem(PREFIX + "tab") || "today"; } catch (e) { /* ignore */ }
showTab(RENDER[startTab] && COURSE.tabs.includes(startTab) ? startTab : "today");

// Exposed for tests (see app/test.mjs)
window.__fr = { schedule, frenchNumber, conjugate, genderHint, stripArticle, compare, tokenize, renderMd, tutorSystem, claudeAiPrompt, estimateCost, formatDelay, exportAll: () => store.exportAll() };
