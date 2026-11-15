# A ciência da aprendizagem por trás deste curso

> **Resumo:** aprenda as regras de propósito, pratique-as *recuperando* da memória (não relendo),
> espalhe as revisões ao longo dos dias, consuma muito input que você entende quase todo (músicas, séries),
> leia muitos livros fáceis e produza frases que sejam corrigidas. O Duolingo cobre uma parte disso. Este curso acrescenta o resto.

Este documento explica cada princípio, as evidências por trás dele e **como este repositório o usa**.
As referências estão no final. Onde a evidência é fraca ou controversa, o texto avisa.

---

## 1. Por que parece que o Duolingo não está "ensinando" você

Não é impressão sua. Veja o que a pesquisa diz:

- **A pesquisa independente é pequena.** Loewen et al. (2019) acompanharam 9 alunos usando o Duolingo
  durante um semestre. Eles melhoraram, e o ganho teve correlação moderada com o tempo de uso. Os
  alunos também relataram frustração com o material didático e altos e baixos na motivação.
- **A pesquisa ligada à empresa mede só uma fatia.** Jiang et al. (2021, com autores do Duolingo)
  descobriram que quem terminou as primeiras unidades dos cursos de francês e espanhol do Duolingo
  alcançou notas de leitura e de compreensão oral comparáveis às de universitários após vários
  semestres. Fala e escrita não estavam em foco.
- **O que falta, na estrutura:** o Duolingo ensina quase tudo de forma *implícita*: a ideia é você
  deduzir os padrões a partir dos exemplos. Meta-análises mostram que a **instrução explícita** (dizer
  a regra e depois praticá-la) traz ganhos maiores e mais duradouros para alunos adultos
  do que a exposição puramente implícita (Norris & Ortega, 2000; Spada & Tomita, 2010). Adultos são bons
  em usar regras. Aproveite isso.

**Veredito:** mantenha o Duolingo como *aquecimento e ferramenta de hábito* (5–10 min). Não o trate como o currículo.

---

## 2. Os princípios

### 2.1 Gramática explícita + prática (primeiro a regra, depois a automatização)
- **Evidência:** Norris & Ortega (2000) e Spada & Tomita (2010) concluíram que a instrução explícita
  supera a implícita, em média, tanto para regras simples quanto complexas.
- **Ressalva:** *saber* uma regra não é o mesmo que *usá-la* em tempo real. A Teoria da Aquisição de
  Habilidades (DeKeyser, 2007) descreve três etapas: conhecimento declarativo ("eu sei a regra") →
  procedural ("consigo aplicar devagar") → automático ("sai certo sem eu pensar").
  Só muita prática faz você avançar.
- **Neste repositório:** toda unidade tem uma seção **Regra** (curta, precisa), depois **Exercícios**
  (app + LLM) e depois **Use** (fala/escrita).

### 2.2 Prática de recuperação (o efeito do teste)
- **Evidência:** puxar uma informação *para fora* da memória a fortalece muito mais do que colocá-la lá
  de novo. Em Karpicke & Roediger (2008), estudantes que aprendiam pares de palavras suaíli–inglês e
  continuavam se *testando* lembravam cerca de 80% uma semana depois. Os que continuavam *reestudando*
  lembravam cerca de 35%. Dunlosky et al. (2013) classificaram a prática de testes como uma das únicas duas
  técnicas de estudo de "alta utilidade".
- **Neste repositório:** os flashcards mostram a pergunta e fazem você responder *antes* de revelar.
  Os exercícios de conjugação fazem você digitar. Reler anotações não faz parte do método.

### 2.3 Repetição espaçada
- **Evidência:** Cepeda et al. (2006) reuniram 317 experimentos: espalhar as revisões no tempo
  é melhor que estudar tudo de uma vez. O intervalo ideal entre revisões cresce quanto mais tempo você quer lembrar.
- **Neste repositório:** o app agenda cada cartão para você vê-lo de novo pouco antes de
  esquecer (um algoritmo no estilo SM-2, da mesma família do Anki). Cartões difíceis voltam antes,
  os fáceis depois. O exercício de conjugação faz o mesmo para cada forma verbal (por exemplo *nous* + *manger*
  + imparfait): uma forma que você erra volta três perguntas depois e de novo nos dias seguintes, e uma forma
  que você sabe bem aparece cada vez menos. Como você digita a resposta, é o app que corrige, então você não
  consegue se dar ponto por um "quase" (Dunlosky & Rawson, 2012).
- **Evidência específica para idiomas:** uma meta-análise de 37 estudos de segunda língua (Kim & Webb, 2022)
  concluiu que o espaçamento em geral também ajuda no aprendizado de L2, embora o tamanho do benefício varie
  conforme a habilidade, os alunos e a atividade.
- 💡 **Curiosidade:** Paul Pimsleur publicou um calendário de "recordação em intervalos graduais" para o aprendizado
  de idiomas em **1967** (5 s, 25 s, 2 min, 10 min, 1 h, 5 h, 1 dia, 5 dias...). Algoritmos modernos de SRS,
  como o FSRS do Anki, ajustam esses intervalos aos dados da *sua própria* memória com aprendizado de
  máquina, o que talvez interesse você, dado o seu trabalho.

### 2.4 Input compreensível (e muito)
- **Evidência:** a Hipótese do Input de Krashen (1982) diz que adquirimos uma língua ao entender
  mensagens um pouco acima do nosso nível ("i+1"). A versão forte é criticada por ser difícil de testar,
  mas quase todo pesquisador concorda que **muito input é necessário**.
- **Quanto você precisa entender?** Cerca de **95–98% das palavras** de um texto para a
  leitura ficar confortável e as palavras novas poderem ser deduzidas pelo contexto (Nation, 2006). Para TV
  e filmes, cerca de 3.000 famílias de palavras dão uns 95% de cobertura (Webb & Rodgers, 2009).
  É por isso que vale a pena ter um vocabulário ordenado por frequência: as ~1.000 palavras mais comuns do francês cobrem
  a maior parte da fala do dia a dia.
- **Neste repositório:** a mídia é escolhida por nível. Comece com músicas (curtas, repetitivas),
  podcasts lentos e animação infantil, e depois passe para séries.

### 2.5 Legendas
- **Evidência:** uma meta-análise (Montero Perez et al., 2013) concluiu que **legendas na
  língua estudada** (áudio em francês + texto em francês) ajudam a compreensão oral e o aprendizado
  de vocabulário. Peters & Webb (2018) mostraram que os alunos aprendem vocabulário só de assistir TV
  na língua, ainda mais as palavras que aparecem com frequência.
- **Regra prática:**
  - **A1:** áudio em francês + legendas na sua língua tudo bem (compreensão primeiro).
  - **A2+:** áudio em francês + legendas em **francês** (é aqui que está o ganho).
  - **Reassista** o mesmo episódio ou cena: é na segunda vez que você repara nas coisas.

### 2.6 Músicas
- **Evidência:** Ludke, Ferreira & Overy (2014): adultos que aprenderam frases em húngaro
  **cantando** lembraram e produziram melhor do que os que só as falaram. É um estudo pequeno e de
  curto prazo, então trate como promissor, não como provado. As músicas também trazem repetição
  e blocos fixos de palavras, e grudam na cabeça, o que é revisão extra de graça.
- **Ressalva:** letras de música dobram a gramática e a pronúncia para caber no ritmo (sílabas
  engolidas, ordem de palavras incomum). Use músicas para treinar o ouvido e os blocos de palavras, não como
  referência gramatical.
- **Neste repositório:** veja [`french/media/music.pt.md`](../french/media/music.pt.md) para o
  método de estudo de músicas em 6 passos, e a Oficina de músicas do app para exercícios de lacunas
  nas letras que você colar.

### 2.7 Percepção (noticing)
- **Evidência:** a Hipótese da Percepção de Schmidt (1990): o input vira "intake" principalmente quando você
  *repara conscientemente* numa forma. Você pode ouvir "je suis allée" 100 vezes, mas enquanto não reparar no
  *-e* a mais, ele não fixa.
- **Neste repositório:** toda unidade tem uma tarefa de **Caça**, por exemplo "encontre todas as negações nesta música",
  que transforma a escuta passiva em percepção ativa.

### 2.8 Produção, interação e feedback corretivo
- **Evidência:**
  - *Hipótese da Produção* (Swain, 1985): ter que *produzir* a língua obriga você a perceber lacunas
    que a compreensão deixa passar.
  - *Hipótese da Interação* (Long, 1996): conversar negociando o sentido
    ("desculpa, o quê?") acelera o aprendizado.
  - Meta-análises de **feedback corretivo** (Li, 2010; Lyster & Saito, 2010) mostram que ele funciona,
    principalmente os *estímulos* que fazem você mesmo corrigir o erro, em vez de só receber
    a resposta.
- **Neste repositório:** os prompts de LLM em [`llm-tutor-prompts.pt.md`](llm-tutor-prompts.pt.md) mandam o
  modelo **estimular você a se autocorrigir primeiro** e só depois dar a forma correta.
  É aqui que os LLMs ganham dos apps.

### 2.9 Shadowing
- **O que é:** tocar um áudio nativo e repeti-lo em voz alta *ao mesmo tempo* (ou meio segundo atrás).
- **Evidência:** Hamada (2016) concluiu que o shadowing melhorou a compreensão oral,
  principalmente de alunos de nível mais baixo, por treinar a percepção dos sons. Também é um bom treino
  para o ritmo e a liaison do francês.
- **Neste repositório:** refrões de músicas e trechos de podcasts são o seu material de shadowing.

### 2.10 Intercalação
- **Evidência:** misturar tipos de problema numa mesma sessão (em vez de fazer todos do tipo A
  e depois todos do tipo B) parece mais difícil, mas melhora sua capacidade de *escolher* a regra certa
  (Kornell & Bjork, 2008, com estilos de pintura; os trabalhos de Rohrer com matemática). É uma das
  "dificuldades desejáveis" de Bjork. Para a **gramática** de L2 especificamente, Nakata & Suzuki (2019) concluíram que
  exercícios de gramática misturados levaram a uma retenção de longo prazo melhor que os em bloco, mesmo que a
  prática em bloco pareça melhor no próprio dia.
- **Neste repositório:** depois que alguns tempos verbais foram aprendidos, o exercício de conjugação os mistura.
  Isso importa mais na escolha entre passé composé e imparfait, no A2.

### 2.11 Leitura extensiva (e ler ouvindo)
- **Evidência:** uma meta-análise de 49 estudos (Jeon & Day, 2016) concluiu que ler grandes
  quantidades de texto fácil e escolhido por você melhora a proficiência em leitura, com **efeitos maiores para adultos
  e para programas mais longos**. Alunos que leram livros graduados *com o áudio* aprenderam uma boa
  parte das palavras desconhecidas que encontraram e guardaram boa parte delas meses depois (Webb & Chang, 2015).
- **Ressalva:** muitos estudos de leitura têm grupos de controle fracos, então trate os tamanhos de efeito exatos como
  aproximados. A direção da evidência é consistente.
- **Neste repositório:** a [escada de leitura](../french/media/reading.pt.md) vai de livros ilustrados a
  romances, com o teste das "5 palavras desconhecidas por página", derivado da cobertura de 98%.

### 2.12 O que não funciona bem
Dunlosky et al. (2013) classificam **reler, sublinhar e resumir** como de *baixa utilidade*.
Eles parecem produtivos porque o material fica familiar, mas familiar não é o mesmo que
lembrado. Se você se pegar relendo uma página de gramática, feche-a e **escreva três
frases** usando a regra.

---

## 3. O que a pesquisa com alunos de *francês* nos diz

### 3.1 O gênero dá para aprender, na maior parte, por regra
Roy Lyster (2006) analisou **9.961 substantivos franceses** e descobriu que cerca de **80% dos masculinos e
81% dos femininos** têm terminações que preveem o gênero. Então "decore o gênero de cada palavra"
é um mau conselho. Aprenda as regras de terminação e depois decore as exceções.
→ É exatamente isso que o exercício de **Gênero** do app faz: ele mostra a regra da terminação (ou avisa da
exceção) depois de cada resposta.

### 3.2 A imersão em francês no Canadá: só input não basta
Os programas canadenses de imersão em francês, em que crianças anglófonas aprendem as matérias escolares
*em* francês durante anos, são um dos contextos de aprendizado de línguas mais estudados do mundo.
A conclusão constante: os alunos desenvolvem **ótima compreensão e fluência**, mas alguns
erros de gramática **nunca desaparecem** (gênero, formas verbais, *tu/vous*, tempos do passado). Isso apesar de
milhares de horas de input compreensível.
- As pesquisas de Merrill Swain com esses alunos levaram diretamente à **Hipótese da Produção**
  (Swain, 1985): eles raramente precisavam *produzir* um francês preciso, então nunca percebiam suas lacunas.
- A revisão de Lyster de estudos em sala de aula com ~1.200 alunos de imersão (Lyster, 2004) mostrou que
  a **instrução focada na forma**, isto é, atenção explícita às regras mais prática e feedback,
  melhora a precisão exatamente nesses pontos problemáticos.

→ **Por que este curso mistura os dois:** input (músicas, filmes, leitura) *mais* regras explícitas, exercícios,
produção e correção. Qualquer metade sozinha fica devendo.

### 3.3 Cursos escolares ensinam pouquíssimas palavras
Estudos com alunos de francês em escolas do Reino Unido estimam que, depois de uns cinco anos, os estudantes no
nível do GCSE (~16 anos) conhecem só **~500–850 palavras em francês** (Milton, 2006). Mas são precisas ~3.000 famílias de palavras
para acompanhar 95% dos diálogos da TV (Webb & Rodgers, 2009).
→ **O volume de vocabulário é o gargalo.** É por isso que este curso se apoia na repetição espaçada de
palavras de alta frequência *e* em grandes quantidades de leitura e escuta.

### 3.4 O francês dos livros ≠ o francês falado
Os nativos omitem o *ne* da negação na maior parte da fala informal (*je sais pas*), e essa
omissão vem aumentando de geração em geração (Ashby, 1981, e estudos posteriores com falantes de Tours).
Estudos com alunos mostram que eles **mantêm o *ne* com muito mais frequência que os nativos**, o que os faz
soar livrescos; o tempo de imersão no francês falado muda isso (Regan, 1996; Dewaele, 2004).
→ **Neste repositório:** as páginas de gramática marcam as formas faladas e escritas, e a
[página de estrutura da frase](../french/grammar/09-sentence-structure.pt.md) cobre a ordem das palavras na fala
(deslocamento, *c'est … qui*) que os livros didáticos costumam pular.

---

## 4. Design prático da atenção (para um cérebro com TDAH)

Estas ideias vêm de pesquisas sobre hábito e motivação, não de pesquisas clínicas sobre TDAH. Elas costumam
funcionar bem quando a atenção é imprevisível:

| Problema | Resposta de design | Base |
|---|---|---|
| O "estudo mais tarde" nunca acontece | **Intenções de implementação**: "Quando eu fizer o café da manhã, faço 5 min de flashcards." | Meta-análise de Gollwitzer & Sheeran (2006): efeito médio a grande no alcance de metas |
| Tarefas grandes parecem impossíveis de começar | **Dia mínimo viável** = 5 min. Qualquer coisa a mais é bônus. | Baixar o custo de começar |
| Tédio → desistência | **Alternar as modalidades** dentro da sessão (exercício → música → fala) | A novidade mantém o engajamento |
| Distrações / ideias novas e brilhantes | **Estacionamento**: anote a ideia e volte a ela depois da sessão | Fecha o ciclo aberto sem agir nele |
| Progresso invisível | Contador de cartões pendentes, checklists das unidades, o diário de progresso | Feedback imediato e visível |

Veja [`study-system.pt.md`](study-system.pt.md) para a rotina concreta.

---

## 5. Curiosidades

- 🕐 **Quanto tempo leva o francês?** O Foreign Service Institute dos EUA põe o francês no grupo mais fácil
  para falantes de inglês: **~600–750 horas de aula** até a "proficiência profissional"
  (mais ou menos B2/C1). Com 45 min/dia, isso dá uns 2,5 anos, ou menos com muito input passivo.
  Para falantes de português o caminho tende a ser mais curto, graças ao vocabulário em comum.
  Escolas francesas dão estimativas aproximadas por nível, que variam muito: cerca de **90–100 h para o A1,
  ~200 h para o A2, ~350–400 h para o B1, ~500–650 h para o B2** (horas guiadas, acumuladas).
- 📏 Os **níveis do QECR** (A1 → C2) são o padrão europeu. Cada unidade aqui é marcada com um.
  As provas oficiais são o **DELF** (A1–B2) e o **DALF** (C1–C2). Marcar uma prova dá um prazo
  firme, algo a que cérebros com TDAH costumam responder bem.
- 🧬 **Se você fala português ou espanhol,** o francês compartilha milhares de cognatos com eles
  (*nation/nação/nación*). As partes difíceis são a pronúncia e a ortografia, não o vocabulário.

---

## Referências

- Ashby, W. J. (1981). The loss of the negative particle *ne* in French: A syntactic change in progress. *Language, 57*(3), 674–687.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.
- DeKeyser, R. (2007). Skill acquisition theory. In B. VanPatten & J. Williams (Eds.), *Theories in Second Language Acquisition*. Erlbaum.
- Dewaele, J.-M. (2004). Retention or omission of the *ne* in advanced French interlanguage: The variable effect of extralinguistic factors. *Journal of Sociolinguistics, 8*(3), 433–450.
- Dunlosky, J., & Rawson, K. A. (2012). Overconfidence produces underachievement: Inaccurate self evaluations undermine students' learning and retention. *Learning and Instruction, 22*(4), 271–280.
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
