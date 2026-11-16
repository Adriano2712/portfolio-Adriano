# ADR-0004 · Demo do Indexa: motor traduzido para TypeScript e conferido contra o próprio Indexa

- **Decisão:** `src/lib/reajuste.ts` traduz `MotorReajuste.cs` e `Calendario.cs` linha a linha, com `decimal.js` (precisão 40, arredondamento final `ROUND_HALF_UP` = meio para longe do zero, como `MidpointRounding.AwayFromZero`). Série embutida em `src/data/sgs/series.json` (snapshot do SGS, data exibida na demo; `npm run sgs:snapshot` atualiza). Ilha React com `client:visible`.
- **Equivalência:** `tests/unit/reajuste.test.ts` confere 16 casos ao centavo, além de regra, percentual e janela: 11 reajustes calculados pelo Indexa em execução (transcritos das telas em `indexa/docs/telas`) e 5 do exemplo conferível do README. Os casos estão em `tests/fixtures/indexa-casos.json`, cada um com a fonte.
- **Alternativas:** rodar o motor .NET para gerar os casos (esta máquina só tem o SDK do .NET 8, e o Indexa exige o .NET 10); chamar a API do Indexa (ainda não publicada); WebAssembly do motor C# (pesado demais para uma demo).
- **Custo de reverter:** baixo; a demo é uma seção e uma ilha.
- **Gatilho:** mudança de regra no motor do Indexa. Mitigação: gerar os casos direto do motor (.NET 10) e trocar a fixture quando o SDK estiver disponível.
