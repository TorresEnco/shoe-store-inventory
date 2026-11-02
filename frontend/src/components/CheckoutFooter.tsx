/**
 * CheckoutFooter.tsx
 *
 * Pinned checkout actions: confirm sale, WhatsApp ticket, and error feedback.
 */

interface CheckoutFooterProps {
  totalPrice: number;
  isSubmitting: boolean;
  isCartEmpty: boolean;
  errorMessage: string | null;
  onFinishSale: () => void;
  onSendWhatsApp: () => void;
}

export default function CheckoutFooter({
  totalPrice,
  isSubmitting,
  isCartEmpty,
  errorMessage,
  onFinishSale,
  onSendWhatsApp,
}: CheckoutFooterProps) {
  return (
    <footer className="flex-shrink-0 p-4 bg-white border-t border-stone-200 flex flex-col gap-2">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
          <span aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
      <button
        type="button"
        disabled={isCartEmpty || isSubmitting}
        onClick={onFinishSale}
        className="w-full py-3.5 rounded-2xl bg-leather-dark text-white font-bold text-sm shadow-lg transition-all active:scale-98 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span>
          {isSubmitting
            ? 'Procesando venta...'
            : `Confirmar y Finalizar Venta (S/. ${totalPrice.toFixed(2)})`}
        </span>
        <span>{isSubmitting ? '⏳' : '✓'}</span>
      </button>
      <button
        type="button"
        onClick={onSendWhatsApp}
        className="w-full py-2.5 rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs transition-all active:scale-98 hover:bg-stone-100 flex items-center justify-center gap-1.5"
      >
        <span>💬 Enviar ticket por WhatsApp al cliente</span>
      </button>
      <p className="text-center text-[10px] text-stone-400 mt-0.5">
        🔒 Transacción local protegida · Comercial Torres POS
      </p>
    </footer>
  );
}
