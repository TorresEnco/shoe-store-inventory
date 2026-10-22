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
import PosView from './views/PosView';
import InventoryView from './views/InventoryView';
import { MOCK_SHOES, type Shoe } from './data/mockShoes';
import type { TabType } from './types/navigation';

// ─── Placeholder view for tabs not yet implemented ───────────────────────────

interface PlaceholderProps {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}

function PlaceholderView({ icon, title, description, accentColor }: PlaceholderProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Comercial Torres · Sistema POS
        </p>
        <h1 className="text-2xl font-bold text-leather">{title}</h1>
      </div>
      <div
        className={[
          'w-full rounded-2xl border-2 border-dashed p-8',
          'flex flex-col items-center gap-4 text-center',
          accentColor,
        ].join(' ')}
      >
        <span className="text-5xl" role="img" aria-label={title}>{icon}</span>
        <p className="text-sm font-semibold leading-snug">{description}</p>
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium shadow-sm">
          En construcción
        </span>
      </div>
    </main>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
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
        return (
          <PlaceholderView
            icon="📊"
            title="Métricas"
            description="Vista de Métricas y Pareto ABC (Próximamente)"
            accentColor="bg-violet-50 border-violet-200 text-violet-800"
          />
        );
    }
  };

  return (
    <div
      className={`max-w-md mx-auto min-h-screen bg-cream shadow-xl flex flex-col relative transition-all duration-200 ${
        isCheckoutOpen ? 'pb-0 overflow-hidden' : 'pb-20'
      }`}
    >
      <Header />

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
