import SheetDialog from './SheetDialog';
/**
 * CheckoutModal.tsx
 *
 * Fullscreen mobile checkout modal with fixed header, scrollable body,
 * cash payment, and pinned sticky footer.
 */

import { useRef, useState } from 'react';
import type { CartItem } from '../types/cart';
import { processSale, SaleRejectedError, ApiTransportError } from '../services/api';
import CheckoutYapeSection from './CheckoutYapeSection';
import CheckoutItemList from './CheckoutItemList';
import CheckoutTotals from './CheckoutTotals';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (variantId: number) => void;
  onConfirmSale: () => void;
}

export default function CheckoutModal({
  isOpen,
  cart,
  onClose,
  onRemoveItem,
  onConfirmSale,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPendingSale, setHasPendingSale] = useState(false);
  const pendingKey = useRef<string | null>(null);
  const submitting = useRef(false);

  if (!isOpen) return null;

  const totalPairs = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleFinishSale = async () => {
    if (submitting.current || cart.length === 0) return;

    const finalCustomerName = customerName.trim() || 'Público General';

    try {
      pendingKey.current ??= crypto.randomUUID();
      submitting.current = true;
      setHasPendingSale(true);
      setIsSubmitting(true);
      setErrorMessage(null);
      await processSale({
        customerName: finalCustomerName,
        paymentType: 'CASH',
        items: cart.map((item) => ({
          variantId: item.variantId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      }, pendingKey.current);
      pendingKey.current = null;
      setHasPendingSale(false);
      onConfirmSale();
    } catch (cause) {
      if (cause instanceof SaleRejectedError) {
        pendingKey.current = null;
        setHasPendingSale(false);
        setErrorMessage(cause.message);
      } else {
        const detail = cause instanceof ApiTransportError ? `${cause.message} ` : '';
        setErrorMessage(detail + 'El resultado del cobro está pendiente. Reintenta este mismo cobro para confirmarlo.');
      }
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Gracias por su compra en Comercial Torres.\nTotal: S/. ${totalPrice.toFixed(2)} (${totalPairs} pares).`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <SheetDialog label="Cobro y pago" onClose={onClose} locked={hasPendingSale}>
      <div className="max-w-md mx-auto w-full h-[92vh] bg-cream rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* TOP: Fixed header */}
        <header className="flex-shrink-0 bg-cream/95 px-5 py-3.5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={hasPendingSale}
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
            disabled={hasPendingSale}
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

          <fieldset disabled={hasPendingSale}>
          <CheckoutItemList cart={cart} onRemoveItem={onRemoveItem} />
          <CheckoutTotals totalPairs={totalPairs} totalPrice={totalPrice} />

          <section className="my-4 space-y-2" aria-label="Método de pago">
            <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
              Pago en efectivo
            </p>
            <CheckoutYapeSection />
          </section>

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
          </fieldset>
        </div>

        {/* BOTTOM: Pinned sticky footer */}
        <footer className="flex-shrink-0 p-4 bg-white border-t border-stone-200 flex flex-col gap-2">
          {errorMessage && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              <span aria-hidden="true">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
          <button
            type="button"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleFinishSale}
            className="w-full py-3.5 rounded-2xl bg-leather-dark text-white font-bold text-sm shadow-lg transition-all active:scale-98 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Procesando venta...'
                : hasPendingSale ? 'Reintentar el mismo cobro'
                : `Confirmar cobro en efectivo (S/. ${totalPrice.toFixed(2)})`}
            </span>
            <span>{isSubmitting ? '⏳' : '✓'}</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={hasPendingSale}
            className="w-full py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs transition-all active:scale-98 hover:bg-stone-100 flex items-center justify-center gap-1.5"
          >
            <span>💬 Enviar ticket por WhatsApp al cliente</span>
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-0.5">
            🔒 Transacción local protegida · Comercial Torres POS
          </p>
        </footer>
      </div>
    </SheetDialog>
  );
}
