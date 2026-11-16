/**
 * Motor de reajuste da demo: tradução direta de Indexa/src/Indexa.Calculo/MotorReajuste.cs e Calendario.cs.
 * Ordem (ADR-02/03/04 do Indexa): acumulado → teto/piso → não redução → um único arredondamento.
 * Dinheiro e taxas usam decimal.js; nunca `number`.
 * Fora da demo: teto/piso em R$ (UnidadeLimite.Valor), periodicidade ≠ 12 e defasagem ≠ 1.
 */
import Decimal from 'decimal.js';

// decimal do C# tem 28-29 dígitos significativos; 40 aqui não perde nada que chegue aos centavos.
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Dec = InstanceType<typeof D>;

export type TipoIndice = 'ipca' | 'igpm' | 'fixo';
export type Regra = 'indice' | 'percentualFixo' | 'teto' | 'piso' | 'naoReducao';

/** Mês no formato "AAAA-MM". */
export type Mes = string;

export interface Clausulas {
  tipo: TipoIndice;
  /** Percentual fixo em pontos percentuais, ex.: "5" para 5%. */
  percentualFixo?: string;
  /** Teto e piso em pontos percentuais, sobre o acumulado. */
  teto?: string;
  piso?: string;
  naoReduzir?: boolean;
  periodicidadeMeses?: number;
  defasagemMeses?: number;
}

export interface Janela { inicio: Mes; fim: Mes; meses: Mes[] }

export type Resultado =
  | {
      status: 'calculado';
      valorAntigo: Dec;
      valorNovo: Dec;
      /** Acumulado bruto em pontos percentuais, sem arredondar. */
      percentualAcumulado: Dec;
      percentualAplicado: Dec;
      regra: Regra;
      janela?: Janela;
    }
  | { status: 'aguardandoIndice'; janela: Janela; mesesFaltantes: Mes[] };

/** Arredondamento.Monetario: 2 casas, meio exato para longe do zero. */
export function monetario(v: Dec): Dec {
  return v.toDecimalPlaces(2, D.ROUND_HALF_UP);
}

function addMonths(mes: Mes, n: number): Mes {
  const [y, m] = mes.split('-').map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** Calendario.JanelaDoIndice: a janela termina defasagem + 1 meses antes do mês do aniversário. */
export function janelaDoIndice(mesAniversario: Mes, periodicidadeMeses = 12, defasagemMeses = 1): Janela {
  const fim = addMonths(mesAniversario, -(defasagemMeses + 1));
  const inicio = addMonths(fim, -(periodicidadeMeses - 1));
  const meses = Array.from({ length: periodicidadeMeses }, (_, i) => addMonths(inicio, i));
  return { inicio, fim, meses };
}

/** MotorReajuste.Acumular: Π(1 + v/100) − 1, como fração, sem arredondar. */
export function acumular(variacoes: string[]): Dec {
  let fator = new D(1);
  for (const v of variacoes) fator = fator.times(new D(1).plus(new D(v).div(100)));
  return fator.minus(1);
}

function limitar(valor: Dec, piso: Dec | undefined, teto: Dec | undefined, regra: Regra): [Dec, Regra] {
  if (teto && valor.gt(teto)) return [teto, 'teto'];
  if (piso && valor.lt(piso)) return [piso, 'piso'];
  return [valor, regra];
}

/**
 * MotorReajuste.Calcular.
 * @param valorAtual texto decimal com ponto, ex.: "2500.00"
 * @param mesAniversario "AAAA-MM"
 * @param variacoes série mensal: mês → variação em % (texto)
 */
export function calcular(valorAtual: string, mesAniversario: Mes, c: Clausulas, variacoes: Record<Mes, string>): Resultado {
  const valor = new D(valorAtual);
  if (valor.lte(0)) throw new RangeError('Valor atual deve ser positivo.');

  if (c.tipo === 'fixo') {
    if (c.percentualFixo === undefined) throw new Error('Contrato de percentual fixo sem percentual.');
    return aplicarClausulas(valor, new D(c.percentualFixo).div(100), 'percentualFixo', c);
  }

  const janela = janelaDoIndice(mesAniversario, c.periodicidadeMeses, c.defasagemMeses);
  const faltantes = janela.meses.filter((m) => variacoes[m] === undefined);
  if (faltantes.length > 0) return { status: 'aguardandoIndice', janela, mesesFaltantes: faltantes };

  const taxa = acumular(janela.meses.map((m) => variacoes[m]));
  return aplicarClausulas(valor, taxa, 'indice', c, janela);
}

function aplicarClausulas(valorAtual: Dec, taxa: Dec, regraInicial: Regra, c: Clausulas, janela?: Janela): Resultado {
  const teto = c.teto !== undefined && c.teto !== '' ? new D(c.teto).div(100) : undefined;
  const piso = c.piso !== undefined && c.piso !== '' ? new D(c.piso).div(100) : undefined;
  const [taxaAplicada, regraLimite] = limitar(taxa, piso, teto, regraInicial);
  let valorNovo = monetario(valorAtual.times(new D(1).plus(taxaAplicada)));
  let percentualAplicado = taxaAplicada.times(100);
  let regra = regraLimite;

  if (c.naoReduzir && valorNovo.lt(valorAtual)) {
    valorNovo = valorAtual;
    percentualAplicado = new D(0);
    regra = 'naoReducao';
  }
  return { status: 'calculado', valorAntigo: valorAtual, valorNovo, percentualAcumulado: taxa.times(100), percentualAplicado, regra, janela };
}
