// Verb data for the conjugation drill.
// present: [je, tu, il/elle/on, nous, vous, ils/elles]
// pp: past participle · aux: auxiliary for the passé composé
// fut: futur simple stem(s); first one is canonical, others are also accepted
// imp: imparfait stem override (default: nous form minus "-ons")
// unit: unit where the verb is introduced
window.FR_VERBS = [
  { inf: "être", en: "to be", unit: 1, present: ["suis", "es", "est", "sommes", "êtes", "sont"], pp: "été", aux: "avoir", fut: ["ser"], imp: "ét" },
  { inf: "avoir", en: "to have", unit: 3, present: ["ai", "as", "a", "avons", "avez", "ont"], pp: "eu", aux: "avoir", fut: ["aur"] },
  { inf: "parler", en: "to speak", unit: 4, present: ["parle", "parles", "parle", "parlons", "parlez", "parlent"], pp: "parlé", aux: "avoir", fut: ["parler"] },
  { inf: "aimer", en: "to like/love", unit: 4, present: ["aime", "aimes", "aime", "aimons", "aimez", "aiment"], pp: "aimé", aux: "avoir", fut: ["aimer"] },
  { inf: "habiter", en: "to live", unit: 4, present: ["habite", "habites", "habite", "habitons", "habitez", "habitent"], pp: "habité", aux: "avoir", fut: ["habiter"] },
  { inf: "travailler", en: "to work", unit: 4, present: ["travaille", "travailles", "travaille", "travaillons", "travaillez", "travaillent"], pp: "travaillé", aux: "avoir", fut: ["travailler"] },
  { inf: "écouter", en: "to listen", unit: 4, present: ["écoute", "écoutes", "écoute", "écoutons", "écoutez", "écoutent"], pp: "écouté", aux: "avoir", fut: ["écouter"] },
  { inf: "regarder", en: "to watch", unit: 4, present: ["regarde", "regardes", "regarde", "regardons", "regardez", "regardent"], pp: "regardé", aux: "avoir", fut: ["regarder"] },
  { inf: "chanter", en: "to sing", unit: 4, present: ["chante", "chantes", "chante", "chantons", "chantez", "chantent"], pp: "chanté", aux: "avoir", fut: ["chanter"] },
  { inf: "manger", en: "to eat", unit: 4, present: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"], pp: "mangé", aux: "avoir", fut: ["manger"] },
  { inf: "commencer", en: "to begin", unit: 4, present: ["commence", "commences", "commence", "commençons", "commencez", "commencent"], pp: "commencé", aux: "avoir", fut: ["commencer"] },
  { inf: "préférer", en: "to prefer", unit: 4, present: ["préfère", "préfères", "préfère", "préférons", "préférez", "préfèrent"], pp: "préféré", aux: "avoir", fut: ["préférer", "préfèrer"] },
  { inf: "oublier", en: "to forget", unit: 4, present: ["oublie", "oublies", "oublie", "oublions", "oubliez", "oublient"], pp: "oublié", aux: "avoir", fut: ["oublier"] },
  { inf: "aller", en: "to go", unit: 7, present: ["vais", "vas", "va", "allons", "allez", "vont"], pp: "allé", aux: "être", fut: ["ir"] },
  { inf: "faire", en: "to do/make", unit: 7, present: ["fais", "fais", "fait", "faisons", "faites", "font"], pp: "fait", aux: "avoir", fut: ["fer"] },
  { inf: "vouloir", en: "to want", unit: 9, present: ["veux", "veux", "veut", "voulons", "voulez", "veulent"], pp: "voulu", aux: "avoir", fut: ["voudr"] },
  { inf: "pouvoir", en: "can", unit: 9, present: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"], pp: "pu", aux: "avoir", fut: ["pourr"] },
  { inf: "devoir", en: "must", unit: 9, present: ["dois", "dois", "doit", "devons", "devez", "doivent"], pp: "dû", aux: "avoir", fut: ["devr"] },
  { inf: "savoir", en: "to know", unit: 9, present: ["sais", "sais", "sait", "savons", "savez", "savent"], pp: "su", aux: "avoir", fut: ["saur"] },
  { inf: "prendre", en: "to take", unit: 9, present: ["prends", "prends", "prend", "prenons", "prenez", "prennent"], pp: "pris", aux: "avoir", fut: ["prendr"] },
  { inf: "venir", en: "to come", unit: 9, present: ["viens", "viens", "vient", "venons", "venez", "viennent"], pp: "venu", aux: "être", fut: ["viendr"] },
  { inf: "boire", en: "to drink", unit: 10, present: ["bois", "bois", "boit", "buvons", "buvez", "boivent"], pp: "bu", aux: "avoir", fut: ["boir"] },
  { inf: "finir", en: "to finish", unit: 11, present: ["finis", "finis", "finit", "finissons", "finissez", "finissent"], pp: "fini", aux: "avoir", fut: ["finir"] },
  { inf: "choisir", en: "to choose", unit: 11, present: ["choisis", "choisis", "choisit", "choisissons", "choisissez", "choisissent"], pp: "choisi", aux: "avoir", fut: ["choisir"] },
  { inf: "attendre", en: "to wait", unit: 11, present: ["attends", "attends", "attend", "attendons", "attendez", "attendent"], pp: "attendu", aux: "avoir", fut: ["attendr"] },
  { inf: "vendre", en: "to sell", unit: 11, present: ["vends", "vends", "vend", "vendons", "vendez", "vendent"], pp: "vendu", aux: "avoir", fut: ["vendr"] },
  { inf: "partir", en: "to leave", unit: 11, present: ["pars", "pars", "part", "partons", "partez", "partent"], pp: "parti", aux: "être", fut: ["partir"] },
  { inf: "dire", en: "to say", unit: 11, present: ["dis", "dis", "dit", "disons", "dites", "disent"], pp: "dit", aux: "avoir", fut: ["dir"] },
  { inf: "voir", en: "to see", unit: 11, present: ["vois", "vois", "voit", "voyons", "voyez", "voient"], pp: "vu", aux: "avoir", fut: ["verr"] },
  { inf: "mettre", en: "to put", unit: 11, present: ["mets", "mets", "met", "mettons", "mettez", "mettent"], pp: "mis", aux: "avoir", fut: ["mettr"] },
];

// Tenses and the unit where each one is taught.
window.FR_TENSES = [
  { id: "present", label: "Présent", unit: 1 },
  { id: "futurProche", label: "Futur proche", unit: 12 },
  { id: "passeCompose", label: "Passé composé", unit: 14 },
  { id: "imparfait", label: "Imparfait", unit: 18 },
  { id: "futurSimple", label: "Futur simple", unit: 22 },
];
