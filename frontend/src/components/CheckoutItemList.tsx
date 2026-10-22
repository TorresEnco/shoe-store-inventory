/**
 * CheckoutItemList.tsx
 *
 * Line-item breakdown of products currently in the checkout order.
 */

import type { CartItem } from '../types/cart';

interface CheckoutItemListProps {
  cart: CartItem[];
  onRemoveItem: (shoeId: string, size: number) => void;
}

export default function CheckoutItemList({ cart, onRemoveItem }: CheckoutItemListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Artículos en Orden
        </span>
        <span className="text-[10px] text-stone-400">Lote #PE-204</span>
      </div>
      <div className="flex flex-col gap-2">
        {cart.map((item) => (
          <div
            key={`${item.shoeId}-${item.size}`}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center text-lg">
                👞
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-800">{item.name}</h4>
                <p className="text-[10px] text-stone-400">
                  {item.brand} · {item.color}
                </p>
                <p className="text-[10px] font-semibold text-leather">
                  Talla {item.size} · Cant: {item.quantity}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-stone-800">
                S/. {(item.unitPrice * item.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.shoeId, item.size)}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 active:scale-95"
              >
                🗑️ Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
