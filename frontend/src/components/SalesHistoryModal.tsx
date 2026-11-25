import type { SaleRecord } from '../types/sale';
import SaleHistoryCard from './SaleHistoryCard';

interface SalesHistoryModalProps {
  isOpen: boolean;
  sales: SaleRecord[];
  onClose: () => void;
  onVoidSale?: (saleId: string) => void;
}

export default function SalesHistoryModal({ isOpen, sales, onClose, onVoidSale }: SalesHistoryModalProps) {


  if (!isOpen) return null;

  const todaysCompleted = sales.filter(
    (sale) => sale.status === 'COMPLETED'
  );
  const total = todaysCompleted.reduce((sum, sale) => sum + sale.total, 0);
  const cash = todaysCompleted
    .filter((sale) => sale.paymentType === 'CASH')
    .reduce((sum, sale) => sum + sale.total, 0);
  const yapePlin = total - cash;
  const visibleSales = sales;

  const handleVoid = (sale: SaleRecord) => {
    if (window.confirm(`¿Anular venta ${sale.id}? Se devolverán los pares al stock.`)) {
      onVoidSale?.(sale.id);
    }
  };

  return (
    <div className="z-50 fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
      <div className="max-w-md mx-auto w-full h-[92vh] bg-cream rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
        <header className="flex-shrink-0 bg-cream/95 px-5 py-3.5 flex items-start justify-between border-b border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900 leading-tight">Historial de Ventas y Caja</h2>
            <p className="text-[11px] font-semibold text-stone-500">Ventas de hoy</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-300 active:scale-95"
            aria-label="Cerrar historial"
          >
            ✕
          </button>
        </header>

        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Total del día</span>
              <span className="text-lg font-bold text-leather">S/. {total.toFixed(2)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                Efectivo: <span className="font-bold">S/. {cash.toFixed(2)}</span>
              </div>
              <div className="rounded-xl bg-violet-50 px-2.5 py-1.5 text-violet-700">
                Yape / Plin: <span className="font-bold">S/. {yapePlin.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visibleSales.length > 0 ? (
            visibleSales.map((sale) => <SaleHistoryCard key={sale.id} sale={sale} onVoid={onVoidSale ? handleVoid : undefined} />)
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-stone-200 py-10 text-center">
              <p className="text-xs font-semibold text-stone-400">No hay ventas registradas en este período.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
