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

// Song workshop: add a song, cloze renders, HTML is escaped
await page.click("#tabs button[data-tab=songs]");
await page.fill("#sf-title", "<b>Test</b>");
await page.fill("#sf-lyrics", "Je ne sais pas pourquoi\nOn danse <script>x</script> toujours");
await page.click("#sf-save");
eq("lyrics escaped", await page.$eval("#song-body", (el) => el.querySelector("script") === null), true);
await page.click("[data-mode=cloze]");
await page.selectOption("#cz-density", "func");
eq("cloze page renders", await page.$eval("#song-body .lyrics", (el) => el.textContent.includes("pourquoi") || el.querySelectorAll("input.gap").length > 0), true);

eq("no page errors", errors, []);
await browser.close();
console.log(failed ? `\n${failed} test(s) failed` : "\nAll tests passed");
process.exit(failed ? 1 : 0);
