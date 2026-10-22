/**
 * InventoryHeader.tsx
 *
 * Header for the Inventory Adjustment view, containing title,
 * warehouse indicator badge, new product button, and search bar.
 */

import { useState } from 'react';
import type { Shoe } from '../data/mockShoes';

interface InventoryHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  shoes: Shoe[];
  onSelectShoe: (shoe: Shoe) => void;
  onNewProduct?: () => void;
}

export default function InventoryHeader({
  searchQuery,
  onSearchChange,
  shoes,
  onSelectShoe,
  onNewProduct,
}: InventoryHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const trimmed = searchQuery.trim().toLowerCase();
  const searchResults = trimmed
    ? shoes.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.brand.toLowerCase().includes(trimmed) ||
          (s.refCode && s.refCode.toLowerCase().includes(trimmed))
      )
    : [];

  return (
    <div className="flex flex-col gap-3">
      {/* ── Title row with Warehouse Badge & New Product button ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Ajuste de Existencias</h2>
          <p className="text-xs text-stone-500">Ingreso rápido de mercadería al recibir cajas</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-900 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" aria-hidden="true" />
            Almacén Central
          </span>
          {onNewProduct && (
            <button
              type="button"
              onClick={onNewProduct}
              className="inline-flex items-center gap-1 rounded-xl bg-leather px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-all hover:bg-leather-dark active:scale-95"
            >
              <span>+</span> Nuevo Calzado
            </button>
          )}
        </div>
      </div>

      {/* ── Quick Search Bar with Scanner ── */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Buscar calzado por modelo o marca..."
              className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 shadow-xs focus:border-leather/40 focus:outline-none focus:ring-2 focus:ring-leather/20"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => { onSearchChange(''); setIsDropdownOpen(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Escanear código de barras o QR"
            title="Escanear código de barras"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect width="8" height="8" x="8" y="8" rx="1" />
            </svg>
          </button>
        </div>

        {/* ── Search Dropdown Popover ── */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute left-0 right-12 z-20 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-stone-200 bg-white py-1 shadow-lg">
            {searchResults.map((shoe) => (
              <button
                key={shoe.id}
                type="button"
                onClick={() => {
                  onSelectShoe(shoe);
                  onSearchChange(shoe.name + (shoe.refCode ? ` ${shoe.refCode}` : ''));
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-stone-50"
              >
                <div>
                  <p className="text-xs font-bold text-stone-800">{shoe.name}</p>
                  <p className="text-[10px] text-stone-400">{shoe.brand} {shoe.refCode ? `· Ref: ${shoe.refCode}` : ''}</p>
                </div>
                <span className="text-xs font-semibold text-leather">S/. {shoe.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
