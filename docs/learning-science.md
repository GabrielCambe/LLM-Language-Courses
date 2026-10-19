# The learning science behind this course

> **TL;DR:** Pick up the rules on purpose, practise them by *retrieving* (not rereading),
> space your reviews out over days, take in a lot of input you mostly understand (songs, shows),
> read a lot of easy books, and produce output that gets corrected. Duolingo covers some of this. This course adds the rest.

This document explains each principle, the evidence for it, and **how this repo uses it**.
Citations are listed at the end. Where evidence is weak or disputed, the text says so.

---

## 1. Why Duolingo feels like it isn't "teaching" you

You're not imagining it. Here's what the research says:

- **Independent research is small.** Loewen et al. (2019) followed 9 learners using Duolingo
  for a semester. They improved, and the gains correlated moderately with time spent. The
  learners also reported frustration with the instructional materials and swings in motivation.
- **Company-affiliated research measures a slice.** Jiang et al. (2021, with Duolingo authors)
  found that learners who finished the early units of Duolingo's French and Spanish courses
  reached reading and listening scores comparable to university students after several
  semesters. Speaking and writing weren't the focus.
- **What's missing, structurally:** Duolingo mostly teaches *implicitly*: you're supposed to
  work out patterns from examples. Meta-analyses show that **explicit instruction** (stating
  the rule, then practising it) produces larger and longer-lasting gains for adult learners
  than purely implicit exposure (Norris & Ortega, 2000; Spada & Tomita, 2010). Adults are good
  at using rules. Use that.

**Verdict:** keep Duolingo as a *warm-up and habit tool* (5–10 min). Don't treat it as the curriculum.

---

## 2. The principles

### 2.1 Explicit grammar + practice (rules first, then automatize)
- **Evidence:** Norris & Ortega (2000) and Spada & Tomita (2010) found that explicit
  instruction beats implicit instruction on average, for simple and complex rules alike.
- **Caveat:** *knowing* a rule isn't the same as *using* it in real time. Skill Acquisition
  Theory (DeKeyser, 2007) describes three stages: declarative knowledge ("I know the rule") →
  procedural ("I can apply it slowly") → automatic ("it comes out right without thinking").
  Only lots of practice moves you along.
- **In this repo:** every unit has a **Rule** section (short, precise), then **Drills**
  (app + LLM), then **Use it** (speaking/writing).

### 2.2 Retrieval practice (the testing effect)
- **Evidence:** Pulling information *out* of memory strengthens it much more than putting it in
  again. In Karpicke & Roediger (2008), students learning Swahili–English word pairs who kept
  *testing* themselves recalled about 80% a week later. Students who kept *re-studying* instead
  recalled about 35%. Dunlosky et al. (2013) rated practice testing one of only two
  "high-utility" study techniques.
- **In this repo:** flashcards show the prompt and make you answer *before* revealing.
  Conjugation drills make you type. Rereading notes isn't part of the method.

### 2.3 Spaced repetition
- **Evidence:** Cepeda et al. (2006) combined 317 experiments: spreading reviews over time
  beats cramming. The best gap between reviews grows the longer you want to remember something.
- **In this repo:** the app schedules each card so that you see it again just before you'd
  forget it (an SM-2-style algorithm, the same family as Anki). Hard cards come back sooner,
  easy cards later.
- **Language-specific evidence:** a meta-analysis of 37 second-language studies (Kim & Webb, 2022)
  found that spacing generally helps L2 learning too, although the size of the benefit varies
  with the skill, the learners and the activity.
- 💡 **Curiosity:** Paul Pimsleur published a "graduated interval recall" schedule for language
  learning in **1967** (5 s, 25 s, 2 min, 10 min, 1 h, 5 h, 1 day, 5 days...). Modern SRS
  algorithms like Anki's FSRS fit those intervals to *your own* memory data with machine
  learning, which may interest you given your work.

### 2.4 Comprehensible input (lots of it)
- **Evidence:** Krashen's Input Hypothesis (1982) says we acquire language by understanding
  messages slightly above our level ("i+1"). The strong version is criticised as hard to test,
  but nearly every researcher agrees that **lots of input is necessary**.
- **How much do you need to understand?** About **95–98% of the words** in a text before
  reading feels comfortable and new words can be guessed from context (Nation, 2006). For TV
  and films, about 3,000 word families give roughly 95% coverage (Webb & Rodgers, 2009).
  That's why a frequency-ordered vocabulary is worth it: the top ~1,000 French words cover
  most of everyday speech.
- **In this repo:** media are matched to levels. Start with songs (short, repetitive),
  slow podcasts, and animation for children, then move to series.

### 2.5 Captions and subtitles
- **Evidence:** A meta-analysis (Montero Perez et al., 2013) found that **captions in the
  target language** (French audio + French text) help listening comprehension and vocabulary
  learning. Peters & Webb (2018) showed that learners pick up vocabulary just from watching TV
  in the language, more so for words that come up often.
- **Rule of thumb:**
  - **A1:** French audio + your-language subtitles is fine (comprehension first).
  - **A2+:** French audio + **French** subtitles (this is where the gains are).
  - **Re-watch** the same episode or scene: the second viewing is when you notice things.

### 2.6 Songs
- **Evidence:** Ludke, Ferreira & Overy (2014): adults who learned Hungarian phrases by
  **singing** them recalled and produced them better than those who spoke them. It's a small,
  short-term study, so treat it as promising rather than proven. Songs also bring repetition
  and fixed chunks, and they get stuck in your head, which is free extra review.
- **Caveat:** song lyrics bend grammar and pronunciation to fit the rhythm (dropped
  syllables, unusual word order). Use songs to train listening and chunks, not as a grammar
  reference.
- **In this repo:** see [`french/media/music.md`](../french/media/music.md) for the
  6-step song study method, and the app's Song Workshop for cloze (fill-the-gap) exercises
  on lyrics you paste.

### 2.7 Noticing
- **Evidence:** Schmidt's Noticing Hypothesis (1990): input becomes "intake" mainly when you
  *consciously notice* a form. You can hear "je suis allée" 100 times, but until you notice the
  extra *-e*, it doesn't stick.
- **In this repo:** every unit has a **Hunt** task, e.g. "find every negation in this song",
  which turns passive listening into active noticing.

### 2.8 Output, interaction and corrective feedback
- **Evidence:**
  - *Output Hypothesis* (Swain, 1985): having to *produce* language forces you to notice gaps
    that comprehension lets you skip.
  - *Interaction Hypothesis* (Long, 1996): conversation where you negotiate meaning
    ("sorry, what?") speeds up learning.
  - Meta-analyses of **corrective feedback** (Li, 2010; Lyster & Saito, 2010) show it works,
    especially *prompts* that make you fix the error yourself, rather than just being given
    the answer.
- **In this repo:** the LLM prompts in [`llm-tutor-prompts.md`](llm-tutor-prompts.md) tell the
  model to **prompt you to self-correct first** and only then give the corrected form.
  This is where LLMs beat apps.

### 2.9 Shadowing
- **What:** play native audio and repeat it aloud *at the same time* (or a half-second behind).
- **Evidence:** Hamada (2016) found that shadowing improved listening comprehension,
  especially for lower-level learners, by training sound perception. It's also good practice
  for French rhythm and liaison.
- **In this repo:** song choruses and podcast clips are your shadowing material.

### 2.10 Interleaving
- **Evidence:** Mixing problem types in one practice session (instead of doing all of type A,
  then all of type B) feels harder but improves your ability to *choose* the right rule
  (Kornell & Bjork, 2008, with art styles; Rohrer's work with maths). This is one of Bjork's
  "desirable difficulties". For L2 **grammar** specifically, Nakata & Suzuki (2019) found that
  mixed grammar exercises led to better long-term retention than blocked ones, even though
  blocked practice looks better on the day.
- **In this repo:** once a few verb tenses are learned, the conjugation drill mixes them.
  This matters most for the passé composé vs. imparfait choice at A2.

### 2.11 Extensive reading (and reading while listening)
- **Evidence:** A meta-analysis of 49 studies (Jeon & Day, 2016) found that reading large
  amounts of easy, self-chosen text improves reading proficiency, with **larger effects for adults
  and for longer programmes**. Learners who read graded readers *with the audio* picked up a large
  share of the unknown words they met and kept much of it months later (Webb & Chang, 2015).
- **Caveat:** many reading studies have weak control groups, so treat the exact effect sizes as
  rough. The direction of the evidence is consistent.
- **In this repo:** the [reading ladder](../french/media/reading.md) goes from picture books to
  novels, with the "5 unknown words per page" test derived from the 98% coverage figure.

### 2.12 What doesn't work well
Dunlosky et al. (2013) rate **rereading, highlighting and summarising** as *low-utility*.
They feel productive because the material gets familiar, but familiar isn't the same as
remembered. If you catch yourself rereading a grammar page, close it and **write three
sentences** using the rule instead.

---

## 3. What research on learners of *French* tells us

### 3.1 Gender is mostly learnable by rule
Roy Lyster (2006) analysed **9,961 French nouns** and found that about **80% of masculine and
81% of feminine nouns** have endings that predict their gender. So "just memorise every gender"
is bad advice. Learn the ending rules, then memorise the exceptions.
→ This is exactly what the app's **Gender** drill does: it shows the ending rule (or flags the
exception) after every answer.

### 3.2 Canada's French immersion: input alone is not enough
Canadian French immersion programmes, where English-speaking children learn school subjects
*in* French for years, are one of the most-studied language-learning settings in the world.
The consistent finding: students develop **excellent comprehension and fluency**, but some
grammar errors **never go away** (gender, verb forms, *tu/vous*, past tenses). That's despite
thousands of hours of comprehensible input.
- Merrill Swain's research on these students led directly to the **Output Hypothesis**
  (Swain, 1985): they rarely had to *produce* precise French, so they never noticed their gaps.
- Lyster's review of classroom studies with ~1,200 immersion students (Lyster, 2004) showed that
  **form-focused instruction**, meaning explicit attention to rules plus practice and feedback,
  improves accuracy in exactly those trouble spots.

→ **Why this course mixes both:** input (songs, films, reading) *plus* explicit rules, drills,
output and correction. Either half alone falls short.

### 3.3 School courses teach surprisingly few words
Studies of UK school learners of French estimate that after about five years, students at
GCSE level (age ~16) know only **~500–850 French words** (Milton, 2006). Yet ~3,000 word families
are needed to follow 95% of TV dialogue (Webb & Rodgers, 2009).
→ **Vocabulary volume is the bottleneck.** That's why this course leans on spaced repetition of
high-frequency words *and* large amounts of reading and listening.

### 3.4 Textbook French ≠ spoken French
Native speakers drop the *ne* of negation in most casual speech (*je sais pas*), and the
drop has been increasing across generations (Ashby, 1981, and later studies of Tours speakers).
Studies of learners find they **keep *ne* far more often than native speakers do**, which makes
them sound bookish; time spent immersed in spoken French shifts this (Regan, 1996; Dewaele, 2004).
→ **In this repo:** the grammar pages mark spoken vs. written forms, and the
[sentence structure page](../french/grammar/09-sentence-structure.md) covers spoken word order
(dislocation, *c'est … qui*) that textbooks often skip.

---

## 4. Practical attention design (for an ADHD brain)

These ideas come from habit and motivation research, not clinical ADHD research. They tend
to work well when attention is unpredictable:

| Problem | Design response | Basis |
|---|---|---|
| "I'll study later" never happens | **Implementation intentions**: "When I make my morning coffee, I do 5 min of flashcards." | Gollwitzer & Sheeran (2006) meta-analysis: medium-to-large effect on goal attainment |
| Big tasks feel impossible to start | **Minimum viable day** = 5 min. Anything more is a bonus. | Lowering the cost of starting |
| Boredom → quitting | **Rotate modalities** within a session (drill → song → speak) | Novelty keeps engagement up |
| Distractions / new shiny ideas | **Parking lot**: write the idea down, come back after the session | Clears the open loop without acting on it |
| Invisible progress | Due-card counter, unit checklists, the progress log | Immediate, visible feedback |

See [`study-system.md`](study-system.md) for the concrete routine.

---

## 5. Curiosities

- 🕐 **How long does French take?** The US Foreign Service Institute puts French in its easiest
  group for English speakers: **~600–750 class hours** to "professional working proficiency"
  (roughly B2/C1). At 45 min/day that's about 2.5 years, or less with lots of passive input.
  French schools give rough per-level estimates that vary a lot: about **90–100 h for A1,
  ~200 h for A2, ~350–400 h for B1, ~500–650 h for B2** (cumulative, guided hours).
- 📏 **CEFR levels** (A1 → C2) are the European standard. Each unit here is tagged with one.
  The official exams are **DELF** (A1–B2) and **DALF** (C1–C2). Booking one gives you a hard
  deadline, which ADHD brains often respond to.
- 🧬 **If you speak Portuguese or Spanish,** French shares thousands of cognates with them
  (*nation/nação/nación*). The hard parts are pronunciation and spelling, not vocabulary.

---

## References

- Ashby, W. J. (1981). The loss of the negative particle *ne* in French: A syntactic change in progress. *Language, 57*(3), 674–687.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.
- DeKeyser, R. (2007). Skill acquisition theory. In B. VanPatten & J. Williams (Eds.), *Theories in Second Language Acquisition*. Erlbaum.
- Dewaele, J.-M. (2004). Retention or omission of the *ne* in advanced French interlanguage: The variable effect of extralinguistic factors. *Journal of Sociolinguistics, 8*(3), 433–450.
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69–119.
- Hamada, Y. (2016). Shadowing: Who benefits and how? *Language Teaching Research, 20*(1), 35–52.
- Jeon, E.-Y., & Day, R. R. (2016). The effectiveness of ER on reading proficiency: A meta-analysis. *Reading in a Foreign Language, 28*(2), 246–265.
- Jiang, X., Rollinson, J., Plonsky, L., Gustafson, E., & Pajak, B. (2021). Evaluating the reading and listening outcomes of beginning-level Duolingo courses. *Foreign Language Annals, 54*(4).
- Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science, 319*(5865), 966–968.
- Kim, S. K., & Webb, S. (2022). The effects of spaced practice on second language learning: A meta-analysis. *Language Learning*. https://doi.org/10.1111/lang.12479
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? *Psychological Science, 19*(6), 585–592.
- Krashen, S. (1982). *Principles and Practice in Second Language Acquisition*. Pergamon.
- Li, S. (2010). The effectiveness of corrective feedback in SLA: A meta-analysis. *Language Learning, 60*(2), 309–365.
- Loewen, S., Crowther, D., Isbell, D. R., Kim, K. M., Maloney, J., Miller, Z. F., & Rawal, H. (2019). Mobile-assisted language learning: A Duolingo case study. *ReCALL, 31*(3), 293–311.
- Long, M. (1996). The role of the linguistic environment in second language acquisition. In W. Ritchie & T. Bhatia (Eds.), *Handbook of Second Language Acquisition*. Academic Press.
- Ludke, K. M., Ferreira, F., & Overy, K. (2014). Singing can facilitate foreign language learning. *Memory & Cognition, 42*(1), 41–52.
- Lyster, R. (2004). Research on form-focused instruction in immersion classrooms: Implications for theory and practice. *Journal of French Language Studies, 14*(3), 321–341.
- Lyster, R. (2006). Predictability in French gender attribution: A corpus analysis. *Journal of French Language Studies, 16*(1), 69–92.
- Lyster, R., & Saito, K. (2010). Oral feedback in classroom SLA: A meta-analysis. *Studies in Second Language Acquisition, 32*(2), 265–302.
- Milton, J. (2006). Language lite? Learning French vocabulary in school. *Journal of French Language Studies, 16*(2), 187–205.
- Montero Perez, M., Van Den Noortgate, W., & Desmet, P. (2013). Captioned video for L2 listening and vocabulary learning: A meta-analysis. *System, 41*(3), 720–739.
- Nakata, T., & Suzuki, Y. (2019). Mixing grammar exercises facilitates long-term retention: Effects of blocking, interleaving, and increasing practice. *The Modern Language Journal, 103*(3), 629–647.
- Nation, I. S. P. (2006). How large a vocabulary is needed for reading and listening? *Canadian Modern Language Review, 63*(1), 59–82.
- Norris, J. M., & Ortega, L. (2000). Effectiveness of L2 instruction: A research synthesis and quantitative meta-analysis. *Language Learning, 50*(3), 417–528.
- Peters, E., & Webb, S. (2018). Incidental vocabulary acquisition through viewing L2 television and factors that affect learning. *Studies in Second Language Acquisition, 40*(3), 551–577.
- Pimsleur, P. (1967). A memory schedule. *The Modern Language Journal, 51*(2), 73–75.
- Regan, V. (1996). Variation in French interlanguage: A longitudinal study of sociolinguistic competence. In R. Bayley & D. Preston (Eds.), *Second Language Acquisition and Linguistic Variation*. John Benjamins.
- Schmidt, R. (1990). The role of consciousness in second language learning. *Applied Linguistics, 11*(2), 129–158.
- Spada, N., & Tomita, Y. (2010). Interactions between type of instruction and type of language feature: A meta-analysis. *Language Learning, 60*(2), 263–308.
- Swain, M. (1985). Communicative competence: Some roles of comprehensible input and comprehensible output in its development. In S. Gass & C. Madden (Eds.), *Input in Second Language Acquisition*. Newbury House.
- Webb, S., & Chang, A. C.-S. (2015). Second language vocabulary learning through extensive reading with audio support: How do frequency and distribution of occurrence affect learning? *Language Teaching Research, 19*(6), 667–686.
- Webb, S., & Rodgers, M. P. H. (2009). Vocabulary demands of television programs. *Language Learning, 59*(2), 335–366.
