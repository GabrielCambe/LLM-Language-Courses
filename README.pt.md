# Cursos de Idiomas com LLM

Um experimento: **será que um LLM consegue montar um curso de idiomas mais bem estruturado que um app gamificado?**

Apps como o Duolingo são bons para manter o hábito e para a memorização rápida, mas quase nunca
explicam *por que* a língua funciona do jeito que funciona, e oferecem pouquíssimo input longo
(músicas, filmes, conversas) e pouca produção de verdade (falar e escrever frases suas).
Este repositório tenta preencher essa lacuna. Ele tem:

- uma **trilha estruturada**, com regras gramaticais explícitas, em uma ordem em que cada passo se apoia no anterior,
- **mídia de verdade** (música, filmes, animação) ligada a cada passo,
- **métodos de estudo com base em pesquisa** (repetição espaçada, prática de recuperação, input compreensível, shadowing...),
- **prompts de LLM** que transformam um chatbot em tutor, corretor e parceiro de conversa,
- um pequeno **app interativo** para exercícios e flashcards.

Duolingo, filmes, música e conversa continuam no plano. Só que agora eles alimentam uma estrutura,
em vez de serem o plano inteiro.

Cursos: um ✅ quer dizer que o curso tem **páginas de lição** escritas (unidade por unidade: regras, vocabulário, mídia,
tarefas). Um curso sem elas tem só um roteiro: você gera cada página de lição com o
[`docs/unit-template.pt.md`](docs/unit-template.pt.md) quando chegar nela.

| Curso | Páginas de lição | No app de estudo |
|---|---|---|
| 🇫🇷🇧🇪 **Francês**: o primeiro e o mais completo ([roteiro](french/README.pt.md)) | ✅ Unidades 0–4 (de 27) + referência gramatical + guias de mídia | Todas as abas: flashcards, conjugação, gênero, números, músicas, tutor |
| 🇪🇸 **Espanhol**: feito para falantes de português, estudado junto com o francês ([roteiro](spanish/README.pt.md)) | ✅ Unidades 0–3 (de 21) | Flashcards (unidades 0–3) + tutor |
| 🇮🇹 **Italiano**: para a prova CILS B1 Cittadinanza, depois B2, feito para falantes de português ([roteiro](italian/README.pt.md)) | ✅ Unidades 0–4 (de 32) + guia da prova | Flashcards (unidades 0–4) + tutor |
| 🏛️ **Latim**: para leitura ([roteiro](latin/README.pt.md)) | ❌ Nenhuma ainda: só o roteiro | Flashcards (unidades 0–3) + tutor |
| 🇵🇱 **Polonês** ([roteiro](polish/README.pt.md)) | ❌ Nenhuma ainda: só o roteiro | Flashcards (unidades 0–3) + tutor |
| 🇯🇵 **Japonês**: kana primeiro ([roteiro](japanese/README.pt.md)) | ❌ Nenhuma ainda: só o roteiro | Flashcards (unidades 0–3) + tutor |

<p class="llc-app-cta"><a href="https://gabrielcambe.github.io/LLM-Language-Courses/app/">📱 Abrir o app de estudo →</a></p>

🌐 **Site (celular e computador):** https://gabrielcambe.github.io/LLM-Language-Courses/
📱 **App de estudo:** https://gabrielcambe.github.io/LLM-Language-Courses/app/ (adicione à tela inicial do celular)

🇧🇷 **Idioma:** todas as páginas existem em português e em inglês. Use o botão 🌐 no topo de cada página para trocar;
a escolha vale também para o app.

---

## Comece aqui (10 minutos)

1. Leia [`docs/learning-science.pt.md`](docs/learning-science.pt.md) para entender *por que* o método é assim (dê uma olhada no resumo).
2. Leia [`docs/study-system.pt.md`](docs/study-system.pt.md) para a rotina diária e semanal, incluindo o "dia mínimo viável".
3. Abra [`french/README.pt.md`](french/README.pt.md) para ver o roteiro. Comece pela **Unidade 0 (sons)**.
4. Abra o [app de estudo](app/index.html): online, no link acima, ou com um clique duplo em `app/index.html` no seu computador.

## Mapa do repositório

```
docs/
  learning-science.md     A pesquisa por trás do método (com referências)
  study-system.md         Rotina diária/semanal, sessões pensadas para TDAH, guarda de escopo
  llm-tutor-prompts.md    Prompts para copiar e colar: tutor, corretor, parceiro de conversa, explicador de músicas
  unit-template.md        O modelo que um LLM usa para gerar novas unidades (o coração do experimento)
french/
  README.md               Roteiro A0 → A2 (+ como seguir para o B1)
  units/                  Lições unidade por unidade (regras + vocabulário + mídia + tarefas)
  grammar/                Referência gramatical, uma família de regras por arquivo (incl. estrutura da frase)
  media/                  Música (Angèle primeiro!), filmes, séries, podcasts, escada de leitura, por nível
spanish/
  README.md               Roteiro A0 → A2, falsos amigos, como estudar junto com o francês
  units/                  Páginas de lição das unidades 0–3
italian/
  README.md               Roteiro A0 → B1 (CILS B1 Cittadinanza) → B2, a prova, falsos amigos
  units/                  Páginas de lição das unidades 0–4
latin/, polish/, japanese/
  README.md               Só roteiros (as páginas de lição são geradas conforme você avança)
app/
  index.html              App de estudo offline: flashcards com SRS, conjugação, gênero, números, oficina de músicas
```

Cada página `nome.md` tem a versão em português `nome.pt.md` ao lado.

## O diário do experimento

Cada vez que terminar uma unidade, acrescente uma linha em [`french/progress-log.pt.md`](french/progress-log.pt.md):
o que funcionou, o que foi chato, o que o LLM errou. Esse diário são os dados do experimento.
Use-o para melhorar o modelo de unidade antes de começar o próximo idioma.

## Uma nota sobre letras de música e direitos autorais

Letras de música têm direitos autorais, então **este repositório nunca guarda letras**. As unidades indicam músicas e
dizem o que prestar atenção ao ouvir. A *Oficina de músicas* do app deixa você procurar letras
([LRCLIB](https://lrclib.net)) ou colá-las (por exemplo, do YouTube Music). Elas ficam no armazenamento local do seu navegador e nunca vão para o repositório.
