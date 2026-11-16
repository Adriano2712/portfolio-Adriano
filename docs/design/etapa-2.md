# Etapa 2 · Design

Protótipo navegável: https://claude.ai/artifact/HC8CeUizRczz8h81g1Bsqq (canvas com páginas A, B, C e telas base).
Figma: https://www.figma.com/design/5Q10hRN7Pg1DVkOdo7IfE5 (tokens das três opções e as 6 telas do Indexa; componentes e telas param no limite de chamadas MCP do plano Starter).

## Decisão (16/11/2026)

**Aprovada a opção A · Técnico, com o acento verde.** Modo escuro como padrão e modo claro com os tokens `A.claro` de [tokens.json](tokens.json). As opções B e C ficam no protótipo só como registro.

## Critério de aceite

Uma das opções aprovada pelo Adriano, com modo escuro e claro, nas três telas (início, estudo de caso, SGOR) em 390, 768 e 1440 px.

## Opções

| | A · Técnico | B · Editorial | C · Produto |
|---|---|---|---|
| Títulos | JetBrains Mono 700 | Fraunces 600 | IBM Plex Sans 600 |
| Texto | Inter | Inter | IBM Plex Sans |
| Números | JetBrains Mono | IBM Plex Mono | IBM Plex Mono |
| Acento (escuro / claro) | verde `#3DDC97` / `#0F7B53` | âmbar `#F2A93B` / `#9A5B00` | azul `#6EA2FF` / `#1F5FD6` |
| Raios | 4 / 6 / 10 | 2 / 2 / 4 | 6 / 12 / 16 |

Valores completos em [tokens.json](tokens.json). Contraste calculado (WCAG) para texto, texto secundário e acento sobre fundo e superfícies, e texto sobre o acento: todos ≥ 4,5:1, o menor é 4,97:1 (acento da opção A no modo claro).

## Componentes

| Componente | Uso | Regras |
|---|---|---|
| Nav | todas as páginas | links visíveis a partir de 768; no celular, logo + PT/EN + botão de menu de 44 px |
| Alternador PT/EN | nav | dois alvos de 44 × 40 px, `aria-current` no idioma ativo, `lang="en"` no EN |
| Chip de tecnologia | hero, cards, estudo de caso | fonte mono 14 px; não é botão |
| Card de projeto | início | tipo · título · problema em uma frase · métrica de destaque · stack · "Ler o estudo de caso" e "Código" |
| Card SGOR | início | borda tracejada, sem métrica nem stack |
| Faixa de métricas | início | 5 itens (~290, 15, 25+, CI/CD, Docker), cada um com "Ver evidência"; 2 / 3 / 5 colunas |
| Bloco de prova | hero (desktop à direita, celular abaixo) | métrica principal do Indexa + duas secundárias |
| Calculadora | início | formulário + resultado; empilhada até 768, lado a lado em 1440; aviso de demonstração simplificada e data do snapshot |
| Bloco de diagrama | estudo de caso | figura com legenda e botão "Ampliar" (44 px); horizontal no desktop, vertical no celular |
| Galeria | estudo de caso | 1 / 2 / 3 colunas, alt em PT/EN, botão "Ampliar" em cada imagem |
| Índice lateral | estudo de caso | só em 1440; marca a seção atual |

## Telas

- **Início:** hero → projetos → demo → engenharia em números → sobre → contato → rodapé.
- **Estudo de caso (modelo: Indexa):** voltar · cabeçalho com métrica · stack · índice lateral + seções (problema, resultado, arquitetura, decisões técnicas com etiqueta ADR, o que foi revisto, telas).
- **SGOR:** voltar · tipo · título · uma frase · aviso de projeto não público.

## Decisões

- **Protótipo no canvas em vez do Figma:** o plano Starter do Figma bloqueou as chamadas MCP no meio da etapa. A opção escolhida vai para o Figma quando o limite liberar ou após um upgrade, para a revisão com a skill de embelezamento.
- **Uma tela por modelo, com opção, tema e largura como parâmetros:** as nove variações por opção vêm do mesmo código, então diferenças entre opções são só de token.
- **Hero com bloco de prova:** o primeiro número que o recrutador vê é o do teste-oráculo do Indexa, coerente com "evidência em vez de adjetivos".
- **Descartado:** carrossel de projetos (esconde conteúdo e atrapalha teclado) e menu hambúrguer no tablet (os cinco links cabem em 768).

## Pendências

- Levar a opção A para o Figma (componentes e telas) e fazer a revisão com a skill de embelezamento, quando o limite MCP do Figma liberar.
- [PENDENTE] Data do snapshot do SGS na demo (definida na Etapa 4).
- Ajuste de cor feito no protótipo e ainda não levado ao Figma: `surface2` e `border` do modo escuro ficaram um pouco mais claros que no arquivo do Figma, para separar melhor cards e bordas. Vale o `tokens.json`.
