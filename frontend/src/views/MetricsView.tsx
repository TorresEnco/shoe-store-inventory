/**
 * MetricsView.tsx
 *
 * "Rotación de Inventario" — Pareto (ABC) dashboard for Comercial Torres.
 * Summarises KPIs, top-traffic models, per-size stock health, and liquidation leads.
 */

import { useState } from 'react';
import {
  MOCK_CLASS_COUNTS,
  MOCK_METRICS_SUMMARY,
  MOCK_TOP_MODELS,
  type MetricClass,
} from '../data/mockMetrics';
import MetricModelCard from '../components/MetricModelCard';

const CLASSES: MetricClass[] = ['A', 'B', 'C'];

export default function MetricsView() {
  const [activeClass, setActiveClass] = useState<MetricClass>('A');
  const { totalSold, totalRevenue, atRiskPairs } = MOCK_METRICS_SUMMARY;
  const revenueK = (Math.floor(totalRevenue / 100) / 10).toFixed(1);
  const visibleModels = MOCK_TOP_MODELS.filter((model) => model.abcClass === activeClass);
  const maxSold = Math.max(...MOCK_TOP_MODELS.map((model) => model.soldPairs), 1);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-10">
      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Rotación de Inventario</h2>
          <p className="text-xs text-stone-500">Análisis ABC · Regla de Pareto (80/20)</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-bold text-stone-600 shadow-xs hover:bg-stone-50"
        >
          📅 Últimos 30 días ▾
        </button>
      </div>

      {/* ── KPI summary ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Vendidos</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{totalSold}</p>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">+18%</span>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Ingresos</p>
          <p className="mt-1 text-lg font-bold text-stone-900">S/. {revenueK}k</p>
          <span className="text-[9px] font-semibold text-stone-400">Mg. prom 42%</span>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-2.5 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">En Riesgo</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{atRiskPairs} prs</p>
          <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">Estancados</span>
        </div>
      </div>

      {/* ── Pareto insight ── */}
      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-3">
        <span className="text-lg leading-none" role="img" aria-label="Idea">💡</span>
        <p className="text-xs font-medium leading-snug text-amber-900">
          El 20% de tus modelos (Clase A) genera el <strong>78%</strong> de la facturación mensual.
        </p>
      </div>

      {/* ── Class tabs ── */}
      <div className="flex gap-1 rounded-2xl bg-stone-100 p-1" role="tablist" aria-label="Filtro por clase ABC">
        {CLASSES.map((abcClass) => (
          <button
            key={abcClass}
            type="button"
            role="tab"
            aria-selected={activeClass === abcClass}
            onClick={() => setActiveClass(abcClass)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeClass === abcClass
                ? 'bg-leather text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Clase {abcClass} ({MOCK_CLASS_COUNTS[abcClass]})
          </button>
        ))}
      </div>

      {/* ── Top models ── */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Modelos Top de Tracción</h3>
        {visibleModels.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visibleModels.map((model) => (
              <MetricModelCard key={model.id} model={model} maxSold={maxSold} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 py-8 text-center">
            <p className="text-xs font-semibold text-stone-400">Sin modelos registrados en esta clase.</p>
          </div>
        )}
      </div>

      {/* ── Liquidation opportunity ── */}
      <div className="rounded-2xl border border-orange-200/80 bg-orange-50/70 p-3.5">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none" role="img" aria-label="Descuento">🏷️</span>
          <p className="text-xs font-medium leading-snug text-amber-900">
            3 modelos de Clase C llevan más de 45 días sin ventas (18 pares estancados). Se sugiere
            descuento del 15% en exhibidor frontal.
          </p>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-leather py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-leather-dark active:scale-[0.98]"
        >
          % Crear promo rápida
        </button>
      </div>
    </div>
  );
}
