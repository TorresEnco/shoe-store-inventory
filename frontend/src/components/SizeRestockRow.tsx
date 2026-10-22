/**
 * SizeRestockRow.tsx
 *
 * Interactive restock row for a single shoe size.
 * Features delta badge, stock status, and thumb-friendly stepper with direct input.
 */

interface SizeRestockRowProps {
  size: number;
  previousStock: number;
  count: number;
  onChange: (newCount: number) => void;
}

export default function SizeRestockRow({
  size,
  previousStock,
  count,
  onChange,
}: SizeRestockRowProps) {
  const diff = count - previousStock;

  const handleDecrement = () => {
    if (count > 0) onChange(count - 1);
  };

  const handleIncrement = () => {
    onChange(count + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-stone-300">
      {/* ── Left side: Size, Badge, and Stock context ── */}
      <div className="flex flex-col gap-1 min-w-0 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-stone-900 leading-tight">
            Talla {size}
          </span>

          {/* Dynamic Delta Badge */}
          {diff > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100/90 border border-amber-200/60 px-2 py-0.5 text-[11px] font-semibold text-amber-900 leading-none">
              +{diff} {diff === 1 ? 'par nuevo' : 'pares nuevos'}
              {previousStock === 0 && ' (vuelve a stock)'}
            </span>
          )}

          {diff === 0 && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500 leading-none">
              Sin variación
            </span>
          )}

          {diff < 0 && (
            <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-200/60 px-2 py-0.5 text-[11px] font-semibold text-rose-700 leading-none">
              {diff} {Math.abs(diff) === 1 ? 'par' : 'pares'} (merma/salida)
            </span>
          )}
        </div>

        {/* Previous stock indicator */}
        <div className="text-xs">
          {previousStock === 0 ? (
            <span className="flex items-center gap-1 font-semibold text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
              Agotado (0 pares)
            </span>
          ) : diff === 0 ? (
            <span className="text-stone-400">Stock actual: {previousStock} pares</span>
          ) : (
            <span className="text-stone-400">Stock previo: {previousStock} pares</span>
          )}
        </div>
      </div>

      {/* ── Right side: Thumb-friendly stepper ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          aria-label={`Reducir stock para talla ${size}`}
          onClick={handleDecrement}
          disabled={count <= 0}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-xl font-bold text-stone-700 shadow-xs transition-all hover:bg-stone-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
          </svg>
        </button>

        <input
          type="number"
          min={0}
          value={count}
          onChange={handleInputChange}
          aria-label={`Cantidad ingresada para talla ${size}`}
          className="h-11 w-12 rounded-xl bg-stone-50 text-center text-lg font-bold text-stone-900 border border-stone-200/60 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          aria-label={`Aumentar stock para talla ${size}`}
          onClick={handleIncrement}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-leather-dark text-xl font-bold text-white shadow-xs transition-all hover:bg-leather active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
