/**
 * App.tsx
 *
 * Root component for the Comercial Torres mobile POS shell.
 * Manages the active tab state, checkout modal visibility, and hides the BottomNavBar
 * when the checkout modal is displayed.
 */

import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import SalesHistoryModal from './components/SalesHistoryModal';
import LoginView from './views/LoginView';
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import MetricsView from './views/MetricsView';
import type { Shoe } from './data/mockShoes';
import { MOCK_SALES } from './data/mockSales';
import { getProducts } from './services/api';
import { mapProductToShoe } from './services/productMapper';
import type { SaleRecord } from './types/sale';
import type { TabType } from './types/navigation';
import type { UserProfile } from './types/user';

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser] = useState<UserProfile>({
    id: 1,
    fullName: 'Carlos Torres',
    username: 'carlos_torres',
    role: 'ADMIN',
  });
  const [currentTab, setCurrentTab] = useState<TabType>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sales, setSales] = useState<SaleRecord[]>(MOCK_SALES);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const products = await getProducts();
      setShoes(products.map(mapProductToShoe));
    } catch {
      setLoadError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleVoidSale = (saleId: string) => {
    const sale = sales.find((record) => record.id === saleId);
    if (!sale || sale.status === 'CANCELLED') return;

    setSales((prev) =>
      prev.map((record) => (record.id === saleId ? { ...record, status: 'CANCELLED' } : record))
    );

    setShoes((prevShoes) =>
      prevShoes.map((shoe) => {
        const returns = sale.shoesToReturn.filter((item) => shoe.id === String(item.shoeId));
        if (returns.length === 0) return shoe;

        const restoreStock = (sizes: Shoe['sizes']) =>
          sizes.map((entry) => {
            const returned = returns.find((item) => item.size === entry.size);
            return returned ? { ...entry, stock: entry.stock + returned.quantity } : entry;
          });

        return {
          ...shoe,
          sizes: restoreStock(shoe.sizes),
          colors: shoe.colors?.map((variant) =>
            variant.color === shoe.color ? { ...variant, sizes: restoreStock(variant.sizes) } : variant
          ),
        };
      })
    );
  };

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
          <InventoryView
            shoes={shoes}
            onSaveStock={setShoes}
          />
        );
      case 'metrics':
        return <MetricsView />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div
      className={`max-w-md mx-auto min-h-screen bg-cream shadow-xl flex flex-col relative transition-all duration-200 ${
        isCheckoutOpen ? 'pb-0 overflow-hidden' : 'pb-20'
      }`}
    >
      <Header
        currentUser={currentUser}
        onLogout={() => setIsAuthenticated(false)}
        onOpenSalesHistory={() => setIsSalesHistoryOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {loadError && shoes.length > 0 && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadProducts()}
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
              onClick={() => void loadProducts()}
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
        <BottomNavBar activeTab={currentTab} onTabChange={setCurrentTab} />
      )}

      <SalesHistoryModal
        isOpen={isSalesHistoryOpen}
        sales={sales}
        onClose={() => setIsSalesHistoryOpen(false)}
        onVoidSale={handleVoidSale}
      />
    </div>
  );
}
