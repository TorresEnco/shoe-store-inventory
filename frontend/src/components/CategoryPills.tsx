/**
 * CategoryPills.tsx
 *
 * Horizontal scrollable category filters with count badges.
 */

import type { Category } from '../data/mockShoes';

export type FilterCategory = 'Todas' | Category;

export const CATEGORIES: FilterCategory[] = ['Todas', 'Casual', 'Zapatillas', 'Formal', 'Botines'];

interface CategoryPillsProps {
  active: FilterCategory;
  onSelect: (c: FilterCategory) => void;
  counts: Record<FilterCategory, number>;
}

export default function CategoryPills({ active, onSelect, counts }: CategoryPillsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="group"
      aria-label="Filtrar por categoría"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(cat)}
            className={[
              'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5',
              'text-xs font-semibold transition-all duration-150 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leather/40',
              isActive
                ? 'bg-leather text-white shadow-md'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-leather/30 hover:text-leather',
            ].join(' ')}
          >
            {cat}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums',
                isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500',
              ].join(' ')}
            >
              {counts[cat]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
