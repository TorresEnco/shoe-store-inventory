/**
 * ShoeCard.tsx
 *
 * Displays a single shoe with metadata, a colour-swatch thumbnail,
 * and an interactive size-chip row.
 *
 * Size selection is now CONTROLLED — the parent (PosView) owns which
 * size is "open" so it can pass it to QuantityDrawer.
 */

import type { Shoe, SizeEntry } from '../data/mockShoes';

interface ShoeCardProps {
  shoe: Shoe;
  /** The size that is currently highlighted for this card (null = none). */
  selectedSize: number | null;
  /** Called when the user taps an available size chip. */
  onSizeSelect: (size: number) => void;
  /** Quantity already in cart for a given size (0 if absent). */
  cartQtyForSize: (size: number) => number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSoles(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}

// ─── Sub-component: Size chip ─────────────────────────────────────────────────

interface SizeChipProps {
  entry: SizeEntry;
  isSelected: boolean;
  cartQty: number;
  onSelect: () => void;
}

function SizeChip({ entry, isSelected, cartQty, onSelect }: SizeChipProps) {
  const agotado = entry.stock === 0;
  const inCart = cartQty > 0;

  if (agotado) {
    return (
      <span
        aria-label={`Talla ${entry.size} agotada`}
        className="relative flex flex-col items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 opacity-45 cursor-not-allowed select-none"
      >
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="block h-px w-full rotate-[-18deg] bg-stone-400 opacity-60" />
        </span>
        <span className="text-[11px] font-semibold text-stone-400 leading-none">{entry.size}</span>
        <span className="mt-0.5 text-[9px] font-medium text-stone-400 leading-none">Agotado</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Talla ${entry.size}, ${entry.stock} en stock${inCart ? `, ${cartQty} en carrito` : ''}`}
      aria-pressed={isSelected}
      onClick={onSelect}
      className={[
        'relative flex flex-col items-center justify-center rounded-lg border px-2.5 py-1.5',
        'transition-all duration-150 active:scale-95 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-leather/50',
        isSelected
          ? 'border-leather bg-leather text-white shadow-md'
          : inCart
            ? 'border-amber-accent bg-amber-50 text-amber-800'
            : 'border-stone-200 bg-white text-stone-700 hover:border-leather/40 hover:bg-leather/5',
      ].join(' ')}
    >
      <span className="text-[11px] font-bold leading-none">{entry.size}</span>
      <span className={`mt-0.5 text-[9px] font-medium leading-none ${isSelected ? 'text-white/80' : inCart ? 'text-amber-600' : 'text-stone-400'}`}>
        {inCart ? `×${cartQty}` : `(${entry.stock})`}
      </span>
    </button>
  );
}

// ─── Sub-component: Colour swatch thumbnail ───────────────────────────────────

function ShoeThumbnail({ shoe }: { shoe: Shoe }) {
  return (
    <div
      className="relative flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inner"
      style={{ backgroundColor: shoe.swatchHex }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"
        className="relative z-10 h-10 w-10 drop-shadow" fill="none" aria-hidden="true">
        <ellipse cx="32" cy="34" rx="28" ry="5" fill="rgba(0,0,0,0.25)" />
        <path d="M6 28 C6 20 14 14 26 13 L44 12 C52 12 58 16 58 22 L58 28 Z" fill="rgba(255,255,255,0.30)" />
        <path d="M6 28 C6 22 12 18 20 18 L26 18 L26 28 Z" fill="rgba(255,255,255,0.20)" />
        <path d="M26 14 L26 27" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-1.5 left-0 right-0 mx-auto w-fit rounded-full bg-black/30 px-1.5 py-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-white/90">
        {shoe.category}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ShoeCard({ shoe, selectedSize, onSizeSelect, cartQtyForSize }: ShoeCardProps) {
  const sortedVariants = [...shoe.sizes].sort((a, b) => Number(a.size) - Number(b.size));

  return (
    <article
      className="flex gap-3.5 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
      aria-label={`${shoe.name} – ${shoe.brand}`}
    >
      <ShoeThumbnail shoe={shoe} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold leading-snug text-stone-800">{shoe.name}</h3>
            <p className="text-[11px] font-medium text-stone-400">
              {shoe.brand} · <span className="text-stone-500">{shoe.color}</span>
            </p>
          </div>
          <span className="flex-shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-accent">
            {formatSoles(shoe.price)}
          </span>
        </div>

        {/* Size chips */}
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={`Tallas disponibles para ${shoe.name}`}
        >
          {sortedVariants.map((entry) => (
            <SizeChip
              key={entry.size}
              entry={entry}
              isSelected={selectedSize === entry.size}
              cartQty={cartQtyForSize(entry.size)}
              onSelect={() => onSizeSelect(entry.size)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
