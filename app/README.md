# French Study App

A small offline study app: plain HTML/JS, no install, no build, no account.

## Open it
- **On your computer:** double-click `index.html` (or `open app/index.html` on macOS).
- **Online (phone or computer):** https://gabrielcambe.github.io/LLM-Language-Courses/app/
  On your phone, use the browser's *Add to Home Screen* to get an app-like icon.
  Progress is stored per device/browser, so use **Today → Backup** to move it between devices.
  The backup also holds the ticks on the course pages' checklists; restoring adds them to the ones already on the device.
- The site is built by **GitHub Pages** from the default branch (settings in `/_config.yml`).
  It rebuilds automatically ~1 minute after each push.

Works on phones and computers: the layout adapts down to 320 px wide. On phones the tabs use
short names (Cards, Verbs, Songs), and the accent keys appear only while you're typing. You can also
long-press a letter on the phone keyboard (e → é è ê).

**Language:** the 🌐 menu in the top bar switches the interface between **English** and **Português (BR)**.
The first visit follows your device language. The tutor's "your language" follows it too, unless you typed your own.
Only the app's interface is translated: card meanings and the course pages are still in English.

**Course:** the menu with the flag (top left) picks the course: French, Latin, Polish or Japanese.
Each course keeps its own progress, so switching never touches another course's cards.
Latin, Polish and Japanese are starters: Today, Flashcards (units 0–3) and the Tutor. Conjugation, Gender,
Numbers and the Song Workshop are French-only for now. Latin audio uses an Italian voice (there are no Latin voices).
For Japanese, type answers with your device's Japanese keyboard; the accent keys add the long mark ー and small kana (っ ゃ ゅ ょ).

**Light / dark mode:** the button in the top bar cycles 🌓 Auto (follows your device) → ☀️ Light → 🌙 Dark.
The course website has the same button, and one choice applies to both.

## What's inside

| Tab | What it trains | Research principle |
|---|---|---|
| **Today** | Current unit, due cards, 25-min focus timer, session checklist, parking lot | Implementation intentions, scope guard |
| **Flashcards** | Vocabulary by unit, FR→EN then EN→FR, SM-2 spaced repetition, 🔊 audio | Retrieval practice + spacing |
| **Conjugation** | Type the verb form; mix verbs and tenses (unlocked by unit); missed forms come back 3 questions later, and each form has its own SM-2 schedule | Retrieval + interleaving + spacing |
| **Gender** | le or la? with the ending rule (or exception) after each answer | Explicit rule + immediate feedback |
| **Numbers** | Listen → digits, read → digits, digits → words; 🇫🇷/🇧🇪/🇨🇭 variants | Listening automaticity |
| **Song Workshop** | Paste lyrics → click words to make cards, cloze (fill-the-gap) while listening | Noticing + retrieval with real media |
| **💬 Tutor** | Chat with Claude in 5 modes (Tutor, Corrector, Conversation, Song explainer, Reading), aware of your current unit | Output + corrective feedback, retrieval |

### The Tutor and your Claude account
- **Claude Pro / Max subscription:** subscriptions can't be used by other apps. The Tutor tab
  *copies a ready-made prompt* (with your unit and mode) and opens Claude.ai, where you paste it.
- **API key (chat inside the app):** create a key in the [Claude Console](https://platform.claude.com/settings/keys).
  API usage is billed separately from Pro, as prepaid credits. A tutoring message costs roughly 1–2 cents with
  Claude Opus 5.5 (the default) and a fraction of a cent with Claude Haiku 5.5 (choose in *Tutor settings*).
  **Set a monthly spend limit in the Console.**
- The key is stored only in your browser (`localStorage`, or for the tab only if you untick *Remember*),
  is sent only to `api.anthropic.com`, and is never included in **Today → Backup**. Avoid saving it on a shared computer.
  Anyone who can run scripts on `gabrielcambe.github.io` (any of your GitHub Pages sites) could read it, so keep that site trusted.
- Technical notes: the official [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
  (pinned version, loaded from jsDelivr only when the Tutor is used) calls the API straight from the browser
  (`dangerouslyAllowBrowser`). Replies stream, use `effort: "low"` for speed, prompt caching for cheaper follow-ups,
  and server-side refusal fallbacks (`fallbacks: "default"`) on Opus/Sonnet. History is append-only.

### Notes
- 🔊 uses your system's **text-to-speech**. If it doesn't sound French, install a French voice
  (macOS: System Settings → Accessibility → Spoken Content; Windows: Settings → Time & Language → Speech;
  Android/iOS: usually built in).
- **New cards/day** defaults to 10. Keep it low; reviews pile up fast. EN→FR (production) cards
  for a word only appear after you've got its FR→EN card right on an earlier day.
- **Import cards:** use the *Flashcard Maker* prompt in `docs/llm-tutor-prompts.md`, then paste the JSON
  into Flashcards → Deck settings.
- **Lyrics** stay in your browser's local storage only. Don't commit them.

## Developing
- Vocabulary: `data/vocab.js` (French, by unit), `data/latin.js`, `data/polish.js`, `data/japanese.js`. French verbs: `data/verbs.js`.
- Courses: `data/courses.js` (units, voice, accent keys, which tabs exist, where progress is stored).
  A new course is a new entry there plus its own data files. Conjugation, Gender, Numbers and the Song Workshop
  are written for French, so list only the tabs a course really supports. The Tutor works for any course:
  its course-specific lines and role-play scenarios are in the course's `tutor` and `scenarios` fields.
- Interface text: `i18n.js`, one block per language. Add every new key to both blocks (the tests check this).
- Don't rename existing French entries: the French text is the card ID.
- **When you change any app file, bump the `?v=` date in `index.html`** (all links share one value).
  Phones cache each file separately, so without it they can mix new and old files. The tests enforce one shared value.
- Tests: `node app/test.mjs` (needs Playwright: `npm i -D playwright`, or a global install with
  `NODE_PATH="$(npm root -g)"`).

🧭 *Scope guard:* the app is good enough to study with. New features go to the parking lot first.
