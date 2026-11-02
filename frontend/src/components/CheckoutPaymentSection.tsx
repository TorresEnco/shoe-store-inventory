/**
 * CheckoutPaymentSection.tsx
 *
 * Cash / Yape-Plin payment method selector for the checkout modal.
 */

import CheckoutYapeSection from './CheckoutYapeSection';

export type PaymentMethod = 'yape' | 'cash';

interface CheckoutPaymentSectionProps {
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  totalPrice: number;
}

const METHOD_BUTTON =
  'py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95';
const ACTIVE_METHOD = 'bg-leather text-white border-leather shadow-sm';
const INACTIVE_METHOD = 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50';

export default function CheckoutPaymentSection({
  paymentMethod,
  onSelectPaymentMethod,
  totalPrice,
}: CheckoutPaymentSectionProps) {
  return (
    <div>
      <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
        Método de Pago
      </label>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={() => onSelectPaymentMethod('cash')}
          className={`${METHOD_BUTTON} ${paymentMethod === 'cash' ? ACTIVE_METHOD : INACTIVE_METHOD}`}
        >
          <span className="text-base">💵</span>
          <span>Efectivo</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPaymentMethod('yape')}
          className={`${METHOD_BUTTON} ${paymentMethod === 'yape' ? ACTIVE_METHOD : INACTIVE_METHOD}`}
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
  );
}
