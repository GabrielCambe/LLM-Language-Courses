# Unit template

This is the **contract** between you and the LLM that generates course units.
Every unit, for any language, follows this shape. Each section exists for a reason
(see [`learning-science.md`](learning-science.md)); the reason is in brackets.

---

## Generator prompt

```text
You are a language curriculum designer who follows second-language-acquisition research
(explicit instruction + practice, retrieval practice, spaced repetition, comprehensible
input, noticing, output with corrective feedback).

Write Unit {N} of a {French} course for an adult learner at CEFR {A1}, who speaks
{English/Portuguese}. The roadmap entry is:
"{paste the roadmap line from french/README.md}"
Previous units covered: {list}.

Follow the template below EXACTLY. Constraints:
- Rule sections: precise and short. Use tables for conjugations.
- Vocabulary: only high-frequency items (roughly top 2000 words), max 25 items.
- Never quote song lyrics beyond the song title. For media tasks, describe WHAT to listen
  for, not the lyrics themselves. Only recommend songs/films you are confident exist;
  mark anything you are unsure about with (verify).
- Mark colloquial vs. formal, and France vs. Belgium/Switzerland/Québec differences.
- Include one 💡 Curiosity box (etymology, culture, or a surprising fact).

TEMPLATE:
{paste everything below the line}
```

---

# Unit {N}: {Title} · CEFR {level} · ~{X} days

## 🎯 Can-do goals  *(clear target → you know when you're done)*
- I can ...
- I can ...

## 📐 The rule  *(explicit instruction)*
Short explanation. Tables. 3–5 examples. The #1 exception.
Link to the grammar reference file.

## ⚠️ Common traps  *(prevents errors from fossilising)*
- Learners say X → correct is Y, because ...

## 🧱 Vocabulary  *(high frequency; goes into the SRS deck)*

| French | English | Note |
|---|---|---|

## 🏋️ Drills  *(retrieval practice)*
- App: which drill / which deck
- 5 quick self-test questions (answers hidden in a `<details>` block)

## 🎧 Input + Hunt  *(comprehensible input + noticing)*
- Song / clip / episode
- **Hunt:** what to notice (e.g. "count every *ne ... pas*")
- Shadowing target (one chorus or line)

## 🗣️ Use it  *(output + feedback)*
- Writing prompt (3–5 sentences) → paste to the Corrector prompt
- Speaking scenario → Conversation Partner prompt

## 💡 Curiosity  *(motivation; makes it memorable)*

## ✅ Checklist  *(move on when all are ticked)*
- [ ] I can explain the rule out loud in my own words
- [ ] Drill accuracy ≥ 80%
- [ ] Did the Hunt
- [ ] Wrote / spoke and got corrected
- [ ] Unit cards added to SRS
