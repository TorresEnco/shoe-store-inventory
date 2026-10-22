/**
 * ShoeColorCard.tsx
 *
 * Model & Color Selection Card for the inventory adjustment view.
 * Displays shoe metadata, leather badge thumbnail, color chips, and edit trigger.
 */

import type { Shoe, ColorVariant } from '../data/mockShoes';

interface ShoeColorCardProps {
  shoe: Shoe;
  activeColor: string;
  onSelectColor: (color: string) => void;
  onEdit?: () => void;
}

export default function ShoeColorCard({
  shoe,
  activeColor,
  onSelectColor,
  onEdit,
}: ShoeColorCardProps) {
  const brandDisplay = shoe.subtitle
    ? `${shoe.brand.toUpperCase()} · ${shoe.subtitle.toUpperCase()}`
    : shoe.brand.toUpperCase();

  const colorVariants: ColorVariant[] =
    shoe.colors && shoe.colors.length > 0
      ? shoe.colors
      : [{ color: shoe.color, swatchHex: shoe.swatchHex, sizes: shoe.sizes }];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm">
      {/* ── Top row: Thumbnail & Shoe details ── */}
      <div className="flex gap-3">
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inner"
          style={{ backgroundColor: shoe.swatchHex }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/20" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" className="relative z-10 h-10 w-10 drop-shadow" fill="none">
            <ellipse cx="32" cy="34" rx="28" ry="5" fill="rgba(0,0,0,0.3)" />
            <path d="M6 28 C6 20 14 14 26 13 L44 12 C52 12 58 16 58 22 L58 28 Z" fill="rgba(255,255,255,0.35)" />
            <path d="M6 28 C6 22 12 18 20 18 L26 18 L26 28 Z" fill="rgba(255,255,255,0.22)" />
            <path d="M26 14 L26 27" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-1 right-1 rounded-md bg-stone-900/70 px-1.5 py-0.5 text-[9px] font-bold text-amber-100 backdrop-blur-xs">
            Cuero
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-amber-900">{brandDisplay}</p>
          <h3 className="truncate text-base font-bold text-stone-900">{shoe.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-stone-500">
            S/. {shoe.price.toFixed(2)}
            {shoe.refCode && <span className="font-normal text-stone-400"> · Ref: {shoe.refCode}</span>}
          </p>
        </div>
      </div>

      {/* ── Color Variations ── */}
      <div className="mt-3 border-t border-stone-100 pt-3">
        <p className="text-xs font-semibold text-stone-600">Variación de cuero:</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Variación de color">
          {colorVariants.map((variant) => {
            const isSelected = variant.color === activeColor;
            return (
              <button
                key={variant.color}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectColor(variant.color)}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
                  isSelected
                    ? 'bg-leather-dark text-white shadow-sm ring-1 ring-leather-dark'
                    : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100',
                ].join(' ')}
              >
                <span className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: variant.swatchHex }} aria-hidden="true" />
                <span>{variant.color}</span>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Edit trigger button ── */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50/80 py-2 text-xs font-bold text-stone-700 transition-all hover:border-leather/30 hover:bg-leather/5 hover:text-leather active:scale-95"
        >
          <span>✏️</span> Editar Calzado / Precios
        </button>
      )}
    </div>
  );
}
