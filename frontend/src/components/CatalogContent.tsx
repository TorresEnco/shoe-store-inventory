import type { ReactNode } from 'react';

interface CatalogContentProps {
  hasProducts: boolean;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  children: ReactNode;
}

export default function CatalogContent({ hasProducts, isLoading, loadError, onRetry, children }: CatalogContentProps) {
  return (
    <>
        {loadError && hasProducts && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-amber-200 px-3 py-1 text-[10px] font-bold text-amber-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {isLoading && !hasProducts ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-leather"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-stone-500">Cargando catálogo...</p>
          </div>
        ) : !isLoading && loadError && !hasProducts ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="text-4xl">📡</span>
            <p className="text-sm font-bold text-stone-700">No se pudo cargar el catálogo</p>
            <p className="max-w-xs text-xs text-stone-500">{loadError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-leather px-5 py-2 text-xs font-bold text-white hover:bg-leather-dark"
            >
              Reintentar
            </button>
          </div>
        ) : (
          children
        )}
    </>
  );
}
