# French Study App

A small offline study app: plain HTML/JS, no install, no build, no account.

## Open it
- **On your computer:** double-click `index.html` (or `open app/index.html` on macOS).
- **On your phone:** enable **GitHub Pages** for this repo (Settings → Pages → deploy from
  branch `main`, folder `/`), then open `https://<you>.github.io/LLM-Language-Courses/app/`.
  Progress is stored per device/browser, so use **Today → Backup** to move it.

## What's inside
| Tab | What it trains | Research principle |
|---|---|---|
| **Today** | Current unit, due cards, 25-min focus timer, session checklist, parking lot | Implementation intentions, scope guard |
| **Flashcards** | Vocabulary by unit, FR→EN then EN→FR, SM-2 spaced repetition, 🔊 audio | Retrieval practice + spacing |
| **Conjugation** | Type the verb form; mix verbs and tenses (unlocked by unit) | Retrieval + interleaving |
| **Gender** | le or la? with the ending rule (or exception) after each answer | Explicit rule + immediate feedback |
| **Numbers** | Listen → digits, read → digits, digits → words; 🇫🇷/🇧🇪/🇨🇭 variants | Listening automaticity |
| **Song Workshop** | Paste lyrics → click words to make cards, cloze (fill-the-gap) while listening | Noticing + retrieval with real media |

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
- Vocabulary: `data/vocab.js` (by unit). Verbs: `data/verbs.js`.
- Don't rename existing French entries: the French text is the card ID.
- Tests: `node app/test.mjs` (needs Playwright: `npm i -D playwright`, or a global install with
  `NODE_PATH="$(npm root -g)"`).

🧭 *Scope guard:* the app is good enough to study with. New features go to the parking lot first.
