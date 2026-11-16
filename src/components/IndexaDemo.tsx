import { useId, useMemo, useState } from 'react';
import Decimal from 'decimal.js';
import { calcular, type Regra, type TipoIndice } from '../lib/reajuste';
import sgs from '../data/sgs/series.json';

export interface DemoLabels {
  locale: 'pt' | 'en';
  currentValue: string;
  index: string;
  ipca: string;
  igpm: string;
  fixed: string;
  fixedPercent: string;
  month: string;
  year: string;
  clauses: string;
  cap: string;
  floor: string;
  optional: string;
  noReduction: string;
  newValue: string;
  applied: string;
  accumulated: string;
  rule: string;
  window: string;
  rounding: string;
  roundingText: string;
  snapshot: string;
  waiting: string;
  invalidValue: string;
  invalidPercent: string;
  rules: Record<Regra, string>;
  months: string[];
}

const series = sgs.series as Record<'ipca' | 'igpm', Record<string, string>>;
const lastMonth = Object.keys(series.ipca).sort().at(-1)!; // ex.: 2026-10
const lastYear = Number(lastMonth.slice(0, 4)) + 1;
const YEARS = Array.from({ length: lastYear - 2017 + 1 }, (_, i) => 2017 + i).reverse();

/** "2.500,00", "2500", "2,500.00" → "2500.00"; undefined se inválido. */
export function parseMoney(input: string, locale: 'pt' | 'en'): string | undefined {
  const s = input.replace(/[R$\s]/g, '');
  if (!s) return undefined;
  const normalized = locale === 'pt' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return undefined;
  const d = new Decimal(normalized);
  return d.gt(0) && d.lt(1e12) ? d.toFixed(2) : undefined;
}

function parsePercent(input: string, locale: 'pt' | 'en'): string | undefined {
  const s = input.trim().replace('%', '');
  if (!s) return undefined;
  const normalized = locale === 'pt' ? s.replace(',', '.') : s;
  return /^-?\d+(\.\d+)?$/.test(normalized) && Math.abs(Number(normalized)) <= 1000 ? normalized : undefined;
}

function fmtNumber(value: string, locale: 'pt' | 'en'): string {
  const [int, dec] = value.replace('-', '').split('.');
  const sep = locale === 'pt' ? ['.', ','] : [',', '.'];
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep[0]);
  return `${value.startsWith('-') ? '−' : ''}${grouped}${dec !== undefined ? sep[1] + dec : ''}`;
}

const money = (d: Decimal, l: 'pt' | 'en') => `R$ ${fmtNumber(d.toFixed(2), l)}`;
const pct = (d: Decimal, l: 'pt' | 'en') => `${fmtNumber(d.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4), l)}%`;

export default function IndexaDemo({ labels: L }: { labels: DemoLabels }) {
  const id = useId();
  const [valor, setValor] = useState(L.locale === 'pt' ? '2.500,00' : '2,500.00');
  const [tipo, setTipo] = useState<TipoIndice>('ipca');
  const [fixo, setFixo] = useState('5');
  const [mes, setMes] = useState('02');
  const [ano, setAno] = useState('2026');
  const [teto, setTeto] = useState('');
  const [piso, setPiso] = useState('');
  const [naoReduzir, setNaoReduzir] = useState(false);

  const result = useMemo(() => {
    const v = parseMoney(valor, L.locale);
    if (!v) return { error: L.invalidValue } as const;
    const pf = tipo === 'fixo' ? parsePercent(fixo, L.locale) : undefined;
    const t = teto ? parsePercent(teto, L.locale) : undefined;
    const p = piso ? parsePercent(piso, L.locale) : undefined;
    if ((tipo === 'fixo' && !pf) || (teto && !t) || (piso && !p)) return { error: L.invalidPercent } as const;
    const r = calcular(v, `${ano}-${mes}`, { tipo, percentualFixo: pf, teto: t, piso: p, naoReduzir }, tipo === 'fixo' ? {} : series[tipo]);
    return { r } as const;
  }, [valor, tipo, fixo, mes, ano, teto, piso, naoReduzir, L]);

  const monthLabel = (m: string) => `${L.months[Number(m.slice(5, 7)) - 1]}/${m.slice(0, 4)}`;
  const snapshotDate = new Date(`${sgs.snapshotDate}T12:00:00`).toLocaleDateString(L.locale === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const field = 'min-h-12 w-full rounded-md border border-border bg-surface px-3.5 font-mono text-base text-text';
  const label = 'font-semibold';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="flex flex-col gap-5 rounded-lg border border-border bg-bg p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-valor`} className={label}>{L.currentValue}</label>
          <input id={`${id}-valor`} className={field} inputMode="decimal" autoComplete="off" value={valor}
            onChange={(e) => setValor(e.target.value)} aria-invalid={'error' in result && result.error === L.invalidValue} />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${label} mb-2`}>{L.index}</legend>
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border">
            {(['ipca', 'igpm', 'fixo'] as const).map((k, i) => (
              <button key={k} type="button" aria-pressed={tipo === k} onClick={() => setTipo(k)}
                className={`min-h-12 px-2 text-base ${i > 0 ? 'border-l border-border' : ''} ${tipo === k ? 'bg-accent font-semibold text-on-accent' : 'bg-surface text-text'}`}>
                {k === 'ipca' ? L.ipca : k === 'igpm' ? L.igpm : L.fixed}
              </button>
            ))}
          </div>
          {tipo === 'fixo' && (
            <div className="mt-2 flex flex-col gap-2">
              <label htmlFor={`${id}-fixo`} className={label}>{L.fixedPercent}</label>
              <input id={`${id}-fixo`} className={field} inputMode="decimal" value={fixo} onChange={(e) => setFixo(e.target.value)} />
            </div>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-mes`} className={label}>{L.month}</label>
            <select id={`${id}-mes`} className={field} value={mes} onChange={(e) => setMes(e.target.value)}>
              {L.months.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-ano`} className={label}>{L.year}</label>
            <select id={`${id}-ano`} className={field} value={ano} onChange={(e) => setAno(e.target.value)}>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
        </div>

        <details className="rounded-md border border-border">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 font-semibold">{L.clauses} <span className="ml-2 font-normal text-muted">({L.optional})</span></summary>
          <div className="flex flex-col gap-4 border-t border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-teto`} className={label}>{L.cap}</label>
                <input id={`${id}-teto`} className={field} inputMode="decimal" placeholder="%" value={teto} onChange={(e) => setTeto(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-piso`} className={label}>{L.floor}</label>
                <input id={`${id}-piso`} className={field} inputMode="decimal" placeholder="%" value={piso} onChange={(e) => setPiso(e.target.value)} />
              </div>
            </div>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={naoReduzir} onChange={(e) => setNaoReduzir(e.target.checked)} />
              {L.noReduction}
            </label>
          </div>
        </details>
      </form>

      <div role="status" aria-live="polite" className="flex flex-col gap-5 rounded-lg border border-accent bg-bg p-6">
        {'error' in result ? (
          <p className="text-lg">{result.error}</p>
        ) : result.r.status === 'aguardandoIndice' ? (
          <p className="text-lg">{L.waiting} {result.r.mesesFaltantes.map(monthLabel).join(', ')}.</p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted">{L.newValue}</p>
              <p className="font-mono text-4xl font-medium leading-tight text-accent lg:text-5xl" data-testid="novo-valor">{money(result.r.valorNovo, L.locale)}</p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5">
              <dt className="text-muted">{L.applied}</dt><dd className="font-mono" data-testid="percentual">{pct(result.r.percentualAplicado, L.locale)}</dd>
              {!result.r.percentualAcumulado.eq(result.r.percentualAplicado) && (
                <><dt className="text-muted">{L.accumulated}</dt><dd className="font-mono">{pct(result.r.percentualAcumulado, L.locale)}</dd></>
              )}
              <dt className="text-muted">{L.rule}</dt><dd data-testid="regra">{L.rules[result.r.regra]}</dd>
              {result.r.janela && (<><dt className="text-muted">{L.window}</dt><dd>{monthLabel(result.r.janela.inicio)} – {monthLabel(result.r.janela.fim)}</dd></>)}
              <dt className="text-muted">{L.rounding}</dt><dd>{L.roundingText}</dd>
            </dl>
          </>
        )}
        <p className="mt-auto text-sm text-muted">{L.snapshot} {snapshotDate}.</p>
      </div>
    </div>
  );
}
