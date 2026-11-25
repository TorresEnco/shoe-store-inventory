import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import SalesHistoryModal from './components/SalesHistoryModal';
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import MetricsView from './views/MetricsView';
import type { Shoe } from './data/mockShoes';
import { cancelSale, getProducts, getTodaySales } from './services/api';
import { mapProductToShoe } from './services/productMapper';
import type { SaleRecord } from './types/sale';
import type { TabType } from './types/navigation';
import type { UserProfile } from './types/user';

// ─── Root component ───────────────────────────────────────────────────────────

export default function AuthenticatedPos({ currentUser, onLogout }: { currentUser: UserProfile; onLogout: () => void }) {
  const [historyMessage, setHistoryMessage] = useState('');
  const [currentTab, setCurrentTab] = useState<TabType>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      const products = await getProducts();
      setLoadError(null);
      setShoes(products.map(mapProductToShoe));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function openHistory() {
    setHistoryMessage('Cargando ventas…');
    try {
      const records = await getTodaySales();
      setSales(records.map(sale => ({
        id: String(sale.id), time: sale.createdAt.slice(11, 16), date: sale.createdAt.slice(0, 10),
        cashierName: sale.userId === currentUser.id ? currentUser.fullName : (sale.userId ? 'Empleado ' + sale.userId : 'Sin asignar'),
        customerName: sale.customerName, total: sale.total, paymentType: sale.paymentType, status: sale.status,
        itemsSummary: sale.items.map(item => item.quantity + ' × variante ' + item.variantId).join(', '), shoesToReturn: [],
      })));
      setHistoryMessage('');
      setIsSalesHistoryOpen(true);
    } catch (cause) {
      setHistoryMessage(cause instanceof Error ? cause.message : 'No se pudo consultar el historial.');
    }
  }

  async function handleVoidSale(saleId: string) {
    setIsSalesHistoryOpen(false);
    try {
      await cancelSale(Number(saleId));
      await Promise.all([openHistory(), loadProducts()]);
    } catch (cause) {
      setHistoryMessage(cause instanceof Error ? cause.message : 'No se pudo confirmar la anulación.');
    }
  }

  const renderTab = () => {
    switch (currentTab) {
      case 'pos':
        return (
          <PosView
            shoes={shoes}
            isCheckoutOpen={isCheckoutOpen}
            onCheckoutOpenChange={setIsCheckoutOpen}
            onSaleCompleted={loadProducts}
          />
        );
      case 'inventory':
        return (
          <InventoryView admin={currentUser.role === 'ADMIN'}
            shoes={shoes}
            onSaveStock={setShoes}
            reload={loadProducts}
          />
        );
      case 'metrics':
        return <MetricsView />;
    }
  };

  return (
    <div
      className={`max-w-md mx-auto min-h-screen bg-cream shadow-xl flex flex-col relative transition-all duration-200 ${
        isCheckoutOpen ? 'pb-0 overflow-hidden' : 'pb-20'
      }`}
    >
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenSalesHistory={openHistory}
      />

      {historyMessage && <p role="status" className="px-4 py-2 text-sm">{historyMessage}</p>}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {loadError && shoes.length > 0 && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => { setIsLoading(true); void loadProducts(); }}
              className="rounded-full bg-amber-200 px-3 py-1 text-[10px] font-bold text-amber-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {isLoading && shoes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-leather"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-stone-500">Cargando catálogo...</p>
          </div>
        ) : !isLoading && loadError && shoes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="text-4xl">📡</span>
            <p className="text-sm font-bold text-stone-700">No se pudo cargar el catálogo</p>
            <p className="max-w-xs text-xs text-stone-500">{loadError}</p>
            <button
              type="button"
              onClick={() => { setIsLoading(true); void loadProducts(); }}
              className="rounded-full bg-leather px-5 py-2 text-xs font-bold text-white hover:bg-leather-dark"
            >
              Reintentar
            </button>
          </div>
        ) : (
          renderTab()
        )}
      </div>

      {/* Bottom navigation is hidden whenever checkout modal is open */}
      {!isCheckoutOpen && !isSalesHistoryOpen && (
        <BottomNavBar admin={currentUser.role === 'ADMIN'} activeTab={currentTab} onTabChange={setCurrentTab} />
      )}

      <SalesHistoryModal
        isOpen={isSalesHistoryOpen}
        sales={sales}
        onClose={() => setIsSalesHistoryOpen(false)}
        onVoidSale={currentUser.role === 'ADMIN' ? handleVoidSale : undefined}
      />
    </div>
  );
}
