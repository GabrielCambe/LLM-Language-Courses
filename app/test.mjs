// Smoke + logic tests for the study app.
// Run: npx playwright --version >/dev/null && node app/test.mjs
// (needs the "playwright" package; with a global install use NODE_PATH="$(npm root -g)")
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright not found. Install it with `npm i -D playwright` or set NODE_PATH.");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(here, "index.html")).href;
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url);

let failed = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`}`);
};

// ── Numbers ──
const nums = await page.evaluate(() => {
  const f = window.__fr.frenchNumber;
  return {
    21: f(21), 71: f(71), 77: f(77), 80: f(80), 81: f(81), 91: f(91), 99: f(99),
    200: f(200), 201: f(201), 280: f(280), 1000: f(1000), 1995: f(1995), 2026: f(2026), 80000: f(80000),
    be71: f(71, "be"), be95: f(95, "be"), be80: f(80, "be"), ch80: f(80, "ch"), ch81: f(81, "ch"),
  };
});
eq("21", nums[21], "vingt et un");
eq("71", nums[71], "soixante et onze");
eq("77", nums[77], "soixante-dix-sept");
eq("80", nums[80], "quatre-vingts");
eq("81", nums[81], "quatre-vingt-un");
eq("91", nums[91], "quatre-vingt-onze");
eq("99", nums[99], "quatre-vingt-dix-neuf");
eq("200", nums[200], "deux cents");
eq("201", nums[201], "deux cent un");
eq("280", nums[280], "deux cent quatre-vingts");
eq("1000", nums[1000], "mille");
eq("1995", nums[1995], "mille neuf cent quatre-vingt-quinze");
eq("2026", nums[2026], "deux mille vingt-six");
eq("80000", nums[80000], "quatre-vingt mille");
eq("BE 71", nums.be71, "septante et un");
eq("BE 95 (Nonante-Cinq!)", nums.be95, "nonante-cinq");
eq("BE 80", nums.be80, "quatre-vingts");
eq("CH 80", nums.ch80, "huitante");
eq("CH 81", nums.ch81, "huitante et un");

// ── Conjugation ──
const conj = await page.evaluate(() => {
  const V = (inf) => window.FR_VERBS.find((v) => v.inf === inf);
  const c = window.__fr.conjugate;
  return {
    mangerImpNous: c(V("manger"), "imparfait", 3).display,
    mangerImpJe: c(V("manger"), "imparfait", 0).display,
    commencerImpVous: c(V("commencer"), "imparfait", 4).display,
    etreImp: c(V("être"), "imparfait", 5).display,
    faireImp: c(V("faire"), "imparfait", 0).display,
    allerPC: c(V("aller"), "passeCompose", 5).answers,
    allerPCje: c(V("aller"), "passeCompose", 0).display,
    parlerPC: c(V("parler"), "passeCompose", 0).display,
    venirFut: c(V("venir"), "futurSimple", 3).display,
    prendreFut: c(V("prendre"), "futurSimple", 0).display,
    proche: c(V("partir"), "futurProche", 1).display,
  };
});
eq("nous mangions", conj.mangerImpNous, "mangions");
eq("je mangeais", conj.mangerImpJe, "mangeais");
eq("vous commenciez", conj.commencerImpVous, "commenciez");
eq("ils étaient", conj.etreImp, "étaient");
eq("je faisais", conj.faireImp, "faisais");
eq("ils sont allés/allées", conj.allerPC, ["sont allés", "sont allées"]);
eq("je suis allé(e)", conj.allerPCje, "suis allé(e)");
eq("j'ai parlé", conj.parlerPC, "ai parlé");
eq("nous viendrons", conj.venirFut, "viendrons");
eq("je prendrai", conj.prendreFut, "prendrai");
eq("tu vas partir", conj.proche, "vas partir");

// ── Scheduler, gender hints, compare ──
const misc = await page.evaluate(() => {
  const { schedule, genderHint, stripArticle, compare } = window.__fr;
  const DAY = 864e5;
  const now = 0;
  const g1 = schedule(null, 2, now);
  const g2 = schedule(g1, 2, now);
  const g3 = schedule(g2, 2, now);
  const again = schedule(g3, 0, now);
  return {
    intervals: [g1.interval, g2.interval, g3.interval],
    againDueMin: Math.round(again.due / 60000), againReps: again.reps,
    hardNew: Math.round(schedule(null, 1, now).due / 60000),
    easyNew: schedule(null, 3, now).interval,
    plage: genderHint("plage", "f").startsWith("<b>Exception!"),
    nation: genderHint("télévision", "f").includes("-sion"),
    strip: [stripArticle("l'eau"), stripArticle("la chanson")],
    cmp: [compare("Étais", ["étais"]), compare("etais", ["étais"]), compare("suis", ["es"])],
    g1DueHours: Math.round(g1.due / 36e5),
  };
});
eq("Good intervals 1 → 3 → 8 days", misc.intervals, [1, 3, 8]);
eq("Again = 1 min, reset", [misc.againDueMin, misc.againReps], [1, 0]);
eq("Hard on new card = 10 min", misc.hardNew, 10);
eq("Easy on new card = 4 days", misc.easyNew, 4);
eq("la plage flagged as exception", misc.plage, true);
eq("-sion rule", misc.nation, true);
eq("strip article", misc.strip, ["eau", "chanson"]);
eq("compare ok/accent/no", misc.cmp, ["ok", "accent", "no"]);
eq("1-day card due 20h later", misc.g1DueHours, 20);

// ── UI smoke test: every tab renders, a flashcard can be reviewed ──
for (const tab of ["cards", "conj", "gender", "numbers", "songs", "today"]) {
  await page.click(`#tabs button[data-tab=${tab}]`);
  const html = await page.$eval(`#tab-${tab}`, (el) => el.innerHTML.length);
  eq(`tab ${tab} renders`, html > 100, true);
}
await page.click("#tabs button[data-tab=cards]");
const first = await page.$eval("#fc-card .prompt", (el) => el.textContent.trim());
eq("first unit-0 card is 'le vin'", first.startsWith("le vin"), true);
await page.fill("#fc-typed", "wine");
await page.keyboard.press("Enter");
eq("typed answer matches", await page.$eval("#fc-back .feedback", (el) => el.className), "feedback ok");
await page.keyboard.press("3"); // Good
const after = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("llc.fr.srs"))));
eq("review saved (FR→EN only; EN→FR waits until it graduates)", after, ["le vin|fr2en"]);

// Conjugation flow
await page.click("#tabs button[data-tab=conj]");
await page.fill("#conj-in", "zzz");
await page.keyboard.press("Enter");
eq("conj feedback shown", (await page.$eval("#conj-fb", (el) => el.textContent)).includes("Not quite"), true);
eq("conj button turns into Next", await page.textContent("#conj-go"), "Next (Enter)");
await page.click("#conj-go");
eq("Next button gives a new question", [await page.textContent("#conj-fb"), await page.textContent("#conj-go"), await page.inputValue("#conj-in")], ["", "Check (Enter)", ""]);
await page.fill("#conj-in", "zzz");
await page.click("#conj-go");
eq("Check button checks without Enter", (await page.textContent("#conj-fb")).includes("Not quite"), true);

// Numbers: the same Check → Next button
await page.click("#tabs button[data-tab=numbers]");
await page.click("#num-go");
eq("numbers: Check with an empty answer does nothing", [await page.textContent("#num-fb"), await page.textContent("#num-go")], ["", "Check (Enter)"]);
await page.fill("#num-in", "123456");
await page.click("#num-go");
eq("numbers: Check button shows the answer", [(await page.textContent("#num-fb")).includes("="), await page.textContent("#num-go")], [true, "Next (Enter)"]);
await page.click("#num-go");
eq("numbers: Next button gives a new number", [await page.textContent("#num-fb"), await page.inputValue("#num-in")], ["", ""]);
await page.fill("#num-in", "1");
await page.keyboard.press("Enter");
eq("numbers: Enter still works", await page.textContent("#num-go"), "Next (Enter)");

// Song workshop: add a song, cloze renders, HTML is escaped
await page.click("#tabs button[data-tab=songs]");
await page.fill("#sf-title", "<b>Test</b>");
await page.fill("#sf-lyrics", "Je ne sais pas pourquoi\nOn danse <script>x</script> toujours");
await page.click("#sf-save");
eq("lyrics escaped", await page.$eval("#song-body", (el) => el.querySelector("script") === null), true);
await page.click("[data-mode=cloze]");
await page.selectOption("#cz-density", "func");
eq("cloze page renders", await page.$eval("#song-body .lyrics", (el) => el.textContent.includes("pourquoi") || el.querySelectorAll("input.gap").length > 0), true);

// Theme toggle: Auto → Light → Dark → Auto, applied to the page and remembered
const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
eq("theme starts on Auto", await page.$eval("#theme-toggle", (b) => b.textContent), "🌓 Auto");
await page.click("#theme-toggle");
eq("Light forced", await page.evaluate(() => document.documentElement.dataset.theme), "light");
await page.click("#theme-toggle");
eq("Dark forced", await page.evaluate(() => document.documentElement.dataset.theme), "dark");
eq("dark background applied", await bg(), "rgb(21, 22, 26)");
await page.reload();
eq("dark remembered after reload", [await page.evaluate(() => document.documentElement.dataset.theme), await bg()], ["dark", "rgb(21, 22, 26)"]);
await page.click("#theme-toggle");
eq("back to Auto", [await page.evaluate(() => document.documentElement.hasAttribute("data-theme")), await page.$eval("#theme-toggle", (b) => b.textContent)], [false, "🌓 Auto"]);
const darkDevice = await browser.newPage({ colorScheme: "dark" });
await darkDevice.addInitScript(() => localStorage.setItem("llc.theme", "light"));
await darkDevice.goto(url);
eq("Light overrides a dark device", await darkDevice.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(247, 245, 240)");
await darkDevice.close();

// Stale-cache safety: browsers cache each file separately (GitHub Pages: 10 min), so a phone can
// combine a new index.html with an old app.js. The toggle must be visible without JS, and all
// local assets must share one ?v= tag so an update refetches them together.
const { readFileSync } = await import("fs");
const html = readFileSync(path.join(here, "index.html"), "utf8");
eq("theme button has a label without JS", /<button id="theme-toggle"[^>]*>[^<]+<\/button>/.test(html), true);
const assets = [...html.matchAll(/(?:src|href)="((?!https?:)[^"]+\.(?:js|css)[^"]*)"/g)].map((m) => m[1]);
const versions = new Set(assets.map((a) => (a.match(/\?v=([^"&]+)/) || [])[1]));
eq(`all ${assets.length} local assets share one ?v= tag`, [versions.size, versions.has(undefined)], [1, false]);
const stale = await browser.newPage({ viewport: { width: 360, height: 700 } });
await stale.route(/app\.js/, (r) => r.fulfill({ contentType: "text/javascript", body: "/* old cached app.js */" }));
await stale.goto(url);
eq("button still visible with a stale app.js", await stale.$eval("#theme-toggle", (b) => [b.textContent, b.offsetWidth > 40]), ["🌓 Auto", true]);
eq("course and language pickers still usable with a stale app.js",
  [await stale.$eval("#course-select", (s) => s.options.length), await stale.$eval("#lang-select", (s) => [...s.options].map((o) => o.value))], [3, ["en", "pt-BR"]]);
await stale.close();

// ── Tutor (Claude) against a mocked API: request shape, append-only history, errors ──
{
  const t = await browser.newPage({ viewport: { width: 390, height: 800 } });
  const tErrors = [];
  t.on("pageerror", (e) => tErrors.push(e.message));
  const sent = [];
  let mode = "ok";
  const sse = (text) => [
    ["message_start", { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1000, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 50 } }],
    ["message_stop", { type: "message_stop" }],
  ].map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("");
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" };
  await t.route("https://api.anthropic.com/**", async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    sent.push({ headers: req.headers(), body: req.postDataJSON() });
    if (mode === "401") {
      return route.fulfill({ status: 401, headers: { ...cors, "content-type": "application/json" },
        body: JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }) });
    }
    return route.fulfill({ status: 200, headers: { ...cors, "content-type": "text/event-stream" }, body: sse(`**Bonjour** ! Reply ${sent.length}.`) });
  });
  await t.goto(url);
  await t.click("#tabs button[data-tab=tutor]");
  eq("tutor: setup shown without a key", !!(await t.$("#tm-setup")), true);
  await t.fill("#tm-key", "not-a-key");
  await t.click("#tm-save");
  eq("tutor: rejects a malformed key", (await t.textContent("#tm-keymsg")).includes("sk-ant-"), true);
  await t.fill("#tm-key", "sk-ant-test-123");
  await t.click("#tm-save");
  const stored = await t.evaluate(() => [localStorage.getItem("llc.secret.anthropicKey"), JSON.stringify(window.__fr.exportAll()).includes("sk-ant")]);
  eq("tutor: key saved locally, never in backups", stored, ["sk-ant-test-123", false]);

  await t.click("#tm-start");
  await t.waitForSelector(".msg.ai:not(.pending) strong");
  const r1 = sent[0];
  eq("tutor: browser call carries key + direct-browser header", [r1.headers["x-api-key"], r1.headers["anthropic-dangerous-direct-browser-access"]], ["sk-ant-test-123", "true"]);
  eq("tutor: Opus 5.5, streaming, low effort, default fallbacks",
    [r1.body.model, r1.body.stream, r1.body.output_config.effort, r1.body.fallbacks, (r1.headers["anthropic-beta"] || "").includes("server-side-fallback-2026-07-01")],
    ["claude-opus-5-5", true, "low", "default", true]);
  eq("tutor: system prompt knows the unit", r1.body.system.includes('Current unit: 0, "The sound system"'), true);
  eq("tutor: kickoff hidden in the chat", await t.$$eval(".msg", (m) => m.map((x) => x.className)), ["msg note", "msg ai"]);

  await t.fill("#tm-input", "Merci <script>alert(1)</script>");
  await t.press("#tm-input", "Enter");
  await t.waitForFunction(() => document.querySelectorAll(".msg.ai:not(.pending)").length === 2);
  const r2 = sent[1].body.messages;
  eq("tutor: history is append-only (assistant content blocks echoed)",
    [r2.length, r2[1].role, r2[1].content[0].type, r2[1].content[0].text], [3, "assistant", "text", "**Bonjour** ! Reply 1."]);
  eq("tutor: user text is escaped", await t.$$eval(".msg.user script", (s) => s.length), 0);
  eq("tutor: cost estimate shown", (await t.textContent("#tm-cost")).startsWith("≈ $"), true);

  await t.evaluate(() => (document.querySelector("#tm-settings").open = true));
  await t.selectOption("#tm-model", "claude-haiku-5-5");
  await t.fill("#tm-input", "Encore");
  await t.click("#tm-send");
  await t.waitForFunction(() => document.querySelectorAll(".msg.ai:not(.pending)").length === 3);
  eq("tutor: Haiku sends no fallbacks", [sent[2].body.model, "fallbacks" in sent[2].body], ["claude-haiku-5-5", false]);

  mode = "401";
  await t.fill("#tm-input", "Une question");
  await t.click("#tm-send");
  await t.waitForFunction(() => document.querySelector("#tm-status").textContent.length > 0);
  eq("tutor: bad key → clear message, question kept for retry, history unchanged",
    [(await t.textContent("#tm-status")).includes("rejected"), await t.inputValue("#tm-input"),
     await t.evaluate(() => JSON.parse(localStorage.getItem("llc.fr.tutorChats")).tutor.messages.length)],
    [true, "Une question", 6]);

  await t.reload();
  await t.click("#tabs button[data-tab=tutor]");
  eq("tutor: chat survives a reload", await t.$$eval(".msg.ai", (m) => m.length), 3);
  eq("tutor: Claude.ai prompt includes unit + mode", await t.evaluate(() => {
    const p = window.__fr.claudeAiPrompt("corrector"); return p.includes("MODE: Corrector") && p.includes("Current unit: 0");
  }), true);
  eq("tutor: no page errors", tErrors, []);
  await t.close();
}

eq("no page errors", errors, []);

// ── Interface language: English ↔ Português (BR) ──
{
  const p = await browser.newPage();
  const pErrors = [];
  p.on("pageerror", (e) => pErrors.push(e.message));
  await p.goto(url);
  const keys = await p.evaluate(() => [Object.keys(window.LLC_I18N.en), Object.keys(window.LLC_I18N["pt-BR"])]);
  eq("pt-BR has every English key", keys[0].filter((k) => !keys[1].includes(k)), []);
  eq("pt-BR has no extra keys", keys[1].filter((k) => !keys[0].includes(k)), []);
  eq("English by default (device in English)", [await p.textContent("#tabs [data-tab=today]"), await p.inputValue("#lang-select")], ["Today", "en"]);

  await p.selectOption("#lang-select", "pt-BR");
  eq("switching language translates the page without a reload",
    [await p.textContent("#tabs [data-tab=today]"), await p.evaluate(() => [document.documentElement.lang, document.title]),
     (await p.textContent("#tab-today")).includes("Unidade atual"), await p.textContent("#theme-toggle")],
    ["Hoje", ["pt-BR", "Estudo de francês"], true, "🌓 Auto"]);
  eq("tutor answers in the interface language", await p.evaluate(() => window.__fr.tutorSystem("tutor").includes("speaks Brazilian Portuguese")), true);
  eq("tutor prompt to Claude stays in English", await p.evaluate(() => window.__fr.tutorSystem("tutor").includes('Current unit: 0, "The sound system"')), true);

  // No tab shows a raw key like "cards.deck" (a missing translation).
  const allKeys = keys[0];
  const leaks = [];
  for (const tab of ["today", "cards", "conj", "gender", "numbers", "songs", "tutor"]) {
    await p.click(`#tabs button[data-tab=${tab}]`);
    const text = await p.evaluate(() => document.body.innerText + [...document.querySelectorAll("[placeholder], [aria-label], option")]
      .map((el) => [el.placeholder, el.getAttribute("aria-label"), el.textContent].join(" ")).join(" "));
    allKeys.filter((k) => k.includes(".") && text.includes(k)).forEach((k) => leaks.push(`${tab}: ${k}`));
  }
  eq("no untranslated keys on any tab", leaks, []);
  await p.click("#tabs button[data-tab=cards]");
  await p.keyboard.press("Enter");
  eq("rating buttons translated", await p.$$eval("#fc-back .rate button", (b) => b.map((x) => x.firstChild.textContent)), ["De novo", "Difícil", "Bom", "Fácil"]);
  eq("gender hint translated", await p.evaluate(() => window.__fr.genderHint("plage", "f")), "<b>Exceção!</b> Palavras terminadas em -age costumam ser masculinas, mas esta é feminina.");

  await p.reload();
  eq("language remembered after reload", [await p.textContent("#tabs [data-tab=today]"), await p.inputValue("#lang-select")], ["Hoje", "pt-BR"]);
  await p.selectOption("#lang-select", "en");
  eq("back to English", [await p.textContent("#tabs [data-tab=today]"), await p.evaluate(() => window.__fr.tutorSystem("tutor").includes("speaks English"))], ["Today", true]);
  eq("language: no page errors", pErrors, []);
  await p.close();

  const ptDevice = await browser.newPage({ locale: "pt-BR" });
  await ptDevice.goto(url);
  eq("first visit on a Portuguese device opens in Portuguese", await ptDevice.textContent("#tabs [data-tab=today]"), "Hoje");
  await ptDevice.close();
}

// ── Course selector: progress, units and tabs are per course ──
{
  const p = await browser.newPage();
  const pErrors = [];
  p.on("pageerror", (e) => pErrors.push(e.message));
  // A made-up second course, appended to the real registry.
  await p.route(/data\/courses\.js/, async (route) => {
    const body = readFileSync(path.join(here, "data", "courses.js"), "utf8") + `
      window.LLC_COURSES.push({ id: "xx", flag: "🏳️", label: { en: "Testish", "pt-BR": "Testês" }, name: { en: "Testish", "pt-BR": "testês" },
        folder: "testish", storagePrefix: "llc.xx.", voiceLang: "es-ES", voiceSample: "Hola", accents: "á ñ",
        tabs: ["today", "cards", "songs"], vocab: { 0: [["el gato", "cat", "m", ""]] }, verbs: [], tenses: [],
        units: [{ en: "Test unit", "pt-BR": "Unidade teste" }], a1Until: 1,
        tutor: { course: "", mark: "", song: "", reading: "" }, scenarios: { en: ["a test"] } });`;
    await route.fulfill({ contentType: "text/javascript", body });
  });
  await p.goto(url);
  eq("course picker lists the courses", await p.$$eval("#course-select option", (o) => o.map((x) => [x.value || "", x.disabled])),
    [["fr", false], ["la", false], ["pl", false], ["xx", false], ["➕ More soon", true]]);
  eq("French is the default course", await p.inputValue("#course-select"), "fr");
  await p.evaluate(() => localStorage.setItem("llc.fr.days", JSON.stringify(["2026-01-01"])));

  await Promise.all([p.waitForEvent("load"), p.selectOption("#course-select", "xx")]);
  eq("switching course reloads into it", [await p.inputValue("#course-select"), await p.title()], ["xx", "Testish Study App"]);
  eq("only the course's own tabs are shown", await p.$$eval("#tabs button", (b) => b.filter((x) => !x.hidden).map((x) => x.dataset.tab)), ["today", "cards", "songs"]);
  eq("units come from the course", (await p.textContent("#tab-today")).includes("Unit 0: Test unit"), true);
  eq("progress starts fresh for a new course", await p.evaluate(() => localStorage.getItem("llc.xx.days")), null);
  await p.click("#tabs button[data-tab=cards]");
  eq("the course's deck is used", (await p.textContent("#fc-card .prompt")).trim().startsWith("el gato"), true);
  eq("accent keys come from the course", await p.$$eval("#accent-bar button", (b) => b.map((x) => x.textContent)), ["á", "ñ"]);

  await Promise.all([p.waitForEvent("load"), p.selectOption("#course-select", "fr")]);
  eq("French progress untouched", await p.evaluate(() => localStorage.getItem("llc.fr.days")), JSON.stringify(["2026-01-01"]));
  eq("course: no page errors", pErrors, []);
  await p.close();
}

// ── Latin and Polish starter courses ──
for (const [id, firstCard, voice, tutorLine] of [
  ["la", "salvē", "it-IT", "You are a Latin tutor"],
  ["pl", "cześć", "pl-PL", "You are a Polish tutor"],
]) {
  const p = await browser.newPage();
  const pErrors = [];
  p.on("pageerror", (e) => pErrors.push(e.message));
  await p.addInitScript((c) => localStorage.setItem("llc.course", c), id);
  await p.goto(url);
  eq(`${id}: course selected, starter tabs only`, [await p.inputValue("#course-select"),
    await p.$$eval("#tabs button", (b) => b.filter((x) => !x.hidden).map((x) => x.dataset.tab))], [id, ["today", "cards", "tutor"]]);
  eq(`${id}: unit link goes to the course roadmap`, await p.$eval("#tab-today a", (a) => a.getAttribute("href")), `../${id === "la" ? "latin" : "polish"}/README.md`);
  await p.click("#tabs button[data-tab=cards]");
  eq(`${id}: first card`, (await p.textContent("#fc-card .prompt")).trim().startsWith(firstCard), true);
  eq(`${id}: no "include the article" hint (no articles)`, await p.evaluate(() => {
    const deck = window.LLC_COURSES.find((c) => c.id === localStorage.getItem("llc.course")).vocab;
    return Object.values(deck).flat().filter((e) => e[2] !== null).length;
  }), 0);
  eq(`${id}: speaks with the course voice`, await p.$eval("#fc-card .speak", (b) => b.dataset.lang), voice);
  const sys = await p.evaluate(() => [window.__fr.tutorSystem("conversation"), window.__fr.claudeAiPrompt("conversation")]);
  eq(`${id}: tutor is about the course language, not French`, [sys[0].includes(tutorLine), /French|Belgi|Angèle/.test(sys.join(" "))], [true, false]);
  await p.click("#tabs button[data-tab=tutor]");
  eq(`${id}: tutor tab renders`, !!(await p.$("#tm-setup")), true);
  eq(`${id}: no page errors`, pErrors, []);
  await p.close();
}

// ── Responsive: no horizontal scrolling on any tab, phone to desktop, in both languages ──
for (const [width, lang] of [[320, "en"], [390, "en"], [768, "en"], [1280, "en"], [320, "pt-BR"], [390, "pt-BR"], [1280, "pt-BR"]]) {
  const p = await browser.newPage({ viewport: { width, height: 800 } });
  await p.addInitScript((l) => localStorage.setItem("llc.lang", l), lang);
  await p.goto(url);
  const overflowing = [];
  for (const tab of ["today", "cards", "conj", "gender", "numbers", "songs", "tutor"]) {
    await p.click(`#tabs button[data-tab=${tab}]`);
    if ((await p.evaluate(() => document.documentElement.scrollWidth)) > width) overflowing.push(tab);
  }
  eq(`no horizontal scroll at ${width}px (${lang})`, overflowing, []);
  await p.close();
}
await browser.close();
console.log(failed ? `\n${failed} test(s) failed` : "\nAll tests passed");
process.exit(failed ? 1 : 0);
