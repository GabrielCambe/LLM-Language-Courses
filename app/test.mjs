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
    allerPCils: c(V("aller"), "passeCompose", 5, "ils").answers,
    allerPCelles: c(V("aller"), "passeCompose", 5, "elles").display,
    allerPCon: c(V("aller"), "passeCompose", 2, "on").answers,
    allerPCje: c(V("aller"), "passeCompose", 0).display,
    etrePresElle: c(V("être"), "present", 2, "elle").display,
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
eq("ils sont allés", conj.allerPCils, ["sont allés"]);
eq("elles sont allées", conj.allerPCelles, "sont allées");
eq("on est allé/allée/allés/allées", conj.allerPCon, ["est allé", "est allée", "est allés", "est allées"]);
eq("elle est", conj.etrePresElle, "est");
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

// ── Conjugation spacing ──
const cs = await page.evaluate(() => {
  const { pickConjKey, conjReview, schedule } = window.__fr;
  const DAY = 864e5;
  const now = 10 * DAY;
  const keys = ["a", "b", "c", "d"];
  const srs = { a: { due: now - 1 }, b: { due: now + DAY }, c: { due: now + DAY } };
  const known = schedule(schedule(null, 2, 0), 2, 0); // 3-day interval, due long before now
  const early = Object.assign({}, known, { due: now + DAY });
  return {
    retryFirst: pickConjKey(keys, srs, [{ key: "c", wait: 0 }], now, null),
    retryWaits: pickConjKey(keys, srs, [{ key: "a", wait: 1 }], now, null).key,
    retryOutsidePool: pickConjKey(keys, srs, [{ key: "zzz", wait: 0 }], now, null),
    dueNext: pickConjKey(keys, srs, [], now, null),
    newBeforeLater: pickConjKey(keys, srs, [], now, "a"),
    notTwiceInARow: pickConjKey(["a", "b"], {}, [], now, "a").key,
    onlyOne: pickConjKey(["a"], {}, [], now, "a").key,
    wrong: conjReview(null, "no", now, false).reps,
    right: conjReview(null, "ok", now, false).interval,
    accentNew: Math.round((conjReview(null, "accent", now, false).due - now) / 60000),
    earlyRightKept: conjReview(early, "ok", now, false) === early,
    earlyWrongCounts: conjReview(early, "no", now, false).lapses,
    retriedRightCounts: conjReview(schedule(null, 0, now), "ok", now + 60000, true).interval,
  };
});
eq("conj: a missed form whose wait is over comes first", cs.retryFirst, { key: "c", kind: "retry" });
eq("conj: a missed form still waiting isn't asked, even if due", cs.retryWaits, "d");
eq("conj: a missed form outside the chosen verbs/tenses is skipped", cs.retryOutsidePool, { key: "a", kind: "due" });
eq("conj: due forms come next", cs.dueNext, { key: "a", kind: "due" });
eq("conj: then never-asked forms, before ones scheduled for later", cs.newBeforeLater, { key: "d", kind: "" });
eq("conj: not the same form twice in a row", cs.notTwiceInARow, "b");
eq("conj: a one-form pool still gives a question", cs.onlyOne, "a");
eq("conj: wrong = Again", cs.wrong, 0);
eq("conj: right on a new form = 1 day", cs.right, 1);
eq("conj: accent slip on a new form = Hard (10 min)", cs.accentNew, 10);
eq("conj: right before it's due keeps the schedule", cs.earlyRightKept, true);
eq("conj: wrong before it's due still counts", cs.earlyWrongCounts, 1);
eq("conj: right on the in-session retry counts", cs.retriedRightCounts, 1);

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
eq("conj score updates as soon as the answer is checked", await page.textContent("#conj-score"), "score 0/1 (0%)");
eq("conj button turns into Next", await page.textContent("#conj-go"), "Next (Enter)");
await page.click("#conj-go");
eq("Next button gives a new question", [await page.textContent("#conj-fb"), await page.textContent("#conj-go"), await page.inputValue("#conj-in")], ["", "Check (Enter)", ""]);
await page.fill("#conj-in", "zzz");
await page.click("#conj-go");
eq("Check button checks without Enter", (await page.textContent("#conj-fb")).includes("Not quite"), true);

// Pronouns that share a form: asked one at a time, the answer lists each on its own line with its own 🔊
{
  const p = await browser.newPage();
  await p.goto(url);
  await p.evaluate(() => {
    localStorage.setItem("llc.fr.conjVerbs", JSON.stringify(["aller"]));
    localStorage.setItem("llc.fr.conjTenses", JSON.stringify(["passeCompose"]));
    // Every person but il/elle/on (2) is scheduled for later, so the drill asks person 2.
    const later = { reps: 1, interval: 5, ease: 2.5, lapses: 0, due: Date.now() + 864e5 };
    localStorage.setItem("llc.fr.conjSrs", JSON.stringify(Object.fromEntries([0, 1, 3, 4, 5].map((n) => ["aller|passeCompose|" + n, later]))));
  });
  await p.reload();
  await p.click("#tabs button[data-tab=conj]");
  const asked = (await p.textContent("#conj-card .prompt")).trim().split(" ")[0];
  eq("one pronoun per question", ["il", "elle", "on"].includes(asked), true);
  const meanings = { il: "he / it", elle: "she / it", on: "we / one" };
  eq("question shows what the pronoun means", await p.textContent("#conj-pron"), `${asked} = ${meanings[asked]}`);
  await p.fill("#conj-in", "zzz");
  await p.keyboard.press("Enter");
  const lines = await p.$$eval("#conj-fb .conj-line", (els) => els.map((el) => [el.firstChild.textContent.trim(), el.querySelector(".pron-meaning").textContent, el.querySelector(".speak").dataset.say]));
  const want = { il: ["il est allé", "(he / it)", "il est allé"], elle: ["elle est allée", "(she / it)", "elle est allée"], on: ["on est allé(e)(s)", "(we / one)", "on est allé"] };
  eq("answer: asked pronoun first, then each other pronoun on its own line with its meaning", lines, [asked, ...["il", "elle", "on"].filter((x) => x !== asked)].map((x) => want[x]));
  await p.close();
}

// Conjugation spacing: a missed form is saved and comes back after CONJ_RETRY_GAP (3) other questions
{
  const p = await browser.newPage();
  await p.goto(url);
  await p.click("#tabs button[data-tab=conj]");
  // il/elle/on (and ils/elles) share one form and take turns at random, so compare the form, not the pronoun.
  const ask = () => p.$eval("#conj-card", (el) => (el.querySelector(".tag").textContent + " " + el.querySelector(".prompt").textContent.trim())
    .replace(/\b(elle|on)\b/, "il").replace(/\belles\b/, "ils"));
  const asked = [];
  for (let i = 0; i < 5; i++) {
    asked.push(await ask());
    if (i === 4) break;
    await p.fill("#conj-in", "zzz");
    await p.keyboard.press("Enter");
    await p.keyboard.press("Enter");
  }
  eq("conj: the 3 questions in between are other forms", new Set(asked.slice(0, 4)).size, 4);
  eq("conj: the missed form comes back 4th question later", asked[4], asked[0]);
  eq("conj: …tagged as missed a moment ago", await p.textContent("#conj-kind"), "↺ missed a moment ago");
  const saved = await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem("llc.fr.conjSrs"))).map((s) => s.lapses));
  eq("conj: each missed form saved with a lapse", saved, [1, 1, 1, 1]);
  eq("conj: forms schedule in backups", Object.keys(await p.evaluate(() => window.__fr.exportAll().conjSrs)).length, 4);
  await p.close();
}

// Numbers: the same Check → Next button
await page.click("#tabs button[data-tab=numbers]");
await page.click("#num-go");
eq("numbers: Check with an empty answer does nothing", [await page.textContent("#num-fb"), await page.textContent("#num-go")], ["", "Check (Enter)"]);
await page.fill("#num-in", "123456");
await page.click("#num-go");
eq("numbers: Check button shows the answer", [(await page.textContent("#num-fb")).includes("="), await page.textContent("#num-go")], [true, "Next (Enter)"]);
await page.click("#num-go");
eq("numbers: score updates on check", (await page.textContent("#num-score")).includes("/1 ("), true);
eq("numbers: Next button gives a new number", [await page.textContent("#num-fb"), await page.inputValue("#num-in")], ["", ""]);
await page.fill("#num-in", "1");
await page.keyboard.press("Enter");
eq("numbers: Enter still works", await page.textContent("#num-go"), "Next (Enter)");

// Song workshop: Find lyrics searches LRCLIB (mocked) and fills the form
const lrclibAsked = [];
await page.route("https://lrclib.net/**", (route) => {
  const req = route.request();
  lrclibAsked.push({ url: new URL(req.url()), client: req.headers()["lrclib-client"] || "" });
  const empty = new URL(req.url()).searchParams.get("q") === "nothing";
  route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(empty ? [] : [
    { trackName: "Instru", artistName: "X", instrumental: true, plainLyrics: null, syncedLyrics: null },
    { trackName: "Flemme <b>", artistName: "Angèle", albumName: "Brol", duration: 185, instrumental: false, plainLyrics: null, syncedLyrics: "[00:01.00] La flemme de bouger\n[00:04.50]Encore" },
  ]) });
});
await page.click("#tabs button[data-tab=songs]");
await page.click("#sf-find");
eq("find lyrics: asks for a title first", await page.textContent("#sf-results"), "Type the song title first (the artist helps too).");
await page.fill("#sf-title", "flemme");
await page.fill("#sf-artist", "angele");
await page.click("#sf-find");
await page.waitForSelector("#sf-results [data-i]");
eq("find lyrics: sends title, artist and the client header", [lrclibAsked[0].url.searchParams.get("track_name"), lrclibAsked[0].url.searchParams.get("artist_name"), lrclibAsked[0].client.startsWith("LLM Language Courses")], ["flemme", "angele", true]);
eq("find lyrics: skips instrumentals, escapes results", await page.$$eval("#sf-results [data-i]", (b) => b.map((x) => x.textContent)), ["Flemme <b> · Angèle · Brol · 3:05"]);
await page.click("#sf-results [data-i]");
eq("find lyrics: fills the form, timestamps removed", [await page.inputValue("#sf-title"), await page.inputValue("#sf-artist"), await page.inputValue("#sf-lyrics")], ["Flemme <b>", "Angèle", "La flemme de bouger\nEncore"]);
await page.fill("#sf-title", "nothing");
await page.fill("#sf-artist", "");
await page.click("#sf-find");
await page.waitForFunction(() => document.querySelector("#sf-results").textContent.startsWith("No lyrics"));
eq("find lyrics: title only uses a free search", lrclibAsked[1].url.searchParams.get("q"), "nothing");
await page.fill("#sf-lyrics", "");

// Song workshop: add a song, cloze renders, HTML is escaped
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
  [await stale.$eval("#course-select", (s) => s.options.length), await stale.$eval("#lang-select", (s) => [...s.options].map((o) => o.value))], [5, ["en", "pt-BR"]]);
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
  eq("tutor: pronunciation prompt has the course's sounds", await t.evaluate(() => {
    const p = window.__fr.claudeAiPrompt("pronounce"); return p.includes("MODE: Pronunciation coach") && p.includes("liaison") && !p.includes("undefined");
  }), true);
  eq("tutor: no page errors", tErrors, []);
  await t.close();
}

eq("no page errors", errors, []);

// Gender: the score updates right after answering
await page.click("#tabs button[data-tab=gender]");
await page.click("#gen-card .gender-btns button[data-g=m]");
eq("gender score updates on answer", (await page.textContent("#gen-score")).includes("/1 ("), true);

// ── Phone: the feedback isn't hidden behind the accent bar while typing ──
for (const tab of ["conj", "numbers"]) {
  // 420 px tall ≈ a phone with its on-screen keyboard open
  const p = await browser.newPage({ viewport: { width: 360, height: 420 } });
  await p.goto(url);
  await p.click(`#tabs button[data-tab=${tab}]`);
  const input = tab === "conj" ? "#conj-in" : "#num-in";
  await p.fill(input, "1");
  await p.click(tab === "conj" ? "#conj-go" : "#num-go");
  const [fbBottom, barTop, typing] = await p.evaluate((sel) => [
    document.querySelector(sel).getBoundingClientRect().bottom,
    document.querySelector("#accent-bar").getBoundingClientRect().top,
    document.body.classList.contains("typing"),
  ], tab === "conj" ? "#conj-fb" : "#num-fb");
  eq(`${tab}: feedback sits above the accent bar on a phone`, [typing, fbBottom <= barTop], [true, true]);
  await p.close();
}

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
  eq("tutor explains, translates and gives feedback in that language, in every mode", await p.evaluate(() => {
    const modes = ["tutor", "corrector", "conversation", "song", "pronounce", "reading"];
    return modes.filter((m) => {
      const s = window.__fr.tutorSystem(m);
      return !s.includes("feedback in Brazilian Portuguese") || /\bEnglish\b/.test(s);
    });
  }), []);
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
        tutor: { course: "", mark: "", song: "", pronounce: "", reading: "" }, scenarios: { en: ["a test"] } });`;
    await route.fulfill({ contentType: "text/javascript", body });
  });
  await p.goto(url);
  eq("course picker lists the courses", await p.$$eval("#course-select option", (o) => o.map((x) => [x.value || "", x.disabled])),
    [["fr", false], ["es", false], ["la", false], ["pl", false], ["ja", false], ["xx", false], ["➕ More soon", true]]);
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

// ── Backup carries the course site's checklists; restoring merges them ──
{
  const p = await browser.newPage();
  const A = "/LLM-Language-Courses/french/units/unit-00-sounds.html", B = "/LLM-Language-Courses/french/units/unit-01-etre.html";
  await p.goto(url);
  await p.evaluate(([a]) => { localStorage.clear(); localStorage.setItem("llc.checklists", JSON.stringify({ [a]: { "Shadow 5 minutes": true } })); }, [A]);
  const backup = await p.evaluate(() => window.__fr.exportAll());
  eq("backup: includes the site checklists", backup["site.checklists"], { [A]: { "Shadow 5 minutes": true } });
  // This device already has other ticks; restoring adds the backup's instead of replacing them.
  await p.evaluate(([a, b]) => localStorage.setItem("llc.checklists", JSON.stringify({ [a]: { "Read the rule": true }, [b]: { "Say it aloud": true } })), [A, B]);
  p.once("dialog", (d) => d.accept());
  await p.setInputFiles("#t-import", { name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(Object.assign(backup, { days: ["2026-10-18"] }))) });
  await p.waitForLoadState("load");
  await p.waitForFunction(() => localStorage.getItem("llc.fr.days"));
  eq("backup: restore merges checklists and course progress", await p.evaluate(() => [JSON.parse(localStorage.getItem("llc.checklists")),
    localStorage.getItem("llc.fr.days"), Object.keys(localStorage).filter((k) => k.includes("site."))]),
    [{ [A]: { "Read the rule": true, "Shadow 5 minutes": true }, [B]: { "Say it aloud": true } }, '["2026-10-18"]', []]);
  await p.close();
}

// ── Spanish, Latin, Polish and Japanese starter courses ──
for (const [id, firstCard, voice, tutorLine, articles] of [
  ["es", "la jirafa", "es-MX", "You are a Spanish tutor", true],
  ["la", "salvē", "it-IT", "You are a Latin tutor", false],
  ["pl", "cześć", "pl-PL", "You are a Polish tutor", false],
  ["ja", "こんにちは", "ja-JP", "You are a Japanese tutor", false],
]) {
  const p = await browser.newPage();
  const pErrors = [];
  p.on("pageerror", (e) => pErrors.push(e.message));
  await p.addInitScript((c) => localStorage.setItem("llc.course", c), id);
  await p.goto(url);
  eq(`${id}: course selected, starter tabs only`, [await p.inputValue("#course-select"),
    await p.$$eval("#tabs button", (b) => b.filter((x) => !x.hidden).map((x) => x.dataset.tab))], [id, ["today", "cards", "tutor"]]);
  const folder = { es: "spanish", la: "latin", pl: "polish", ja: "japanese" }[id];
  eq(`${id}: unit link opens the lesson page, or says there isn't one and opens the roadmap`,
    await p.$eval("#tab-today a", (a) => [a.getAttribute("href"), a.textContent]),
    id === "es" ? [`../${folder}/units/unit-00-sounds.md`, "Open the unit →"] : [`../${folder}/README.md`, "No lesson page yet: open the roadmap →"]);
  eq(`${id}: unit picker marks the units that have a lesson page`,
    await p.$eval("#t-unit", (s) => [[...s.options].filter((o) => o.textContent.endsWith("✅")).map((o) => o.value), !!s.parentElement.querySelector("small")]),
    id === "es" ? [["0", "1", "2", "3"], true] : [[], false]);
  await p.click("#tabs button[data-tab=cards]");
  eq(`${id}: first card`, (await p.textContent("#fc-card .prompt")).trim().startsWith(firstCard), true);
  eq(`${id}: nouns carry a gender (and the "include the article" hint) only in courses with articles`, await p.evaluate(() => {
    const deck = window.LLC_COURSES.find((c) => c.id === localStorage.getItem("llc.course")).vocab;
    return Object.values(deck).flat().some((e) => e[2] !== null);
  }), articles);
  eq(`${id}: speaks with the course voice`, await p.$eval("#fc-card .speak", (b) => b.dataset.lang), voice);
  const sys = await p.evaluate(() => [window.__fr.tutorSystem("conversation"), window.__fr.claudeAiPrompt("conversation")]);
  eq(`${id}: tutor is about the course language, not French`, [sys[0].includes(tutorLine), /You are a French|Belgi|Angèle/.test(sys.join(" "))], [true, false]);
  await p.click("#tabs button[data-tab=tutor]");
  eq(`${id}: tutor tab renders`, !!(await p.$("#tm-setup")), true);
  eq(`${id}: no page errors`, pErrors, []);
  await p.close();
}

// ── Spanish: ¿ and ¡ are optional when typing, nouns come with their article ──
{
  const p = await browser.newPage();
  await p.addInitScript(() => localStorage.setItem("llc.course", "es"));
  await p.goto(url);
  eq("es: ¿ ¡ are ignored, accents still checked", await p.evaluate(() => {
    const { compare } = window.__fr;
    return [compare("como te llamas", ["¿cómo te llamas?"]), compare("¿Cómo te llamas?", ["¿cómo te llamas?"]), compare("¡hola!", ["hola"]), compare("el nino", ["el niño"])];
  }), ["accent", "ok", "ok", "accent"]);
  eq("es: every noun with a gender starts with its article", await p.evaluate(() =>
    Object.values(window.ES_VOCAB).flat().filter((e) => e[2] && !/^(el|la|los|las) /.test(e[0])).map((e) => e[0])), []);
  eq("es: accent bar has ñ and the opening ¿", await p.$$eval("#accent-bar button", (b) => b.map((x) => x.textContent).filter((x) => "ñ¿".includes(x))), ["ñ", "¿"]);
  await p.close();
}

// ── Japanese: kana answers, full-width input, accent keys ──
{
  const p = await browser.newPage();
  await p.addInitScript(() => localStorage.setItem("llc.course", "ja"));
  await p.goto(url);
  eq("ja: kana answers compare correctly", await p.evaluate(() => {
    const { compare } = window.__fr;
    return [compare("ねこ", ["ねこ"]), compare("ねこ　", ["ねこ"]), compare("ねご", ["ねこ"]), compare("いぬ", ["ねこ"])];
  }), ["ok", "ok", "no", "no"]);
  eq("ja: no full-width punctuation in the deck (typed answers would never match)",
    await p.evaluate(() => Object.values(window.JA_VOCAB).flat().filter((e) => /[。、？！]/.test(e[0])).map((e) => e[0])), []);
  eq("ja: accent bar has the long mark and small kana", await p.$$eval("#accent-bar button", (b) => b.map((x) => x.textContent).slice(0, 2)), ["ー", "っ"]);
  await p.close();
}

// ── Practice calendar: this month's practiced days, darker with more of the session checklist ──
{
  const p = await browser.newPage();
  const pErrors = [];
  p.on("pageerror", (e) => pErrors.push(e.message));
  await p.goto(url);
  const keys = await p.evaluate(() => {
    const k = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const now = new Date();
    const today = k(now), first = k(new Date(now.getFullYear(), now.getMonth(), 1));
    const lastMonth = k(new Date(now.getFullYear(), now.getMonth() - 1, 15));
    localStorage.setItem("llc.fr.days", JSON.stringify([lastMonth, first, today]));
    localStorage.setItem("llc.fr.checklist", JSON.stringify({ [today]: { flash: true, rule: true, media: true, output: false } }));
    return { today, first, lastMonth, count: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() };
  });
  await p.reload();
  const level = (k) => p.$eval(`.cal-day[data-day="${k}"]`, (el) => (el.className.match(/lv-(\d)/) || [])[1]);
  eq("calendar is the first panel on Today", await p.$eval("#tab-today > .panel", (el) => el.id), "t-cal");
  eq("calendar shows every day of this month", await p.$$eval(".cal .cal-day", (d) => d.length), keys.count);
  eq("practiced days lit, darker with more checklist ticks", [await level(keys.first), await level(keys.today)],
    keys.first === keys.today ? ["3", "3"] : ["1", "3"]);
  eq("today is outlined", await p.$eval(".cal-day.today", (el) => el.dataset.day), keys.today);
  eq("monthly count", await p.textContent("#cal-count"), `Days practiced this month: ${keys.first === keys.today ? 1 : 2}`);
  eq("can't go past this month", await p.$eval("#cal-next", (b) => b.disabled), true);
  await p.click("#cal-prev");
  eq("previous month shows its practice", [await level(keys.lastMonth), await p.$eval("#cal-prev", (b) => b.disabled)], ["1", true]);
  await p.click("#cal-next");
  await p.click("#tab-today [data-c=output]");
  eq("ticking the checklist updates today's square", await level(keys.today), "4");
  eq("calendar: no page errors", pErrors, []);
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
