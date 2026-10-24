/**
 * MetricModelCard.tsx
 *
 * Sales-traffic card for a single model in the Pareto metrics dashboard.
 * Shows velocity, revenue, stock status, and per-size availability warnings.
 */

import type { StockStatus, TopModelMetric } from '../data/mockMetrics';

interface MetricModelCardProps {
  model: TopModelMetric;
  maxSold: number;
}

const STATUS_STYLES: Record<StockStatus, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  low: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-600',
};

export default function MetricModelCard({ model, maxSold }: MetricModelCardProps) {
  const progress = Math.round((model.soldPairs / maxSold) * 100);

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-amber-900">
            {model.brand} · {model.color}
          </p>
          <h3 className="truncate text-sm font-bold text-stone-900">{model.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-leather/10 px-2 py-0.5 text-[10px] font-bold text-leather">
          Clase {model.abcClass}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="text-sm font-bold text-stone-900">{model.soldPairs}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">Vendidos</p>
        </div>
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="text-sm font-bold text-stone-900">{model.pairsPerDay.toFixed(1)}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">pares/día</p>
        </div>
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="text-sm font-bold text-stone-900">S/. {model.revenue.toLocaleString('es-PE')}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">Ingresos</p>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-leather" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xs font-semibold text-stone-600">Stock: {model.stock} pares</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[model.stockStatus]}`}>
          {model.stockLabel}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {model.sizes.map((entry) => {
          const isOut = entry.stock === 0;
          const isLow = entry.stock === 1;
          const chipStyle = isOut
            ? 'border-red-200 bg-red-50 text-red-600'
            : isLow
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-stone-200 bg-stone-50 text-stone-600';

          return (
            <span key={entry.size} className={`rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${chipStyle}`}>
              T.{entry.size}: {entry.stock}
              {isOut && ' ❌'}
              {isLow && ' ⚠️'}
            </span>
          );
        })}
      </div>
    </article>
  );
}
