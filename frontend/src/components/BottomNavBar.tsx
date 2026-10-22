/**
 * BottomNavBar.tsx
 *
 * Fixed mobile bottom navigation with three touch targets for the
 * Comercial Torres POS shell.
 */

import type { TabType } from '../types/navigation';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

// ─── Tab definitions ────────────────────────────────────────────────────────

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

/** Inline SVG icons — no icon library dependency needed. */
const POSIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {/* Store-front outline */}
    <path d="M3 9l1-5h16l1 5" />
    <path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" />
    <path d="M5 20V11m14 9V11" />
    <rect x="9" y="14" width="6" height="6" rx="1" />
  </svg>
);

const InventoryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {/* Package / box outline */}
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const MetricsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {/* Bar-chart outline */}
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: 'pos',       label: 'Venta Rápida', icon: <POSIcon /> },
  { id: 'inventory', label: 'Inventario',   icon: <InventoryIcon /> },
  { id: 'metrics',   label: 'Métricas',     icon: <MetricsIcon /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-stone-200 z-50 safe-area-pb"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = id === activeTab;
          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(id)}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 px-1',
                'transition-colors duration-150 active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leather/50',
                isActive
                  ? 'text-leather'
                  : 'text-stone-400 hover:text-stone-600',
              ].join(' ')}
            >
              {/* Icon */}
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150',
                  isActive ? 'bg-leather/10' : '',
                ].join(' ')}
              >
                {icon}
              </span>

              {/* Label */}
              <span
                className={[
                  'text-[10px] leading-tight transition-all duration-150',
                  isActive ? 'font-bold' : 'font-medium',
                ].join(' ')}
              >
                {label}
              </span>

              {/* Active indicator pill */}
              {isActive && (
                <span
                  className="absolute bottom-0 h-0.5 w-10 rounded-t-full bg-leather"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
