/**
 * CheckoutModal.tsx
 *
 * Fullscreen mobile checkout modal with fixed header, scrollable body,
 * simplified payment methods (Efectivo & Yape/Plin), and pinned sticky footer.
 */
import { useState } from 'react';
import type { CartItem } from '../types/cart';
import { processSale, type PaymentType } from '../services/api';
import CheckoutPaymentSection, { type PaymentMethod } from './CheckoutPaymentSection';
import CheckoutCustomerSection from './CheckoutCustomerSection';
import CheckoutItemList from './CheckoutItemList';
import CheckoutTotals from './CheckoutTotals';
import CheckoutFooter from './CheckoutFooter';
interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (shoeId: string, size: number) => void;
  onConfirmSale: (customerName: string, paymentMethod: string) => void;
}

export default function CheckoutModal({
  isOpen,
  cart,
  onClose,
  onRemoveItem,
  onConfirmSale,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPairs = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleFinishSale = async () => {
    if (isSubmitting || cart.length === 0) return;

    const paymentType: PaymentType = paymentMethod === 'cash' ? 'CASH' : 'YAPE_PLIN';
    const finalCustomerName = customerName.trim() || 'Público General';

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await processSale({
        customerName: finalCustomerName,
        customerPhone: customerPhone.trim() || undefined,
        paymentType,
        items: cart.map((item) => ({
          variantId: item.variantId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      });
      onConfirmSale(finalCustomerName, paymentMethod);
    } catch {
      setErrorMessage('No se pudo registrar la venta. Verifica la conexión e intenta nuevamente.');
    } finally {
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

          <CheckoutPaymentSection
            paymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            totalPrice={totalPrice}
          />

          <CheckoutCustomerSection
            name={customerName}
            phone={customerPhone}
            onChange={(name, phone) => {
              setCustomerName(name);
              setCustomerPhone(phone);
            }}
          />
        </div>

        <CheckoutFooter
          totalPrice={totalPrice}
          isSubmitting={isSubmitting}
          isCartEmpty={cart.length === 0}
          errorMessage={errorMessage}
          onFinishSale={() => void handleFinishSale()}
          onSendWhatsApp={handleWhatsApp}
        />
      </div>
    </div>
  );
}
