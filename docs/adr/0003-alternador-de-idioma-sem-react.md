# ADR-0003 · Alternador de idioma como links, sem ilha React

- **Decisão:** o alternador PT/EN é um par de links para a página equivalente no outro idioma. Um script de poucas linhas grava o cookie `lang` no clique, e a raiz usa esse cookie (ADR-0001). O menu do celular usa `<details>`, também sem JavaScript.
- **Alternativas:** ilha React com estado (a especificação original previa React no alternador).
- **Motivo:** funciona sem JavaScript, é rastreável por robôs e não carrega React em toda página. React fica só na calculadora (Etapa 4). O zoom de diagramas e imagens também saiu sem React: `<dialog>` nativo com um script curto (`ZoomDialog.astro`); sem JavaScript, o link abre a imagem original.
- **Custo de reverter:** baixo (um componente).
- **Gatilho:** precisar de um seletor com mais de dois idiomas ou com estado compartilhado entre ilhas.
