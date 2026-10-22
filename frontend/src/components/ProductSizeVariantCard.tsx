/**
 * ProductSizeVariantCard.tsx
 *
 * Card for an individual (Size × Color) variant showing
 * thumb-friendly stock stepper and variant-specific catalog price.
 */

interface ProductSizeVariantCardProps {
  size: number;
  stock: number;
  price: number;
  onStockChange: (newStock: number) => void;
  onPriceChange: (newPrice: number) => void;
}

export default function ProductSizeVariantCard({
  size,
  stock,
  price,
  onStockChange,
  onPriceChange,
}: ProductSizeVariantCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Talla label */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-leather text-xs font-bold text-white shadow-xs">
          {size}
        </span>
        <span className="text-xs font-bold text-stone-800">Talla {size}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Stock Stepper */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-stone-400 mr-1">Stock:</span>
          <button
            type="button"
            aria-label={`Reducir stock talla ${size}`}
            onClick={() => onStockChange(Math.max(0, stock - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 active:scale-95 disabled:opacity-40"
            disabled={stock <= 0}
          >
            -
          </button>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => onStockChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="h-8 w-11 rounded-lg border border-stone-200 bg-white text-center text-xs font-bold text-stone-900 focus:border-leather focus:outline-none"
          />
          <button
            type="button"
            aria-label={`Aumentar stock talla ${size}`}
            onClick={() => onStockChange(stock + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-leather text-white font-bold hover:bg-leather-dark active:scale-95"
          >
            +
          </button>
        </div>

        {/* Variant Catalog Price */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-stone-400">Precio:</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">
              S/.
            </span>
            <input
              type="number"
              min={0}
              step="0.5"
              value={price}
              onChange={(e) => onPriceChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="h-8 w-20 rounded-lg border border-stone-200 bg-white py-1 pl-6 pr-2 text-right text-xs font-bold text-stone-900 focus:border-leather focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
