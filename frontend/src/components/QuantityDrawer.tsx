/**
 * QuantityDrawer.tsx
 *
 * A bottom-sheet drawer that slides up when the cashier taps a size chip.
 *
 * Local state:
 *   qty       — how many pairs (typable + stepper, bounded 1…maxStock)
 *   unitPrice — the negotiated per-pair price (pre-seeded from catalogue,
 *               editable so cashiers can apply on-the-spot discounts)
 *
 * Subtotal = unitPrice × qty, updated live on every keystroke / tap.
 *
 * Animation: CSS translate-y on the sheet + opacity on the backdrop.
 */

import { useEffect, useState } from 'react';
import type { CartItem } from '../types/cart';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Everything the drawer needs to know about the variant being opened. */
export interface DrawerVariant {
  shoeId: string;
  name: string;
  brand: string;
  color: string;
  size: number;
  /** Original catalogue price — shown as the reference pill, never editable. */
  catalogPrice: number;
  maxStock: number;
  /** Quantity already in the cart (0 if not added yet). */
  existingQty: number;
  /** Unit price already negotiated for this cart line (falls back to catalogPrice). */
  existingUnitPrice: number;
}

interface QuantityDrawerProps {
  variant: DrawerVariant | null; // null = closed
  onConfirm: (item: CartItem) => void;
  onCancel: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSoles(n: number): string {
  return `S/. ${n.toFixed(2)}`;
}

/**
 * Clamps a raw string to a valid price.
 * Returns the previous value if the input is non-numeric or negative.
 */
function parsePrice(raw: string, fallback: number): number {
  const parsed = parseFloat(raw);
  return isNaN(parsed) || parsed < 0 ? fallback : parsed;
}

// ─── Stepper button ───────────────────────────────────────────────────────────

interface StepperBtnProps {
  label: string;
  icon: '+' | '−';
  disabled: boolean;
  onClick: () => void;
}

function StepperBtn({ label, icon, disabled, onClick }: StepperBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
        'text-xl font-bold border select-none',
        'transition-all duration-100 active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leather/40',
        disabled
          ? 'border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed'
          : 'border-leather/30 bg-leather/5 text-leather hover:bg-leather hover:text-white',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuantityDrawer({ variant, onConfirm, onCancel }: QuantityDrawerProps) {
  /**
   * qty — typable + stepper, clamped to [1, maxStock].
   * Stored as a number; the <input> converts the raw string on blur/change.
   */
  const [qty, setQty] = useState(1);

  /**
   * unitPrice — the per-pair price the cashier will charge.
   * Pre-seeded from catalogPrice but freely editable.
   * Stored as a string while the cashier is typing (so "12" doesn't
   * round-trip to "12.00" mid-edit), then parsed on confirm/blur.
   */
  const [unitPriceStr, setUnitPriceStr] = useState('');

  // ── Seed state whenever the drawer opens for a new variant ──────────────────
  useEffect(() => {
    if (variant) {
      setQty(variant.existingQty > 0 ? variant.existingQty : 1);
      // Re-seed the negotiated price from whatever is already in the cart,
      // falling back to the catalogue price for first-time opens.
      setUnitPriceStr(variant.existingUnitPrice.toFixed(2));
    }
  }, [variant]);

  if (!variant) {
    // Render the closed sheet (invisible) so the slide-out animation works.
    return (
      <>
        <div aria-hidden="true"
          className="fixed inset-0 z-[60] bg-black/40 opacity-0 pointer-events-none transition-opacity duration-300" />
        <div role="dialog" aria-modal="true" aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto rounded-t-3xl bg-white px-5 pt-4 pb-8 shadow-2xl translate-y-full transition-transform duration-300 ease-out">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-stone-200" />
        </div>
      </>
    );
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const parsedUnitPrice = parsePrice(unitPriceStr, variant.catalogPrice);
  const subtotal = parsedUnitPrice * qty;
  const isDiscounted = parsedUnitPrice < variant.catalogPrice - 0.001;
  const isPremium    = parsedUnitPrice > variant.catalogPrice + 0.001;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => Math.min(variant.maxStock, q + 1));

  /** Handle the qty <input> change — parse, clamp, write back as number. */
  const handleQtyInput = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return; // ignore non-numeric mid-edit
    setQty(Math.min(variant.maxStock, Math.max(1, n)));
  };

  /** On blur, normalise the price string to 2 decimal places. */
  const handlePriceBlur = () => {
    setUnitPriceStr(parsedUnitPrice.toFixed(2));
  };

  const handleConfirm = () => {
    onConfirm({
      shoeId: variant.shoeId,
      name: variant.name,
      brand: variant.brand,
      color: variant.color,
      size: variant.size,
      catalogPrice: variant.catalogPrice,
      unitPrice: parsedUnitPrice,
      maxStock: variant.maxStock,
      quantity: qty,
    });
  };

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="fixed inset-0 z-[60] bg-black/40 opacity-100 transition-opacity duration-300"
      />

      {/* ── Sheet ───────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Agregar ${variant.name} talla ${variant.size}`}
        className={[
          'fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto',
          'rounded-t-3xl bg-white px-5 pt-4 pb-8 shadow-2xl',
          'translate-y-0 transition-transform duration-300 ease-out',
        ].join(' ')}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-stone-200" aria-hidden="true" />

        {/* ── 1. Product info ─────────────────────────────────────────────── */}
        <div className="mb-5">
          <h2 className="text-base font-bold leading-snug text-stone-800">{variant.name}</h2>
          <p className="mt-0.5 text-xs text-stone-400">
            {variant.brand} · {variant.color}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-leather/30 bg-leather/5 px-3 py-1.5 text-sm font-bold text-leather">
              Talla {variant.size}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Máx. {variant.maxStock} {variant.maxStock === 1 ? 'par disponible' : 'pares disponibles'} en bodega
            </span>
          </div>
        </div>

        {/* ── 2. Quantity stepper with typable input ───────────────────────── */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
          <span className="text-sm font-semibold text-stone-600">Cantidad</span>
          <div className="flex items-center gap-3">
            <StepperBtn icon="−" label="Reducir cantidad" disabled={qty <= 1} onClick={decrement} />

            {/*
             * Typable number input — the cashier can tap the digits directly
             * on a numeric keyboard instead of pressing [+] multiple times.
             * min/max attrs provide browser-level guardrails; we also clamp
             * in handleQtyInput for React-controlled consistency.
             */}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={variant.maxStock}
              value={qty}
              onChange={(e) => handleQtyInput(e.target.value)}
              aria-label="Cantidad de pares"
              aria-live="polite"
              className={[
                'h-11 w-14 rounded-xl border border-stone-200 bg-white',
                'text-center text-xl font-bold tabular-nums text-stone-800',
                'shadow-sm transition-shadow',
                'focus:border-leather/40 focus:outline-none focus:ring-2 focus:ring-leather/20',
                // Hide the native spin arrows — stepper buttons replace them
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              ].join(' ')}
            />

            <StepperBtn icon="+" label="Aumentar cantidad" disabled={qty >= variant.maxStock} onClick={increment} />
          </div>
        </div>

        {/* ── 3. Negotiable unit price ─────────────────────────────────────── */}
        <div className="mb-4 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <label htmlFor="drawer-unit-price" className="text-sm font-semibold text-stone-600">
              Precio Unitario de Venta{' '}
              <span className="font-normal text-stone-400">(S/.)</span>
            </label>

            {/* Catalogue reference pill — dynamically coloured */}
            <span className={[
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              isDiscounted
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : isPremium
                  ? 'bg-violet-50 border border-violet-200 text-violet-600'
                  : 'bg-stone-100 border border-stone-200 text-stone-500',
            ].join(' ')}>
              {isDiscounted && '↓ '}
              {isPremium && '↑ '}
              Catálogo: {formatSoles(variant.catalogPrice)}
            </span>
          </div>

          {/*
           * Editable price input.
           * `type="number"` with `step="0.01"` lets mobile keyboards show
           * a decimal numpad. We store it as a raw string while typing so the
           * cashier can freely type "110" without it snapping to "110.00" mid-edit.
           */}
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400 select-none">
              S/.
            </span>
            <input
              id="drawer-unit-price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={unitPriceStr}
              onChange={(e) => setUnitPriceStr(e.target.value)}
              onBlur={handlePriceBlur}
              aria-label="Precio unitario de venta en soles"
              className={[
                'w-full rounded-xl border py-2.5 pl-10 pr-4',
                'text-right text-base font-bold tabular-nums',
                'transition-shadow shadow-sm',
                'focus:outline-none focus:ring-2',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                isDiscounted
                  ? 'border-rose-200 bg-rose-50/50 text-rose-700 focus:border-rose-300 focus:ring-rose-200/50'
                  : isPremium
                    ? 'border-violet-200 bg-violet-50/50 text-violet-700 focus:border-violet-300 focus:ring-violet-200/50'
                    : 'border-stone-200 bg-white text-stone-800 focus:border-leather/40 focus:ring-leather/20',
              ].join(' ')}
            />
          </div>

          {/* Discount / premium amount hint */}
          {(isDiscounted || isPremium) && (
            <p className={`mt-1.5 text-right text-[11px] font-semibold ${isDiscounted ? 'text-rose-500' : 'text-violet-500'}`}>
              {isDiscounted
                ? `Descuento: −${formatSoles(variant.catalogPrice - parsedUnitPrice)} por par`
                : `Prima: +${formatSoles(parsedUnitPrice - variant.catalogPrice)} por par`}
            </p>
          )}
        </div>

        {/* ── 4. Live subtotal ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-600">Subtotal</span>
            <span className="text-[10px] text-stone-400">
              {qty} {qty === 1 ? 'par' : 'pares'} × {formatSoles(parsedUnitPrice)}
            </span>
          </div>
          <span className="text-xl font-black tabular-nums text-amber-accent">
            {formatSoles(subtotal)}
          </span>
        </div>

        {/* ── 5. Action buttons ────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={[
              'flex-1 rounded-xl border border-stone-200 py-3',
              'text-sm font-semibold text-stone-500',
              'transition-colors hover:border-stone-300 hover:text-stone-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300',
            ].join(' ')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={[
              'flex-[2] rounded-xl bg-leather py-3',
              'text-sm font-bold text-white shadow-md',
              'transition-all duration-150 active:scale-[0.98] hover:bg-leather-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leather/50',
            ].join(' ')}
          >
            + Agregar a la Venta
          </button>
        </div>
      </div>
    </>
  );
}
