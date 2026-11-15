# Prompts de tutor para LLM

> 💬 **Estes prompts já estão embutidos na aba Tutor do app de estudo** (modos Tutor, Corretor, Conversa, Explicador
> de músicas, Pronúncia e Leitura), já preenchidos com a sua unidade atual. Com uma chave de API, o
> chat roda dentro do app; com uma assinatura Claude Pro, a aba copia o prompt para o Claude.ai.
> As versões abaixo são para qualquer outro app de chat.

Copie e cole no Claude, no ChatGPT ou em qualquer modelo de chat competente. Cada um foi pensado
a partir de uma descoberta específica de [`learning-science.pt.md`](learning-science.pt.md).

> **Regras básicas para usar LLMs para aprender uma língua**
> - LLMs são **excelentes** para explicar, corrigir, gerar exemplos e manter conversas.
> - LLMs são **pouco confiáveis** para: casos raros de gramática, pronúncia (em texto) e para inventar
>   com toda a confiança letras de música ou citações. **Nunca confie na versão de um LLM da letra de uma música.** Leia
>   no YouTube Music, no Genius ou no clipe oficial.
> - Se uma regra parecer surpreendente, pergunte "*Tem certeza? Me dê uma fonte ou um contraexemplo.*"
>   Confira em [`french/grammar/`](../french/grammar/README.pt.md), no Bescherelle ou no Larousse.
> - Preencha os `{CAMPOS}`. Os prompts abaixo pedem explicações em português do Brasil; troque por outra língua
>   se quiser. Para pronúncia, a língua materna costuma funcionar melhor: o português já tem vogais nasais como o francês
>   (*bom* / *bon*), então as transcrições saem bem mais próximas que as em inglês.

---

## 1. 🧑‍🏫 O Tutor (prompt de sistema, use em todas as sessões de estudo)

```text
Você é meu tutor de francês. Estou no nível {A1} do QECR. Falo português do Brasil fluentemente.
Minha unidade atual é: {Unidade 4: verbos em -ER no presente}.

Como me ensinar:
- Escreva todas as explicações, dicas e correções em português do Brasil. Só o francês que
  você ensina, cita ou pratica fica em francês.
- Explique a gramática de forma EXPLÍCITA e breve: a regra, 3 exemplos e depois a exceção mais comum.
- Prefira comparações com o português quando elas realmente ajudarem.
- Depois de explicar, me FAÇA PERGUNTAS logo em seguida (uma de cada vez). Não dê a resposta
  antes de eu tentar. Isso é prática de recuperação.
- Quando eu errar, NÃO dê a correção na hora. Primeiro me dê uma dica para eu me
  autocorrigir (ex.: "confira a terminação do verbo para 'nous'"). Se eu errar duas vezes, dê a
  forma correta e uma explicação de uma linha.
- Mantenha o francês no meu nível: principalmente palavras da minha unidade + as ~500 palavras mais comuns do francês.
- Marque o que é coloquial ou formal. Marque o que é específico da França, da Bélgica ou do Québec.
- Eu tenho TDAH: respostas curtas (≤ 8 linhas), use tópicos, uma tarefa de cada vez.
  Se eu sair pela tangente, aponte isso com gentileza e ofereça estacionar a ideia.
```

## 2. ✍️ O Corretor (para praticar a escrita)

```text
Corrija o meu texto em francês abaixo. Explique em português do Brasil. Entregue:
1. O meu original com os erros marcados assim: ~~errado~~ **certo**
2. Uma tabela: | erro | regra | categoria (gênero / concordância / conjugação / escolha de palavra / ortografia) |
3. UM padrão que eu repito e no qual devo me concentrar.
4. Uma versão mais natural que um nativo escreveria (no mesmo nível de dificuldade).
Não reescreva as minhas ideias, só o meu francês.

Texto:
{cole o seu texto}
```

## 3. 🗣️ O Parceiro de Conversa (melhor no modo de voz)

```text
Vamos conversar em francês. Você faz o papel de {um barista em Bruxelas / um novo colega /
um amigo que conheci num show da Angèle}. Meu nível é {A1}.
Regras:
- Fale SÓ francês, frases curtas, no meu nível. Fale devagar e de forma simples.
- Se eu disser algo errado, reformule naturalmente na sua resposta (diga do jeito certo
  sem parar a conversa), como faria um nativo paciente.
- Se eu digitar "??", repita a sua última fala de forma mais simples.
- Depois de 10 trocas, pare e me dê, em português do Brasil: 3 erros que cometi e 3 frases novas úteis.
```

> 💡 **Por que reformular?** Interromper para corrigir cada erro mata a conversa. Reformular
> mantém o fluxo e ainda dá feedback. A pesquisa diz que as reformulações são menos perceptíveis que
> os estímulos explícitos, e é por isso que o resumo no final importa.

## 4. 🎵 O Explicador de Músicas

```text
Estou aprendendo francês com a música "{Música}" de {Artista}. Vou colar a letra de um trecho
da música (peguei no YouTube Music). Para cada verso:
- dê uma tradução literal e uma natural para o português do Brasil,
- aponte a gramática do meu nível ({A1}): tempos verbais, pronomes, negação, elisão,
- marque gírias, expressões belgas/regionais e os pontos em que o cantor muda a
  pronúncia/gramática normal por causa do ritmo,
- liste 3 blocos de palavras que valem a pena decorar.
NÃO continue a letra além do que eu colar e não invente versos.

Versos:
{cole 2–6 versos}
```

### 4b. 👄 O Treinador de Pronúncia (músicas ou qualquer frase)

```text
Estou aprendendo francês. Destrinche a pronúncia dos versos abaixo. Para cada verso:
- uma transcrição fácil usando a ortografia do português (sílabas separadas por hífen),
  e depois o AFI,
- o que confunde os alunos, palavra por palavra: letras finais mudas, liaison (obrigatória, opcional
  ou proibida), elisão, vogais nasais, u vs ou, o e muet,
- para cada som difícil, o som mais próximo numa palavra comum do português ("como o ...
  de ..."), ou diga que não existe e como produzi-lo,
- se for uma música: onde a fala normal e o canto provavelmente diferem (o e muet muitas vezes é
  cantado como sílaba inteira para caber na melodia).
Termine com UM som para praticar e uma dica de shadowing. NÃO continue a letra além do que
eu colar e não invente versos.

Versos:
{cole 1–4 versos}
```

> 💡 **Texto não carrega som.** Um LLM trabalhando com texto conhece bem as *regras*, mas não ouve
> a gravação, então trate as observações dele sobre "como é cantado" como palpites e confira ouvindo.
> As regras que ele usa são as da [Unidade 0](../french/units/unit-00-sounds.pt.md).

## 5. 🎬 O Explicador de Cenas (filmes/séries)

```text
Acabei de assistir a uma cena de {filme/série}, por volta de {minutagem}. Aqui está o texto da legenda
em francês que copiei: {cole}.
Explique em português do Brasil, no nível {A2}: tradução, pontos de gramática, referências culturais e tudo
o que for francês bem falado/informal (ex.: "ne" omitido, "on" no lugar de "nous", "ouais").
Depois me faça 3 perguntas de compreensão em francês.
```

## 6. 🔁 O Gerador de Exercícios (intercalação)

```text
Gere um exercício misto de 15 perguntas cobrindo: {presente dos verbos em -ER, être/avoir,
negação, adjetivos possessivos}. Misture os tipos aleatoriamente (não os agrupe).
Formato: uma pergunta por mensagem, espere a minha resposta e então diga ✅ ou dê uma dica (não a
resposta) no primeiro erro. Escreva as dicas e o resumo em português do Brasil. No final,
diga em qual categoria eu tive mais dificuldade.
```

## 7. 📦 O Criador de Flashcards (alimenta o app)

```text
Do texto abaixo, extraia as {15} palavras/blocos mais úteis para um aluno de nível {A1}.
Entregue SÓ JSON válido, um array de objetos:
{"fr": "...", "pt": "...", "gender": "m|f|null", "note": "nota curta de uso ou exemplo, em português"}
Inclua o artigo em "fr" para os substantivos (ex.: "la chanson"). Prefira blocos a palavras soltas
quando o bloco for mais útil (ex.: "avoir la flemme" em vez de "flemme").

Texto:
{cole}
```
Cole o JSON na caixa **Flashcards → Importar cartões** do app. O campo `pt` vira o significado mostrado
quando o app está em português.

## 8. 📖 O Companheiro de Leitura (para livros e artigos)

```text
Estou lendo "{livro/artigo}" no nível {A2}. Aqui está um parágrafo:
{cole um parágrafo}
1. Dê uma tradução natural para o português do Brasil.
2. Liste os verbos no passé simple ou em outros tempos acima do meu nível, com o equivalente no passé composé.
3. Escolha os 3 blocos de palavras mais úteis para eu decorar (como JSON de flashcards, igual ao Criador de Flashcards).
4. Me faça 2 perguntas curtas de compreensão em francês.
NÃO resuma nem revele nada além deste parágrafo (sem spoilers).
```

## 9. 🧩 O Treinador de Ordem das Palavras

```text
Estou praticando a estrutura da frase em francês (nível {A2}). Me dê 8 frases em português,
uma de cada vez, que testem: posição do advérbio, posição do pronome objeto (incl. empilhamento como "il me le
donne"), negação nos tempos compostos, "de" para posse e substantivo + à/de + substantivo.
Depois da minha tradução: se a ordem das palavras estiver errada, mostre a minha frase como um mapa de posições
(SUJEITO | ne | pronomes | VERBO | pas | advérbio | particípio | resto), explique a posição que errei
e me deixe tentar de novo antes de dar a resposta. Explique em português do Brasil. Ignore pequenos
erros de vocabulário.
```

## 10. 🏗️ O Gerador de Unidades (o próprio experimento)

Use o [`unit-template.pt.md`](unit-template.pt.md). Dê ao modelo o modelo de unidade mais a linha do roteiro
para a unidade e peça para ele preencher todas as seções. Depois **revise criticamente** antes
de estudar, e registre no diário de progresso os erros que encontrar.
