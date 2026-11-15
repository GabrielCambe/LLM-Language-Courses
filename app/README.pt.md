# App de estudo

Um pequeno app de estudo offline: HTML/JS puro, sem instalação, sem build, sem conta.

## Como abrir
- **No computador:** clique duas vezes em `index.html` (ou `open app/index.html` no macOS).
- **Online (celular ou computador):** https://gabrielcambe.github.io/LLM-Language-Courses/app/
  No celular, use a opção *Adicionar à tela inicial* do navegador para ter um ícone de app.
  O progresso fica guardado por aparelho/navegador, então use **Hoje → Backup** para levá-lo de um aparelho para outro.
  O backup também guarda as marcações dos checklists das páginas do curso; restaurar soma essas marcações às que já estão no aparelho.
- O site é gerado pelo **GitHub Pages** a partir da branch padrão (configurações em `/_config.yml`).
  Ele é reconstruído automaticamente ~1 minuto depois de cada push.

Funciona em celulares e computadores: o layout se adapta até 320 px de largura. No celular as abas usam
nomes curtos (Cartões, Verbos, Músicas), e as teclas de acento só aparecem enquanto você digita. Você também pode
manter pressionada uma letra no teclado do celular (e → é è ê).

**Idioma:** o menu 🌐 na barra do topo troca a interface entre **English** e **Português (BR)**.
A primeira visita segue o idioma do seu aparelho. A "sua língua" do Tutor também segue, a não ser que você tenha digitado outra.
Em todos os modos do Tutor, explicações, traduções, dicas e correções vêm nessa língua (as transcrições de pronúncia
usam a ortografia dela); só a língua do curso que você está praticando fica como está.
Os significados e as notas dos cartões também seguem o idioma (os cartões vão de FR → PT em vez de FR → EN), e os links
das unidades e do roteiro abrem a página do curso nesse idioma. Toda página do curso tem uma versão em português, e o
botão 🌐 do site troca entre as duas. A escolha feita no site vale para o app, e vice-versa.

**Curso:** o menu com a bandeira (no canto superior esquerdo) escolhe o curso: francês, espanhol, italiano, latim, polonês ou japonês.
Cada curso guarda o próprio progresso, então trocar de curso nunca mexe nos cartões de outro.
Espanhol, italiano, latim, polonês e japonês são cursos iniciais: Hoje, Flashcards (unidades 0–3; italiano 0–4) e o Tutor.
No seletor de unidades da aba Hoje, ✅ marca as unidades que têm página de lição (francês 0–4, espanhol 0–3, italiano 0–4); nas
outras, o link da unidade avisa e abre o roteiro. Conjugação, Gênero,
Números e a Oficina de músicas por enquanto são só do francês. O áudio do latim usa uma voz italiana (não existem vozes de latim).
No japonês, digite as respostas com o teclado japonês do aparelho; as teclas de acento acrescentam o traço de vogal longa ー e os kana pequenos (っ ゃ ゅ ょ).

**Modo claro / escuro:** o botão na barra do topo alterna 🌓 Auto (segue o aparelho) → ☀️ Claro → 🌙 Escuro.
O site do curso tem o mesmo botão, e uma escolha vale para os dois.

## O que tem dentro

| Aba | O que treina | Princípio da pesquisa |
|---|---|---|
| **Hoje** | Calendário de prática no topo (visão do mês no estilo do GitHub, com os dias em que você estudou), unidade atual, cartões pendentes, timer de foco de 25 min, checklist da sessão, estacionamento | Intenções de implementação, guarda de escopo |
| **Flashcards** | Vocabulário por unidade, FR→PT e depois PT→FR, repetição espaçada SM-2, áudio 🔊 | Prática de recuperação + espaçamento |
| **Conjugação** | Digite a forma verbal; misture verbos e tempos (liberados por unidade); as formas erradas voltam 3 perguntas depois, e cada forma tem o seu próprio calendário SM-2; um pronome por pergunta (il, elle ou on), mostrado com o significado na sua língua (on = "a gente"), e a resposta lista em linhas separadas cada pronome que tem a mesma forma, com o significado e o seu próprio 🔊 | Recuperação + intercalação + espaçamento |
| **Gênero** | le ou la? com a regra da terminação (ou a exceção) depois de cada resposta | Regra explícita + feedback imediato |
| **Números** | Ouvir → algarismos, ler → algarismos, algarismos → palavras; variantes 🇫🇷/🇧🇪/🇨🇭 | Automatismo na compreensão oral |
| **Oficina de músicas** | 🔍 Encontre a letra pelo título e artista (ou cole) → clique nas palavras para criar cartões, lacunas enquanto ouve | Percepção + recuperação com mídia real |
| **💬 Tutor** | Converse com o Claude em 6 modos (Tutor, Corretor, Conversa, Explicador de músicas, Pronúncia, Leitura), ciente da sua unidade atual | Produção + feedback corretivo, recuperação |

### O Tutor e a sua conta Claude
- **Assinatura Claude Pro / Max:** assinaturas não podem ser usadas por outros apps. A aba Tutor
  *copia um prompt pronto* (com a sua unidade e o modo) e abre o Claude.ai, onde você cola.
- **Chave de API (chat dentro do app):** crie uma chave no [Claude Console](https://platform.claude.com/settings/keys).
  O uso da API é cobrado separadamente do Pro, como créditos pré-pagos. Uma mensagem de tutoria custa mais ou menos 1–2 centavos de dólar com o
  Claude Opus 5.5 (o padrão) e uma fração de centavo com o Claude Haiku 5.5 (escolha em *Configurações do Tutor*).
  **Defina um limite de gasto mensal no Console.**
- A chave fica guardada só no seu navegador (`localStorage`, ou só na aba se você desmarcar *Lembrar*),
  é enviada só para `api.anthropic.com` e nunca entra em **Hoje → Backup**. Evite salvá-la num computador compartilhado.
  Qualquer pessoa que consiga rodar scripts em `gabrielcambe.github.io` (qualquer um dos seus sites do GitHub Pages) poderia lê-la, então mantenha esse site confiável.
- Notas técnicas: o [SDK oficial da Anthropic para TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)
  (versão fixa, carregado do jsDelivr só quando o Tutor é usado) chama a API direto do navegador
  (`dangerouslyAllowBrowser`). As respostas chegam em streaming, usam `effort: "low"` para ganhar velocidade, cache de prompt para baratear as mensagens seguintes
  e fallbacks de recusa no servidor (`fallbacks: "default"`) no Opus/Sonnet. O histórico só cresce (append-only).

### Notas
- 🔊 usa a **síntese de voz** do seu sistema. Se não soar francês, instale uma voz francesa
  (macOS: Ajustes do Sistema → Acessibilidade → Conteúdo Falado; Windows: Configurações → Hora e Idioma → Fala;
  Android/iOS: normalmente já vem instalada).
- **Cartões novos/dia** começa em 10. Mantenha baixo; as revisões se acumulam rápido. Os cartões PT→FR (produção)
  de uma palavra só aparecem depois que você acertou o cartão FR→PT dela num dia anterior.
- **Importar cartões:** use o prompt *Criador de Flashcards* em `docs/llm-tutor-prompts.pt.md` e cole o JSON
  em Flashcards → Configurações do baralho. Cada cartão pode ter um significado `pt`, um `en` ou os dois; o app mostra
  o do idioma da interface (ou o outro, se só houver ele).
- As **letras** ficam só no armazenamento local do seu navegador. Não as coloque no repositório.
- **Encontrar letra** pesquisa no [LRCLIB](https://lrclib.net), um banco de letras comunitário e gratuito (sem chave, sem conta).
  Só o título e o artista que você digitou são enviados, e só quando você aperta o botão. Letras da comunidade podem ter
  erros de digitação ou ser de outra versão da música, então confira com a gravação.

## Desenvolvimento
- Vocabulário: `data/vocab.js` (francês, por unidade), `data/spanish.js`, `data/italian.js`, `data/latin.js`, `data/polish.js`, `data/japanese.js`. Verbos franceses: `data/verbs.js`.
- Significados e notas em português: um arquivo `data/*.pt.js` por baralho (`vocab.pt.js` para o francês), indexado pelo ID do cartão.
  Um cartão novo precisa de uma entrada ali também, e um verbo francês novo, de um significado `pt` (os testes conferem os dois).
- Cursos: `data/courses.js` (unidades, voz, teclas de acento, quais abas existem, onde o progresso é guardado).
  Um curso novo é uma nova entrada ali mais os seus próprios arquivos de dados. Conjugação, Gênero, Números e a Oficina de músicas
  foram escritos para o francês, então liste só as abas que o curso realmente suporta. O Tutor funciona para qualquer curso:
  as linhas específicas do curso e os cenários de role-play ficam nos campos `tutor` e `scenarios` do curso.
- Textos da interface: `i18n.js`, um bloco por idioma. Acrescente toda chave nova aos dois blocos (os testes conferem isso).
- Páginas do curso: cada `nome.md` tem uma versão em português `nome.pt.md` na mesma pasta, com links para outras páginas `.pt.md`.
  Ao mudar uma, mude as duas.
- Não renomeie as entradas francesas existentes: o texto em francês é o ID do cartão.
- **Quando mudar qualquer arquivo do app, atualize a data do `?v=` em `index.html`** (todos os links compartilham um único valor).
  Os celulares guardam cada arquivo em cache separadamente, então sem isso podem misturar arquivos novos e velhos. Os testes exigem um valor único.
- Testes: `node app/test.mjs` (precisa do Playwright: `npm i -D playwright`, ou uma instalação global com
  `NODE_PATH="$(npm root -g)"`).

🧭 *Guarda de escopo:* o app já é bom o bastante para estudar. Funcionalidades novas vão primeiro para o estacionamento.
