# LLM Language Courses

An experiment: **can an LLM build a better-structured language course than a gamified app?**

Apps like Duolingo are good at keeping a habit going and at quick recall, but they rarely
explain *why* the language works the way it does, and they give you very little long input
(songs, films, conversations) or real output (speaking and writing your own sentences).
This repo tries to fill that gap. It has:

- a **structured path** with explicit grammar rules, ordered so each step builds on the last,
- **real media** (music, films, animation) attached to each step,
- **study methods backed by research** (spaced repetition, retrieval practice, comprehensible input, shadowing...),
- **LLM prompts** that turn a chatbot into a tutor, a corrector and a conversation partner,
- a small **interactive app** for drills and flashcards.

Duolingo, films, music and conversation stay in the plan. They now feed into a structure
instead of being the whole plan.

First language: **French** 🇫🇷🇧🇪

🌐 **Website (phone & computer):** https://gabrielcambe.github.io/LLM-Language-Courses/
📱 **Study app:** https://gabrielcambe.github.io/LLM-Language-Courses/app/ (add it to your phone's home screen)

---

## Start here (10 minutes)

1. Read [`docs/learning-science.md`](docs/learning-science.md) to see *why* the method looks the way it does (skim the TL;DR).
2. Read [`docs/study-system.md`](docs/study-system.md) for the daily and weekly routine, including the "minimum viable day".
3. Open [`french/README.md`](french/README.md) for the roadmap. Begin with **Unit 0 (sounds)**.
4. Open the [study app](app/index.html): online at the link above, or double-click `app/index.html` locally.

## Repo map

```
docs/
  learning-science.md     Research behind the method (with citations)
  study-system.md         Daily/weekly routine, ADHD-friendly session design, scope guard
  llm-tutor-prompts.md    Copy-paste prompts: tutor, corrector, conversation partner, song explainer
  unit-template.md        The template an LLM uses to generate new units (the core of the experiment)
french/
  README.md               Roadmap A0 → A2 (+ how to move to B1)
  units/                  Unit-by-unit lessons (rules + vocab + media + tasks)
  grammar/                Grammar reference, one rule family per file
  media/                  Music (Angèle first!), films, series, podcasts, sorted by level
app/
  index.html              Offline study app: SRS flashcards, conjugation, gender, numbers, song workshop
```

## The experiment log

Each time you finish a unit, add one line to [`french/progress-log.md`](french/progress-log.md):
what worked, what was boring, what the LLM got wrong. That log is the experiment's data.
Use it to improve the unit template before starting the next language.

## A note on lyrics and copyright

Song lyrics are copyrighted, so **this repo never stores lyrics**. The units point to songs and
tell you what to listen for. The app's *Song Workshop* lets you paste lyrics you're reading
(e.g. from YouTube Music). They stay in your browser's local storage and never reach the repo.
