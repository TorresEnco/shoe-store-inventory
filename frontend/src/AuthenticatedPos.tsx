import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import CatalogContent from './components/CatalogContent';
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
  const requestVersions = useRef({ products: 0, history: 0 });

  const loadProducts = useCallback(async () => {
    const requestId = ++requestVersions.current.products;
    try {
      const products = await getProducts();
      if (requestId !== requestVersions.current.products) return;
      setLoadError(null);
      setShoes(products.map(mapProductToShoe));
    } catch (cause) {
      if (requestId !== requestVersions.current.products) return;
      setLoadError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
    } finally {
      if (requestId === requestVersions.current.products) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const versions = requestVersions.current;
    void loadProducts();
    return () => { versions.products++; versions.history++; };
  }, [loadProducts]);

  async function openHistory() {
    const requestId = ++requestVersions.current.history;
    setHistoryMessage('Cargando ventas…');
    try {
      const records = await getTodaySales();
      if (requestId !== requestVersions.current.history) return;
      setSales(records.map(sale => ({
        id: String(sale.id), time: sale.createdAt.slice(11, 16), date: sale.createdAt.slice(0, 10),
        cashierName: sale.userId === currentUser.id ? currentUser.fullName : (sale.userId ? 'Empleado ' + sale.userId : 'Sin asignar'),
        customerName: sale.customerName, total: sale.total, paymentType: sale.paymentType, status: sale.status,
        itemsSummary: sale.items.map(item => item.quantity + ' × variante ' + item.variantId).join(', '), shoesToReturn: [],
      })));
      setHistoryMessage('');
      setIsSalesHistoryOpen(true);
    } catch (cause) {
      if (requestId !== requestVersions.current.history) return;
      setHistoryMessage(cause instanceof Error ? cause.message : 'No se pudo consultar el historial.');
    }
  }

  async function handleVoidSale(saleId: string) {
    requestVersions.current.history++;
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
            onSaveStock={updated => {
              requestVersions.current.products++;
              setIsLoading(false);
              setLoadError(null);
              setShoes(updated);
            }}
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
        <CatalogContent hasProducts={shoes.length > 0} isLoading={isLoading} loadError={loadError}
          onRetry={() => { setIsLoading(true); void loadProducts(); }}>
          {renderTab()}
        </CatalogContent>
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
