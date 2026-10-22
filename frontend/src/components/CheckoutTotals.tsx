/**
 * CheckoutTotals.tsx
 *
 * Subtotal, IGV breakdown, and prominent total display in Soles (S/.)
 */

interface CheckoutTotalsProps {
  totalPairs: number;
  totalPrice: number;
}

export default function CheckoutTotals({ totalPairs, totalPrice }: CheckoutTotalsProps) {
  const igv = (totalPrice * 0.18) / 1.18;

  return (
    <div className="p-3 rounded-2xl bg-white border border-stone-200 flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-stone-500">
        <span>Subtotal ({totalPairs} pares)</span>
        <span>S/. {totalPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs text-stone-400">
        <span>IGV (18% incluido según ley)</span>
        <span>S/. {igv.toFixed(2)}</span>
      </div>
      <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
        <div>
          <p className="text-xs font-bold text-stone-700">TOTAL A COBRAR</p>
          <p className="text-[10px] text-stone-400">Boleta Electrónica</p>
        </div>
        <span className="text-2xl font-black text-leather">S/. {totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
