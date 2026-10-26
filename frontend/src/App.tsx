/**
 * App.tsx
 *
 * Root component for the Comercial Torres mobile POS shell.
 * Manages the active tab state, checkout modal visibility, and hides the BottomNavBar
 * when the checkout modal is displayed.
 */

import { useState } from 'react';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import SalesHistoryModal from './components/SalesHistoryModal';
import LoginView from './views/LoginView';
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import MetricsView from './views/MetricsView';
import { MOCK_SHOES, type Shoe } from './data/mockShoes';
import { MOCK_SALES } from './data/mockSales';
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
  const [shoes, setShoes] = useState<Shoe[]>(MOCK_SHOES);
  const [sales, setSales] = useState<SaleRecord[]>(MOCK_SALES);

  const handleVoidSale = (saleId: string) => {
    const sale = sales.find((record) => record.id === saleId);
    if (!sale || sale.status === 'CANCELLED') return;

    setSales((prev) =>
      prev.map((record) => (record.id === saleId ? { ...record, status: 'CANCELLED' } : record))
    );

    setShoes((prevShoes) =>
      prevShoes.map((shoe) => {
        const returns = sale.shoesToReturn.filter(
          (item) => shoe.id === `shoe-${String(item.shoeId).padStart(3, '0')}`
        );
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
        {renderTab()}
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
