// Course registry: one entry per target language. The course selector in the top bar
// lists these; the app reads everything course-specific (units, decks, voice, accents)
// from the chosen entry. Load after the course's own data files.
// Text fields are { en, "pt-BR" }: one value per interface language.
window.LLC_COURSES = [
  {
    id: "fr",
    flag: "🇫🇷",
    label: { en: "French", "pt-BR": "Francês" }, // selector and titles
    name: { en: "French", "pt-BR": "francês" }, // inside a sentence
    folder: "french", // course pages live in /french/
    storagePrefix: "llc.fr.", // progress is kept per course; don't change it, or saved progress is lost
    voiceLang: "fr-FR",
    voiceSample: "Bonjour ! Je m'appelle Angèle, et j'habite à Bruxelles.", // "Test voice" button
    accents: "é è ê à â ç ù û ô î ï ë œ",
    // Drills written for this course. Conjugation, gender and numbers are French-specific code.
    tabs: ["today", "cards", "conj", "gender", "numbers", "songs", "tutor"],
    vocab: window.FR_VOCAB,
    verbs: window.FR_VERBS,
    tenses: window.FR_TENSES,
    // Index = unit number. page: the unit's lesson, relative to the course folder.
    units: [
      { en: "The sound system", "pt-BR": "O sistema de sons", page: "units/unit-00-sounds.md" },
      { en: "Bonjour! Who are you? (être)", "pt-BR": "Bonjour! Quem é você? (être)", page: "units/unit-01-etre.md" },
      { en: "Things and people (gender & articles)", "pt-BR": "Coisas e pessoas (gênero e artigos)", page: "units/unit-02-gender-articles.md" },
      { en: "Having and describing (avoir + adjectives)", "pt-BR": "Ter e descrever (avoir + adjetivos)", page: "units/unit-03-avoir-adjectives.md" },
      { en: "Doing things (-ER verbs)", "pt-BR": "Fazer coisas (verbos em -ER)", page: "units/unit-04-er-verbs.md" },
      { en: "Saying no, asking why", "pt-BR": "Dizer não, perguntar por quê" },
      { en: "Mine, yours, theirs", "pt-BR": "Meu, seu, deles" },
      { en: "Going places", "pt-BR": "Ir a lugares" },
      { en: "Numbers, time and dates", "pt-BR": "Números, horas e datas" },
      { en: "Want, can, must", "pt-BR": "Querer, poder, dever" },
      { en: "Food and quantities", "pt-BR": "Comida e quantidades" },
      { en: "Tell me what to do", "pt-BR": "Diga o que fazer" },
      { en: "Near future and near past", "pt-BR": "Futuro próximo e passado recente" },
      { en: "A1 review + milestone", "pt-BR": "Revisão A1 + marco" },
      { en: "Passé composé (avoir)", "pt-BR": "Passé composé (avoir)" },
      { en: "Passé composé (être)", "pt-BR": "Passé composé (être)" },
      { en: "Daily routine", "pt-BR": "Rotina diária" },
      { en: "Object pronouns", "pt-BR": "Pronomes objeto" },
      { en: "Imparfait", "pt-BR": "Imparfait" },
      { en: "Telling a story", "pt-BR": "Contar uma história" },
      { en: "y and en", "pt-BR": "y e en" },
      { en: "Comparisons", "pt-BR": "Comparações" },
      { en: "Futur simple", "pt-BR": "Futur simple" },
      { en: "Relative pronouns", "pt-BR": "Pronomes relativos" },
      { en: "Conditionnel", "pt-BR": "Conditionnel" },
      { en: "Subjonctif (intro)", "pt-BR": "Subjonctif (introdução)" },
      { en: "A2 milestone", "pt-BR": "Marco A2" },
    ],
  },
];
