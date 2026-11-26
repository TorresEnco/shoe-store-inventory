/**
 * MetricModelCard.tsx
 *
 * Sales-traffic card for a single model in the Pareto metrics dashboard.
 * Shows velocity, revenue, stock status, and per-size availability warnings.
 */

import type { ParetoModelMetric } from '../services/api';

interface MetricModelCardProps {
  model: ParetoModelMetric;
  maxSold: number;
}

const STATUS_STYLES: Record<string, string> = {
  'Rotación saludable': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Reponer pronto': 'border-amber-200 bg-amber-50 text-amber-800',
  'Stock crítico': 'border-red-200 bg-red-50 text-red-600',
};

export default function MetricModelCard({ model, maxSold }: MetricModelCardProps) {
  const progress = Math.round((model.totalSold / maxSold) * 100);

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold text-amber-900">
            {model.brandName ?? 'Sin marca'} · {model.colorName ?? 'Sin color'}
          </p>
          <h3 className="break-words text-sm font-bold text-stone-900">{model.productName}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-leather/10 px-2 py-0.5 text-[10px] font-bold text-leather">
          Clase {model.classification.slice(-1)}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="text-sm font-bold text-stone-900">{model.totalSold}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">Vendidos</p>
        </div>
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="text-sm font-bold text-stone-900">{model.velocityPerDay.toFixed(1)}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">pares/día</p>
        </div>
        <div className="rounded-xl bg-stone-50 py-1.5">
          <p className="break-all text-sm font-bold text-stone-900">S/. {model.revenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-stone-400">Ingresos</p>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-leather" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xs font-semibold text-stone-600">Stock: {model.currentStock} pares</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[model.stockStatus]}`}>
          {model.stockStatus}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {Object.entries(model.sizeBreakdown).sort(([a], [b]) => Number(a) - Number(b)).map(([size, stock]) => {
          const entry = { size, stock };
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
