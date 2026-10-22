/**
 * ReceptionSummary.tsx
 *
 * Sanity check summary card and sticky bottom action button for inventory restock.
 */

interface ReceptionSummaryProps {
  changedCount: number;
  totalDiff: number;
  onSave: () => void;
  onDiscard: () => void;
}

export default function ReceptionSummary({
  changedCount,
  totalDiff,
  onSave,
  onDiscard,
}: ReceptionSummaryProps) {
  const isZeroDiff = totalDiff === 0;
  const isDirty = changedCount > 0;

  const diffLabel = totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`;
  const actionText = totalDiff >= 0 ? 'ingresados a bodega' : 'retirados de bodega';

  return (
    <>
      {/* ── Reception Summary Card (Sanity Check) ── */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-stone-200/80 bg-stone-100/70 p-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-stone-700 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>

        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-stone-900 sm:text-sm">
            Resumen de Recepción
          </h4>
          <p className="text-xs text-stone-600">
            {isDirty ? (
              <>
                Se actualizarán <span className="font-semibold text-stone-900">{changedCount}</span> {changedCount === 1 ? 'talla' : 'tallas'} ·{' '}
                <span className="font-semibold text-leather">{diffLabel}</span> pares {actionText}.
              </>
            ) : (
              'Sin variaciones registradas en esta recepción.'
            )}
          </p>
        </div>
      </div>

      {/* ── Sticky Bottom Action ── */}
      <div className="fixed bottom-16 left-0 right-0 z-30 mx-auto max-w-md border-t border-stone-200/80 bg-cream/95 px-4 pt-3 pb-3 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={onSave}
          disabled={isZeroDiff}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-sm font-bold shadow-md transition-all sm:text-base',
            isZeroDiff
              ? 'cursor-not-allowed bg-stone-300 text-stone-500'
              : 'bg-leather-dark text-white hover:bg-leather active:scale-[0.99]',
          ].join(' ')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          Guardar Cambios de Inventario ({diffLabel} pares)
        </button>

        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!isDirty}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Descartar cambios
          </button>
        </div>
      </div>
    </>
  );
}
