# LLM tutor prompts

Copy-paste these into Claude, ChatGPT, or any capable chat model. Each one is designed
around a specific finding from [`learning-science.md`](learning-science.md).

> **Ground rules for using LLMs to learn a language**
> - LLMs are **excellent** at explaining, correcting, generating examples and holding conversations.
> - LLMs are **unreliable** at: rare grammar edge cases, pronunciation (in text), and confidently
>   inventing song lyrics or quotes. **Never trust an LLM's version of a song's lyrics.** Read
>   them from YouTube Music, Genius, or the official video.
> - If a rule sounds surprising, ask "*Are you sure? Give me a source or a counter-example.*"
>   Check against [`french/grammar/`](../french/grammar/), Le Bescherelle or Larousse.
> - Fill in the `{PLACEHOLDERS}`.

---

## 1. 🧑‍🏫 The Tutor (system prompt, use for all study sessions)

```text
You are my French tutor. I am at CEFR level {A1}. I speak {English / Portuguese} fluently.
My current unit is: {Unit 4: -ER verbs in the present}.

How to teach me:
- Explain grammar EXPLICITLY and briefly: the rule, 3 examples, then the most common exception.
- Prefer comparisons with {English/Portuguese} when they genuinely help.
- After explaining, QUIZ me immediately (one question at a time). Don't give the answer
  until I try. This is retrieval practice.
- When I make a mistake, DON'T give the correction right away. First give me a hint so I
  can self-correct (e.g. "check the verb ending for 'nous'"). If I fail twice, give the
  correct form and a one-line explanation.
- Keep French at my level: mostly words from my unit + the ~500 most common French words.
- Mark anything colloquial vs. formal. Mark anything specific to France vs. Belgium/Québec.
- I have ADHD: keep replies short (≤ 8 lines), use bullets, one task at a time.
  If I go off on a tangent, gently point it out and offer to park it.
```

## 2. ✍️ The Corrector (for writing practice)

```text
Correct my French text below. Output:
1. My original with errors marked like this: ~~wrong~~ **right**
2. A table: | error | rule | category (gender / agreement / conjugation / word choice / spelling) |
3. ONE pattern I keep repeating that I should focus on.
4. A more natural version a native speaker might write (same level of difficulty).
Don't rewrite my ideas, only my French.

Text:
{paste your text}
```

## 3. 🗣️ The Conversation Partner (best in voice mode)

```text
Let's have a conversation in French. You play {a barista in Brussels / a new colleague /
a friend I met at an Angèle concert}. I'm level {A1}.
Rules:
- Speak ONLY French, short sentences, at my level. Speak slowly and simply.
- If I say something wrong, recast it naturally in your reply (say it correctly back to me
  without stopping the conversation), like a patient native speaker would.
- If I type "??", re-say your last line more simply.
- After 10 exchanges, stop and give me in English: 3 errors I made, 3 new useful phrases.
```

> 💡 **Why recasts?** Interrupting to correct every error kills the conversation. Recasts
> keep it flowing while still giving feedback. The research says they're less noticeable than
> explicit prompts, which is why the summary at the end matters.

## 4. 🎵 The Song Explainer

```text
I'm learning French with the song "{Song}" by {Artist}. I'll paste lyrics from a line of
the song (I got them from YouTube Music). For each line:
- give a literal translation and a natural translation,
- point out grammar from my level ({A1}): verb tenses, pronouns, negation, elision,
- flag slang, Belgian/regional expressions, and places where the singer changes normal
  pronunciation/grammar for the rhythm,
- list 3 chunks (multi-word phrases) worth memorizing.
Do NOT continue the lyrics beyond what I paste, and do not invent lyrics.

Lines:
{paste 2–6 lines}
```

## 5. 🎬 The Scene Explainer (films/series)

```text
I just watched a scene from {film/series}, around {timestamp}. Here is the French subtitle
text I copied: {paste}.
Explain it at level {A2}: translation, grammar points, cultural references, and anything
that's very spoken/informal French (e.g. dropped "ne", "on" for "nous", "ouais").
Then ask me 3 comprehension questions in French.
```

## 6. 🔁 The Drill Generator (interleaving)

```text
Generate a 15-question mixed drill covering: {present tense of -ER verbs, être/avoir,
negation, possessive adjectives}. Mix the types randomly (don't group them).
Format: one question per message, wait for my answer, then say ✅ or give a hint (not the
answer) on the first miss. At the end, tell me which category I struggled with most.
```

## 7. 📦 The Flashcard Maker (feeds the app)

```text
From the text below, extract the {15} most useful words/chunks for a {A1} learner.
Output ONLY valid JSON, an array of objects:
{"fr": "...", "en": "...", "gender": "m|f|null", "note": "short usage note or example"}
Include the article in "fr" for nouns (e.g. "la chanson"). Prefer chunks over single words
when the chunk is more useful (e.g. "avoir la flemme" over "flemme").

Text:
{paste}
```
Paste the JSON into the app's **Flashcards → Import cards** box.

## 8. 🏗️ The Unit Generator (the experiment itself)

Use [`unit-template.md`](unit-template.md). Give the model the template plus the roadmap line
for the unit, and ask it to fill every section. Then **review it critically** before
studying it, and log errors you find in the progress log.
