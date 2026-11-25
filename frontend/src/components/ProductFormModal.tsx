import SheetDialog from './SheetDialog';
/**
 * ProductFormModal.tsx
 *
 * Dual-mode modal for Creating and Editing shoe catalogue entries.
 * Manages full form state, color-specific variant matrix, and pinned action footer.
 */

import { useRef, useState } from 'react';
import type { Shoe, Category, SizeEntry, ColorVariant } from '../data/mockShoes';
import ProductGeneralSection from './ProductGeneralSection';
import ProductColorsSection from './ProductColorsSection';
import ProductSizesSection from './ProductSizesSection';
import ProductStatusSection from './ProductStatusSection';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoeToEdit: Shoe | null;
  onSave: (savedShoe: Shoe) => Promise<void>;
}

export default function ProductFormModal({ isOpen, onClose, shoeToEdit, onSave }: ProductFormModalProps) {
  const isEditMode = Boolean(shoeToEdit);
  const initial = shoeToEdit?.colors?.length ? shoeToEdit.colors : [{
    color: shoeToEdit?.color ?? 'Marr\u00f3n Caramelo', sizes: shoeToEdit?.sizes ?? [],
  }];
  const [name, setName] = useState(shoeToEdit?.name ?? '');
  const [subtitle, setSubtitle] = useState(shoeToEdit?.subtitle ?? '');
  const [brand, setBrand] = useState(shoeToEdit?.brand ?? 'Alva');
  const [category, setCategory] = useState<Category>(shoeToEdit?.category ?? 'Casual');
  const [price, setPrice] = useState(shoeToEdit?.price ?? 120);
  const [colors, setColors] = useState(initial.map(group => group.color));
  const [activeColorTab, setActiveColorTab] = useState(initial[0].color);
  const [variantsByColor, setVariantsByColor] = useState<Record<string, SizeEntry[]>>(
    Object.fromEntries(initial.map(group => [group.color, group.sizes])));
  const [isActive, setIsActive] = useState(shoeToEdit?.status !== 'INACTIVE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  if (!isOpen) return null;

  const handleAddColor = (newCol: string) => {
    if (colors.includes(newCol)) return;
    setColors((prev) => [...prev, newCol]);
    const current = variantsByColor[activeColorTab] || [];
    setVariantsByColor((prev) => ({ ...prev, [newCol]: current.map((s) => ({ size: s.size, stock: 0, price: s.price ?? price })) }));
    setActiveColorTab(newCol);
  };

  const handleRemoveColor = (colToRemove: string) => {
    if (variantsByColor[colToRemove]?.some(entry => entry.variantId)) {
      setError('Conserva los colores registrados para mantener el historial.'); return;
    }
    const next = colors.filter((c) => c !== colToRemove);
    setColors(next);
    if (activeColorTab === colToRemove && next.length > 0) setActiveColorTab(next[0]);
    setVariantsByColor((prev) => { const copy = { ...prev }; delete copy[colToRemove]; return copy; });
  };

  const handleToggleSize = (sizeNum: number) => {
    setVariantsByColor((prev) => {
      const list = prev[activeColorTab] || [];
      if (list.some(entry => entry.size === sizeNum && entry.variantId)) return prev;
      const next = list.some((s) => s.size === sizeNum) ? list.filter((s) => s.size !== sizeNum) : [...list, { size: sizeNum, stock: 0, price }];
      return { ...prev, [activeColorTab]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || !name.trim()) return;
    const entries = colors.flatMap(color => variantsByColor[color] ?? []);
    if (!entries.length || entries.some(entry => !Number.isInteger(entry.stock) || entry.stock < 0
      || !Number.isFinite(entry.price ?? price) || (entry.price ?? price) <= 0
      || Math.abs((entry.price ?? price) * 100 - Math.round((entry.price ?? price) * 100)) > 0.000001)) {
      setError('Agrega tallas con stock entero y precios positivos de hasta dos decimales.'); return;
    }
    const finalColors: ColorVariant[] = colors.map((col, idx) => ({
      color: col,
      swatchHex: shoeToEdit?.colors?.find((c) => c.color === col)?.swatchHex || (idx === 0 ? '#8B5E3C' : '#4A2E1A'),
      sizes: variantsByColor[col] || [{ size: 38, stock: 0, price }],
    }));
    const primary = colors[0] || 'Marrón Caramelo';
    submitting.current = true; setSaving(true); setError('');
    try {
      await onSave({
        id: shoeToEdit?.id ?? '',
        name: name.trim(), subtitle: subtitle.trim(), brand, category, price,
        color: primary, swatchHex: shoeToEdit?.swatchHex || '#8B5E3C',
        sizes: variantsByColor[primary] || finalColors[0]?.sizes || [],
        colors: finalColors, status: isActive ? 'ACTIVE' : 'INACTIVE',
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Revisa el resultado antes de reintentar.');
    } finally { submitting.current = false; setSaving(false); }
  };

  return (
    <SheetDialog label={isEditMode ? 'Editar calzado' : 'Nuevo calzado'} onClose={onClose} locked={saving}>
      <div
        className="w-full max-w-md h-[88vh] max-h-[88vh] bg-cream rounded-t-3xl flex flex-col overflow-hidden shadow-2xl relative"
        style={{ height: '88dvh', maxHeight: '88dvh' }}
      >
        <header className="shrink-0 p-4 border-b border-stone-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{isEditMode ? 'Editar Calzado' : 'Nuevo Calzado'}</h2>
            <p className="text-xs text-stone-500">{isEditMode ? 'Actualizar precios, colores y datos' : 'Registrar modelo en catálogo'}</p>
          </div>
          <button type="button" disabled={saving} aria-label="Cerrar modal" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <fieldset disabled={saving} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            {shoeToEdit && <p className="text-sm text-stone-700">Conserva colores y tallas registrados. Cambia sus existencias en Ajuste de Existencias.</p>}
            <ProductGeneralSection
              name={name} onNameChange={setName} subtitle={subtitle} onSubtitleChange={setSubtitle}
              brand={brand} onBrandChange={setBrand} category={category} onCategoryChange={setCategory}
              price={price} onPriceChange={setPrice}
            />
            <ProductColorsSection colors={colors} onAddColor={handleAddColor} onRemoveColor={handleRemoveColor} />
            <ProductSizesSection
              colors={colors} activeColorTab={activeColorTab} onSelectColorTab={setActiveColorTab}
              sizes={variantsByColor[activeColorTab] || []} basePrice={price} onToggleSize={handleToggleSize}
              onStockChange={(sz, stk) => setVariantsByColor((p) => ({ ...p, [activeColorTab]: (p[activeColorTab] || []).map((s) => s.size === sz ? { ...s, stock: stk } : s) }))}
              onPriceChange={(sz, prc) => setVariantsByColor((p) => ({ ...p, [activeColorTab]: (p[activeColorTab] || []).map((s) => s.size === sz ? { ...s, price: prc } : s) }))}
            />
            <ProductStatusSection isActive={isActive} onToggleActive={setIsActive} />
          </fieldset>

          <div className="shrink-0 p-4 bg-white border-t border-stone-200 flex gap-3 z-30">
            <button type="button" disabled={saving} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50">Cancelar</button>
            <button type="submit" disabled={saving || !name.trim() || price <= 0} className="flex-2 py-3 px-4 rounded-xl bg-leather hover:bg-leather-dark text-white font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar Calzado'}
            </button>
          </div>
        </form>
      </div>
    </SheetDialog>
  );
}
