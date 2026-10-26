import type { SaleRecord } from '../types/sale';

interface SaleHistoryCardProps {
  sale: SaleRecord;
  onVoid: (sale: SaleRecord) => void;
}

export default function SaleHistoryCard({ sale, onVoid }: SaleHistoryCardProps) {
  const isCompleted = sale.status === 'COMPLETED';

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-leather">{sale.id}</span>
            <span className="text-[11px] font-medium text-stone-400">{sale.time}</span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-stone-500">
            {sale.cashierName} · {sale.customerName}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
            sale.paymentType === 'CASH'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-violet-200 bg-violet-50 text-violet-700'
          }`}
        >
          {sale.paymentType === 'CASH' ? '💵 Efectivo' : '📱 Yape'}
        </span>
      </div>

      <p className="mt-2 text-xs leading-snug text-stone-700">{sale.itemsSummary}</p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
        <span className="text-sm font-bold text-stone-900">S/. {sale.total.toFixed(2)}</span>
        {isCompleted ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Pagado
            </span>
            <button
              type="button"
              onClick={() => onVoid(sale)}
              className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-100 active:scale-95"
            >
              ✕ Anular Venta
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">Anulada</span>
            <span className="text-[10px] font-medium text-stone-400">Stock restaurado</span>
          </div>
        )}
      </div>
    </article>
  );
}
