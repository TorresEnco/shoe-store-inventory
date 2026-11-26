import { useEffect, useState } from 'react';
import MetricModelCard from '../components/MetricModelCard';
import { getParetoReport, type ParetoReport } from '../services/api';

const CLASSES = ['CLASS_A', 'CLASS_B', 'CLASS_C'] as const;

export default function MetricsView() {
  const [activeClass, setActiveClass] = useState<typeof CLASSES[number]>('CLASS_A');
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [report, setReport] = useState<ParetoReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getParetoReport(days).then(result => {
      if (active) setReport(result);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el informe.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days, refresh]);

  function reload() {
    setReport(null);
    setError('');
    setLoading(true);
    setRefresh(value => value + 1);
  }

  const visibleModels = report?.models.filter(model => model.classification === activeClass) ?? [];
  const maxSold = Math.max(...(report?.models.map(model => model.totalSold) ?? []), 1);

  return (
    <section className="flex flex-col gap-4 px-4 py-4 pb-10" aria-labelledby="metrics-title" aria-busy={loading}>
      <div>
        <h2 id="metrics-title" className="text-xl font-bold tracking-tight text-stone-900">Rotación de Inventario</h2>
        <p className="mt-1 text-sm text-stone-600">Análisis ABC por modelo y color · Ingresos 80/15/5</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="metrics-period" className="text-sm font-semibold text-stone-700">Período de ventas</label>
        <select id="metrics-period" value={days} onChange={event => {
          setReport(null); setError(''); setLoading(true); setDays(Number(event.target.value));
        }} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-800">
          {[7, 30, 90].map(period => <option key={period} value={period}>Últimos {period} días</option>)}
        </select>
      </div>
      {loading && <p role="status" className="text-sm text-stone-600">Cargando informe…</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <p>{error}</p>
        <button type="button" onClick={reload} className="mt-2 min-h-11 rounded-lg bg-leather px-4 font-semibold text-white">
          Reintentar informe
        </button>
      </div>}
      {report && <>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-3">
            <dt className="text-sm font-semibold text-stone-600">Pares vendidos</dt>
            <dd className="mt-1 break-all text-xl font-bold tabular-nums text-stone-900">{report.totalSold}</dd>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <dt className="text-sm font-semibold text-amber-900">Pares en riesgo</dt>
            <dd className="mt-1 break-all text-xl font-bold tabular-nums text-amber-950">{report.atRiskPairs}</dd>
          </div>
          <div className="col-span-2 rounded-2xl border border-stone-200 bg-white p-3">
            <dt className="text-sm font-semibold text-stone-600">Ingresos de ventas completadas</dt>
            <dd className="mt-1 break-all text-2xl font-bold tabular-nums text-leather">
              S/. {report.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-stone-700">
          La clase A genera el <strong>{report.classAPercentage.toLocaleString('es-PE')} %</strong> de los ingresos del período.
          El grupo que cruza el 80 % completa A; el que cruza el 95 % completa B.
        </p>
        {report.models.length === 0 && <p role="status" className="rounded-xl bg-stone-100 p-3 text-sm text-stone-700">
          No hay ventas completadas en este período.
        </p>}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por clase ABC">
          {CLASSES.map(value => <button key={value} type="button" aria-pressed={activeClass === value}
            onClick={() => setActiveClass(value)}
            className="min-h-11 flex-1 rounded-xl border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 aria-pressed:border-leather aria-pressed:bg-leather aria-pressed:text-white">
            Clase {value.slice(-1)} ({report.models.filter(model => model.classification === value).length})
          </button>)}
        </div>
        <div className="flex flex-col gap-3" aria-live="polite">
          {visibleModels.length ? visibleModels.map(model => <MetricModelCard
            key={model.productId + ':' + model.colorId} model={model} maxSold={maxSold} />)
            : <p className="py-3 text-sm text-stone-600">Sin grupos con ventas en esta clase.</p>}
        </div>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-950" aria-labelledby="liquidation-title">
          <h3 id="liquidation-title" className="font-bold">Oportunidades de liquidación</h3>
          <p className="mt-1 text-sm">Stock de variantes con más de 45 días de antigüedad y sin ventas completadas en los últimos 45 días. Este criterio no cambia con el período del ABC.</p>
          {report.liquidationSuggestions.length ? <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm">
            {report.liquidationSuggestions.map((suggestion, index) => <li key={index} className="break-words">{suggestion}</li>)}
          </ul> : <p className="mt-3 text-sm">No hay variantes que cumplan este criterio.</p>}
        </section>
      </>}
    </section>
  );
}
