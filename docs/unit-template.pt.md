# Modelo de unidade

Este é o **contrato** entre você e o LLM que gera as unidades do curso.
Toda unidade, de qualquer idioma, segue este formato. Cada seção existe por um motivo
(veja [`learning-science.pt.md`](learning-science.pt.md)); o motivo está entre parênteses.

As páginas do curso existem em inglês (`nome.md`) e em português (`nome.pt.md`). Gere as duas, ou gere uma e
peça ao LLM para traduzir a outra mantendo a mesma estrutura.

---

## Prompt gerador

```text
Você é um designer de currículo de idiomas que segue a pesquisa em aquisição de segunda língua
(instrução explícita + prática, prática de recuperação, repetição espaçada, input compreensível,
percepção, produção com feedback corretivo).

Escreva a Unidade {N} de um curso de {francês} para um aluno adulto no nível {A1} do QECR, que fala
{português do Brasil}. Escreva a página em {português do Brasil}. A entrada do roteiro é:
"{cole a linha do roteiro de french/README.pt.md}"
Unidades anteriores cobriram: {lista}.

Siga o modelo abaixo EXATAMENTE. Restrições:
- Seções de regra: precisas e curtas. Use tabelas para as conjugações.
- Vocabulário: só itens de alta frequência (mais ou menos as 2000 palavras mais comuns), no máximo 25 itens.
- Nunca cite letras de música além do título. Nas tarefas de mídia, descreva O QUE prestar atenção
  ao ouvir, não a letra em si. Só recomende músicas/filmes que você tem certeza de que existem;
  marque com (verificar) qualquer coisa de que não tenha certeza.
- Marque o que é coloquial ou formal, e as diferenças entre França, Bélgica, Suíça e Québec.
- Pronúncia: explique cada som com uma palavra de referência na língua do aluno, não em
  inglês (para um brasileiro: "ce = o tch de *tchau*", "gn = o nh de *banho*"). Escreva as
  transcrições na ortografia do aluno, com a sílaba tônica em MAIÚSCULAS. Para um brasileiro, marque também
  os hábitos de sotaque que mudam o som: ti/di → tchi/dji, e/o finais → i/u, vogais
  nasalizadas, o r com som de h, l → u.
- Inclua um quadro 💡 Curiosidade (etimologia, cultura ou um fato surpreendente).

MODELO:
{cole tudo o que está abaixo da linha}
```

---

# Unidade {N}: {Título} · QECR {nível} · ~{X} dias

## 🎯 Objetivos  *(alvo claro → você sabe quando terminou)*
- Consigo ...
- Consigo ...

## 📐 A regra  *(instrução explícita)*
Explicação curta. Tabelas. 3–5 exemplos. A exceção nº 1.
Link para o arquivo de referência gramatical.

## ⚠️ Armadilhas comuns  *(evita que os erros se fossilizem)*
- Os alunos dizem X → o certo é Y, porque ...

## 🧱 Vocabulário  *(alta frequência; vai para o baralho do SRS)*

| Francês | Português | Nota |
|---|---|---|

## 🏋️ Exercícios  *(prática de recuperação)*
- App: qual exercício / qual baralho
- 5 perguntas rápidas de autoteste, com as respostas escondidas num bloco recolhível escrito **exatamente** assim
  (tags em linhas próprias, `markdown="span"` no summary, linha em branco depois dele), senão ele não
  recolhe no site do curso:

  ```html
  <details>
  <summary markdown="span">Autoteste (respostas)</summary>

  1. pergunta → **resposta**
  </details>
  ```

## 🎧 Input + Caça  *(input compreensível + percepção)*
- Música / vídeo / episódio
- **Caça:** o que perceber (ex.: "conte cada *ne ... pas*")
- Alvo de shadowing (um refrão ou um verso)

## 🗣️ Use  *(produção + feedback)*
- Proposta de escrita (3–5 frases) → cole no prompt do Corretor
- Cenário de fala → prompt do Parceiro de Conversa

## 💡 Curiosidade  *(motivação; torna memorável)*

## ✅ Checklist  *(avance quando tudo estiver marcado)*
- [ ] Consigo explicar a regra em voz alta com as minhas palavras
- [ ] Acerto ≥ 80% nos exercícios
- [ ] Fiz a Caça
- [ ] Escrevi / falei e recebi correção
- [ ] Cartões da unidade adicionados ao SRS
