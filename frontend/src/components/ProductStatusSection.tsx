/**
 * ProductStatusSection.tsx
 *
 * Section 4 of the Product Form Modal: Estado (Active for POS sales).
 */

interface ProductStatusSectionProps {
  isActive: boolean;
  onToggleActive: (val: boolean) => void;
}

export default function ProductStatusSection({
  isActive,
  onToggleActive,
}: ProductStatusSectionProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-leather">4. Estado</p>
        <p className="text-xs font-medium text-stone-700">Habilitar para venta en POS</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => onToggleActive(e.target.checked)}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-stone-300 peer-checked:bg-emerald-600 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}
