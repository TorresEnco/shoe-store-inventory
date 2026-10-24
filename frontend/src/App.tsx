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
import LoginView from './views/LoginView';
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import MetricsView from './views/MetricsView';
import { MOCK_SHOES, type Shoe } from './data/mockShoes';
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
  const [shoes, setShoes] = useState<Shoe[]>(MOCK_SHOES);

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
      <Header currentUser={currentUser} onLogout={() => setIsAuthenticated(false)} />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {renderTab()}
      </div>

      {/* Bottom navigation is hidden whenever checkout modal is open */}
      {!isCheckoutOpen && (
        <BottomNavBar activeTab={currentTab} onTabChange={setCurrentTab} />
      )}
    </div>
  );
}
