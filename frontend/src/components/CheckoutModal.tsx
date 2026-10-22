/**
 * CheckoutModal.tsx
 *
 * Fullscreen mobile checkout modal with fixed header, scrollable body,
 * simplified payment methods (Efectivo & Yape/Plin), and pinned sticky footer.
 */

import { useState } from 'react';
import type { CartItem } from '../types/cart';
import CheckoutYapeSection from './CheckoutYapeSection';
import CheckoutItemList from './CheckoutItemList';
import CheckoutTotals from './CheckoutTotals';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (shoeId: string, size: number) => void;
  onConfirmSale: (customerName: string, paymentMethod: string) => void;
}

type PaymentMethod = 'yape' | 'cash';

export default function CheckoutModal({
  isOpen,
  cart,
  onClose,
  onRemoveItem,
  onConfirmSale,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [customerName, setCustomerName] = useState('');

  if (!isOpen) return null;

  const totalPairs = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleFinishSale = () => {
    onConfirmSale(customerName.trim() || 'Público General', paymentMethod);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Gracias por su compra en Comercial Torres.\nTotal: S/. ${totalPrice.toFixed(2)} (${totalPairs} pares).`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="z-50 fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
      <div className="max-w-md mx-auto w-full h-[92vh] bg-cream rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* TOP: Fixed header */}
        <header className="flex-shrink-0 bg-cream/95 px-5 py-3.5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-stone-600 hover:bg-stone-200 active:scale-95"
              aria-label="Volver"
            >
              ←
            </button>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">Cobro y Pago</h2>
              <p className="text-[11px] font-semibold text-stone-500">Comercial Torres</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-300 active:scale-95"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </header>

        {/* MIDDLE: Scrollable body area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📠</span>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  Resumen de Venta <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">{totalPairs} productos</span>
                </p>
                <p className="text-[10px] font-medium text-emerald-700">● Terminal #01 · Caja Abierta</p>
              </div>
            </div>
          </div>

          <CheckoutItemList cart={cart} onRemoveItem={onRemoveItem} />
          <CheckoutTotals totalPairs={totalPairs} totalPrice={totalPrice} />

          {/* Payment method selection: 2 equal buttons */}
          <div>
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'bg-leather text-white border-leather shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">💵</span>
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('yape')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 ${
                  paymentMethod === 'yape'
                    ? 'bg-leather text-white border-leather shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">📱</span>
                <span>Yape / Plin</span>
              </button>
            </div>

            {paymentMethod === 'yape' ? (
              <CheckoutYapeSection total={totalPrice} />
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-600 leading-relaxed">
                💵 Cobro en caja registradora. Verifique billetes auténticos al recibir efectivo.
              </div>
            )}
          </div>

          {/* Customer info */}
          <div>
            <label htmlFor="customer-name" className="text-xs font-bold text-stone-700 block mb-1">
              Nombre del Cliente (opcional)
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Carlos Mendoza (por defecto: Público General)"
              className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-leather"
            />
          </div>
        </div>

        {/* BOTTOM: Pinned sticky footer */}
        <footer className="flex-shrink-0 p-4 bg-white border-t border-stone-200 flex flex-col gap-2">
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleFinishSale}
            className="w-full py-3.5 rounded-2xl bg-leather-dark text-white font-bold text-sm shadow-lg transition-all active:scale-98 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Confirmar y Finalizar Venta (S/. {totalPrice.toFixed(2)})</span>
            <span>✓</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs transition-all active:scale-98 hover:bg-stone-100 flex items-center justify-center gap-1.5"
          >
            <span>💬 Enviar ticket por WhatsApp al cliente</span>
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-0.5">
            🔒 Transacción local protegida · Comercial Torres POS
          </p>
        </footer>
      </div>
    </div>
  );
}
