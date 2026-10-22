/**
 * ProductGeneralSection.tsx
 *
 * Section 1 of the Product Form Modal: Datos Generales.
 * Handles model name, short description, brand, category, and catalog price.
 */

import type { Category } from '../data/mockShoes';

export const BRANDS = ['Alva', 'Bruma', 'Andino', 'Calimod', 'Viale'];
export const CATEGORIES_LIST: Category[] = ['Casual', 'Zapatillas', 'Formal', 'Botines'];

interface ProductGeneralSectionProps {
  name: string;
  onNameChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  brand: string;
  onBrandChange: (val: string) => void;
  category: Category;
  onCategoryChange: (val: Category) => void;
  price: number;
  onPriceChange: (val: number) => void;
}

export default function ProductGeneralSection({
  name,
  onNameChange,
  subtitle,
  onSubtitleChange,
  brand,
  onBrandChange,
  category,
  onCategoryChange,
  price,
  onPriceChange,
}: ProductGeneralSectionProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-leather">
        1. Datos Generales
      </h3>

      <div className="flex flex-col gap-1">
        <label htmlFor="model-name" className="text-xs font-semibold text-stone-700">
          Nombre del Modelo *
        </label>
        <input
          id="model-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej. Mocasín Artesanal ALV-201"
          className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="model-subtitle" className="text-xs font-semibold text-stone-700">
          Descripción Corta
        </label>
        <input
          id="model-subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Ej. Calzados hechos a mano en cuero vacuno"
          className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="model-brand" className="text-xs font-semibold text-stone-700">
            Marca
          </label>
          <select
            id="model-brand"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="model-category" className="text-xs font-semibold text-stone-700">
            Categoría
          </label>
          <select
            id="model-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
            className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
          >
            {CATEGORIES_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="model-price" className="text-xs font-semibold text-stone-700">
          Precio de Catálogo (S/.) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
            S/.
          </span>
          <input
            id="model-price"
            type="number"
            min={0}
            step="0.5"
            value={price === 0 ? '' : price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-3 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
          />
        </div>
      </div>
    </div>
  );
}
