/**
 * FloatingOrderBar.tsx
 *
 * Fixed cart summary bar placed directly above the bottom navigation bar.
 * Appears whenever cart.length > 0.
 */

import type { CartItem } from '../types/cart';

interface FloatingOrderBarProps {
  cart: CartItem[];
  onOpenCheckout: () => void;
}

export default function FloatingOrderBar({ cart, onOpenCheckout }: FloatingOrderBarProps) {
  if (cart.length === 0) return null;

  const totalPairs = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <aside
      aria-label="Resumen de orden flotante"
      className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-40"
    >
      <div className="bg-leather-dark text-white rounded-2xl shadow-2xl p-3 flex items-center justify-between">
        {/* Left: Bag icon + counts + total */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-stone-300">
              {totalPairs} {totalPairs === 1 ? 'par' : 'pares'} en orden
            </span>
            <span className="text-base font-bold tabular-nums text-white">
              S/. {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Checkout trigger */}
        <button
          type="button"
          onClick={onOpenCheckout}
          className="flex items-center gap-1.5 rounded-xl bg-amber-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
        >
          <span>COBRAR</span>
          <span>➔</span>
        </button>
      </div>
    </aside>
  );
}
