/**
 * ProductFormModal.tsx
 *
 * Dual-mode modal for Creating and Editing shoe catalogue entries.
 * Manages full form state, color-specific variant matrix, and pinned action footer.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Shoe, Category, SizeEntry, ColorVariant } from '../data/mockShoes';
import ProductGeneralSection from './ProductGeneralSection';
import ProductColorsSection from './ProductColorsSection';
import ProductSizesSection from './ProductSizesSection';
import ProductStatusSection from './ProductStatusSection';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoeToEdit: Shoe | null;
  onSave: (savedShoe: Shoe) => void;
}

export default function ProductFormModal({ isOpen, onClose, shoeToEdit, onSave }: ProductFormModalProps) {
  const isEditMode = Boolean(shoeToEdit);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [brand, setBrand] = useState('Alva');
  const [category, setCategory] = useState<Category>('Casual');
  const [price, setPrice] = useState(120);
  const [colors, setColors] = useState<string[]>(['Marrón Caramelo']);
  const [activeColorTab, setActiveColorTab] = useState('Marrón Caramelo');
  const [variantsByColor, setVariantsByColor] = useState<Record<string, SizeEntry[]>>({});
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (shoeToEdit) {
      setName(shoeToEdit.name); setSubtitle(shoeToEdit.subtitle || ''); setBrand(shoeToEdit.brand);
      setCategory(shoeToEdit.category); setPrice(shoeToEdit.price);
      const cols = shoeToEdit.colors?.map((c) => c.color) || [shoeToEdit.color];
      setColors(cols); setActiveColorTab(cols[0] || 'Marrón Caramelo');
      const vbc: Record<string, SizeEntry[]> = {};
      if (shoeToEdit.colors?.length) {
        shoeToEdit.colors.forEach((c) => { vbc[c.color] = c.sizes.map((s) => ({ ...s, price: s.price ?? shoeToEdit.price })); });
      } else {
        vbc[cols[0]] = (shoeToEdit.sizes || []).map((s) => ({ ...s, price: s.price ?? shoeToEdit.price }));
      }
      setVariantsByColor(vbc); setIsActive(shoeToEdit.status !== 'INACTIVE');
    } else {
      setName(''); setSubtitle(''); setBrand('Alva'); setCategory('Casual'); setPrice(120);
      setColors(['Marrón Caramelo']); setActiveColorTab('Marrón Caramelo');
      setVariantsByColor({ 'Marrón Caramelo': [{ size: 38, stock: 4, price: 120 }, { size: 39, stock: 2, price: 120 }, { size: 40, stock: 0, price: 120 }, { size: 41, stock: 5, price: 120 }] });
      setIsActive(true);
    }
  }, [isOpen, shoeToEdit]);

  if (!isOpen) return null;

  const handleAddColor = (newCol: string) => {
    setColors((prev) => [...prev, newCol]);
    const current = variantsByColor[activeColorTab] || [];
    setVariantsByColor((prev) => ({ ...prev, [newCol]: current.map((s) => ({ ...s, stock: 0, price: s.price ?? price })) }));
    setActiveColorTab(newCol);
  };

  const handleRemoveColor = (colToRemove: string) => {
    const next = colors.filter((c) => c !== colToRemove);
    setColors(next);
    if (activeColorTab === colToRemove && next.length > 0) setActiveColorTab(next[0]);
    setVariantsByColor((prev) => { const copy = { ...prev }; delete copy[colToRemove]; return copy; });
  };

  const handleToggleSize = (sizeNum: number) => {
    setVariantsByColor((prev) => {
      const list = prev[activeColorTab] || [];
      const next = list.some((s) => s.size === sizeNum) ? list.filter((s) => s.size !== sizeNum) : [...list, { size: sizeNum, stock: 0, price }];
      return { ...prev, [activeColorTab]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalColors: ColorVariant[] = colors.map((col, idx) => ({
      color: col,
      swatchHex: shoeToEdit?.colors?.find((c) => c.color === col)?.swatchHex || (idx === 0 ? '#8B5E3C' : '#4A2E1A'),
      sizes: variantsByColor[col] || [{ size: 38, stock: 0, price }],
    }));
    const primary = colors[0] || 'Marrón Caramelo';
    onSave({
      id: shoeToEdit?.id || `shoe-${Date.now().toString(36)}`,
      name: name.trim(), subtitle: subtitle.trim(), brand, category, price: Math.max(0, price),
      color: primary, swatchHex: shoeToEdit?.swatchHex || '#8B5E3C',
      refCode: shoeToEdit?.refCode || `${brand.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      sizes: variantsByColor[primary] || finalColors[0]?.sizes || [],
      colors: finalColors, status: isActive ? 'ACTIVE' : 'INACTIVE',
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end items-center">
      <div
        className="w-full max-w-md h-[88vh] max-h-[88vh] bg-cream rounded-t-3xl flex flex-col overflow-hidden shadow-2xl relative"
        style={{ height: '88dvh', maxHeight: '88dvh' }}
      >
        <header className="shrink-0 p-4 border-b border-stone-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{isEditMode ? 'Editar Calzado' : 'Nuevo Calzado'}</h2>
            <p className="text-xs text-stone-500">{isEditMode ? 'Actualizar precios, colores y datos' : 'Registrar modelo en catálogo'}</p>
          </div>
          <button type="button" aria-label="Cerrar modal" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">✕</button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
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
          </div>

          <div className="shrink-0 p-4 bg-white border-t border-stone-200 flex gap-3 z-30">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50">Cancelar</button>
            <button type="submit" disabled={!name.trim() || price <= 0} className="flex-2 py-3 px-4 rounded-xl bg-leather hover:bg-leather-dark text-white font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
              Guardar Calzado
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
