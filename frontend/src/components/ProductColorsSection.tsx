/**
 * ProductColorsSection.tsx
 *
 * Section 2 of the Product Form Modal: Colores del Modelo.
 * Features autocomplete suggestions, title-case sanitization, and duplicate prevention.
 */

import { useState } from 'react';

const COMMON_COLORS = ['Negro', 'Café Oscuro', 'Marrón Caramelo', 'Blanco Tiza', 'Azul Marino', 'Miel', 'Vino / Guinda', 'Beige'];

interface ProductColorsSectionProps {
  colors: string[];
  onAddColor: (newColor: string) => void;
  onRemoveColor: (colorToRemove: string) => void;
}

export default function ProductColorsSection({ colors, onAddColor, onRemoveColor }: ProductColorsSectionProps) {
  const [inputVal, setInputVal] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const normalizeColorName = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) return '';
    const match = COMMON_COLORS.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    return match || trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const handleAdd = (rawName?: string) => {
    const toAdd = normalizeColorName(rawName ?? inputVal);
    if (!toAdd) return;
    if (colors.some((c) => c.toLowerCase() === toAdd.toLowerCase())) {
      setDuplicateError('Este color ya está agregado.');
      return;
    }
    setDuplicateError(null);
    onAddColor(toAdd);
    setInputVal('');
  };

  const trimmed = inputVal.trim().toLowerCase();
  const suggestions = isInputFocused
    ? COMMON_COLORS.filter(
        (c) =>
          (!trimmed || c.toLowerCase().includes(trimmed)) &&
          !colors.some((e) => e.toLowerCase() === c.toLowerCase()),
      )
    : [];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-leather">
          2. Colores del Modelo
        </h3>
        <span className="text-[11px] font-medium text-stone-400">
          {colors.length} {colors.length === 1 ? 'color' : 'colores'}
        </span>
      </div>

      {/* Existing color chips */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <span
            key={color}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-800"
          >
            <span className="h-2 w-2 rounded-full bg-leather" aria-hidden="true" />
            {color}
            {colors.length > 1 && (
              <button
                type="button"
                aria-label={`Eliminar color ${color}`}
                onClick={() => onRemoveColor(color)}
                className="ml-1 text-stone-400 hover:text-rose-600 active:scale-95"
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input to add a new color */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (duplicateError) setDuplicateError(null);
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Nuevo color (ej. Miel, Negro)"
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:border-leather focus:bg-white focus:outline-none focus:ring-2 focus:ring-leather/20"
          />
          <button
            type="button"
            onClick={() => handleAdd()}
            disabled={!inputVal.trim()}
            className="rounded-xl bg-leather px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-leather-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Agregar Color
          </button>
        </div>

        {/* Duplicate Error Alert */}
        {duplicateError && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <span>⚠️</span> {duplicateError}
          </p>
        )}

        {/* Autocomplete Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-semibold text-stone-400">Sugerencias:</span>
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAdd(sug)}
                className="rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-200 active:scale-95 transition-all"
              >
                + {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
