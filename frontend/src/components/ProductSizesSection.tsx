/**
 * ProductSizesSection.tsx
 *
 * Section 3: Curva de Tallas, Stock y Precios.
 * Manages color tabs, dual range toggle (Kids vs Adults),
 * size chips toggles, and per-variant stock & price configurations.
 */

import { useState } from 'react';
import type { SizeEntry } from '../data/mockShoes';
import ProductSizeVariantCard from './ProductSizeVariantCard';

const KIDS_RANGE = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
const ADULTS_RANGE = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

interface ProductSizesSectionProps {
  colors: string[];
  activeColorTab: string;
  onSelectColorTab: (color: string) => void;
  sizes: SizeEntry[];
  basePrice: number;
  onToggleSize: (size: number) => void;
  onStockChange: (size: number, stock: number) => void;
  onPriceChange: (size: number, price: number) => void;
}

export default function ProductSizesSection({
  colors,
  activeColorTab,
  onSelectColorTab,
  sizes,
  basePrice,
  onToggleSize,
  onStockChange,
  onPriceChange,
}: ProductSizesSectionProps) {
  const [activeRange, setActiveRange] = useState<'adults' | 'kids'>('adults');
  const currentRange = activeRange === 'adults' ? ADULTS_RANGE : KIDS_RANGE;
  const sortedSizes = [...sizes].sort((a, b) => a.size - b.size);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-leather">
          3. Curva de Tallas, Stock y Precios
        </h3>
        <span className="text-[11px] font-semibold text-stone-500">
          {sizes.length} {sizes.length === 1 ? 'talla activa' : 'tallas activas'}
        </span>
      </div>

      {/* Horizontal color tabs if multiple colors exist */}
      {colors.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {colors.map((color) => {
            const isActive = color === activeColorTab;
            return (
              <button
                key={color}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectColorTab(color)}
                className={[
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                  isActive
                    ? 'bg-leather text-white shadow-xs ring-1 ring-leather'
                    : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100',
                ].join(' ')}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
                <span>{color} {isActive && '(Activo)'}</span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs font-medium text-stone-500">
        Configurando existencias y precios para:{' '}
        <span className="font-bold text-stone-800">{activeColorTab}</span>
      </p>

      {/* Dual Range Toggle */}
      <div className="flex rounded-xl bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => setActiveRange('adults')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
            activeRange === 'adults' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Adultos (35 - 44)
        </button>
        <button
          type="button"
          onClick={() => setActiveRange('kids')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
            activeRange === 'kids' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Niños (22 - 32)
        </button>
      </div>

      {/* Selectable size chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {currentRange.map((sz) => {
          const isSelected = sizes.some((s) => s.size === sz);
          return (
            <button
              key={sz}
              type="button"
              onClick={() => onToggleSize(sz)}
              className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                isSelected ? 'border-leather bg-leather text-white shadow-xs' : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {sz}
            </button>
          );
        })}
      </div>

      {/* Variant Cards for Selected Sizes */}
      {sortedSizes.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 border-t border-stone-100 pt-3">
          <p className="text-[11px] font-semibold text-stone-400">
            Stock y precio catálogo por talla ({activeColorTab}):
          </p>
          <div className="flex flex-col gap-2">
            {sortedSizes.map((entry) => (
              <ProductSizeVariantCard
                key={entry.size}
                size={entry.size}
                stock={entry.stock}
                price={entry.price ?? basePrice}
                onStockChange={(newStock) => onStockChange(entry.size, newStock)}
                onPriceChange={(newPrice) => onPriceChange(entry.size, newPrice)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
