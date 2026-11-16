import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';
import { acumular, calcular, janelaDoIndice, monetario, type Clausulas } from '../../src/lib/reajuste';
import sgs from '../../src/data/sgs/series.json';
import fixture from '../fixtures/indexa-casos.json';

const series = { ipca: sgs.series.ipca as Record<string, string>, igpm: sgs.series.igpm as Record<string, string> };

describe('equivalência com o Indexa (bate ao centavo)', () => {
  it('tem pelo menos 10 casos', () => expect(fixture.casos.length).toBeGreaterThanOrEqual(10));

  for (const caso of fixture.casos) {
    it(`${caso.id} (${caso.fonte})`, () => {
      const c: Clausulas = {
        tipo: caso.tipo as Clausulas['tipo'],
        percentualFixo: (caso as { percentualFixo?: string }).percentualFixo,
        teto: (caso as { teto?: string }).teto,
        piso: (caso as { piso?: string }).piso,
        naoReduzir: (caso as { naoReduzir?: boolean }).naoReduzir,
      };
      const variacoes = caso.tipo === 'fixo' ? {} : series[caso.tipo as 'ipca' | 'igpm'];
      const r = calcular(caso.valor, caso.mes, c, variacoes);
      expect(r.status).toBe('calculado');
      if (r.status !== 'calculado') return;
      expect(r.valorNovo.toFixed(2)).toBe(caso.esperado);
      expect(r.regra).toBe(caso.regra);
      if (caso.percentual) {
        const casas = caso.percentual.split('.')[1].length;
        expect(r.percentualAplicado.toDecimalPlaces(casas, Decimal.ROUND_HALF_UP).toFixed(casas)).toBe(caso.percentual);
      }
      const janela = (caso as { janela?: string[] }).janela;
      if (janela) expect([r.janela?.inicio, r.janela?.fim]).toEqual(janela);
    });
  }
});

describe('regras do motor', () => {
  it('janela com defasagem 1: aniversário em novembro usa out a set', () => {
    expect(janelaDoIndice('2026-11')).toMatchObject({ inicio: '2025-10', fim: '2026-09' });
    expect(janelaDoIndice('2026-11').meses).toHaveLength(12);
  });

  it('janela atravessa a virada do ano', () => {
    expect(janelaDoIndice('2026-01')).toMatchObject({ inicio: '2024-12', fim: '2025-11' });
  });

  it('arredonda só no fim: arredondar o percentual antes daria R$ 2.606,50', () => {
    const v = ['0.16', '1.31', '0.56', '0.43', '0.26', '0.24', '0.26', '-0.11', '0.48', '0.09', '0.18', '0.33'];
    const taxa = acumular(v);
    const certo = monetario(new Decimal('2500').times(taxa.plus(1)));
    const arredondadoAntes = monetario(new Decimal('2500').times(taxa.times(100).toDecimalPlaces(2).div(100).plus(1)));
    expect(certo.toFixed(2)).toBe('2606.61');
    expect(arredondadoAntes.toFixed(2)).toBe('2606.50');
  });

  it('meio exato arredonda para longe do zero', () => {
    expect(monetario(new Decimal('0.125')).toFixed(2)).toBe('0.13');
    expect(monetario(new Decimal('-0.125')).toFixed(2)).toBe('-0.13');
  });

  it('mês ainda não publicado: aguarda índice, nunca calcula parcial', () => {
    const r = calcular('1000.00', '2099-12', { tipo: 'ipca' }, series.ipca);
    expect(r.status).toBe('aguardandoIndice');
  });

  it('valor zero ou negativo é recusado', () => {
    expect(() => calcular('0', '2026-02', { tipo: 'ipca' }, series.ipca)).toThrow();
  });

  it('o snapshot do SGS confere com a tabela do README do Indexa (IPCA 2025)', () => {
    const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => series.ipca[`2025-${m}`]);
    expect(meses).toEqual(['0.16', '1.31', '0.56', '0.43', '0.26', '0.24', '0.26', '-0.11', '0.48', '0.09', '0.18', '0.33']);
  });
});
