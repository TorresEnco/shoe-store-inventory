/**
 * InventoryView.tsx
 *
 * "Ajuste de Existencias" view for Comercial Torres.
 * Quick stock reception, delta tracking, and product creation / editing modal.
 */

import { useState } from 'react';
import type { Shoe, SizeEntry } from '../data/mockShoes';
import InventoryHeader from '../components/InventoryHeader';
import ShoeColorCard from '../components/ShoeColorCard';
import SizeRestockRow from '../components/SizeRestockRow';
import ReceptionSummary from '../components/ReceptionSummary';
import ProductFormModal from '../components/ProductFormModal';

import { updateStock, saveCatalog } from '../services/api';
import { mapProductToShoe } from '../services/productMapper';

interface InventoryViewProps {
  reload: () => Promise<void>;
  admin: boolean;
  shoes: Shoe[];
  onSaveStock: (updatedShoes: Shoe[]) => void;
}

export default function InventoryView({ shoes, onSaveStock, admin, reload }: InventoryViewProps) {
  const [selectedShoeId, setSelectedShoeId] = useState<string>(shoes[0]?.id ?? '');
  const [activeColor, setActiveColor] = useState<string>(shoes[0]?.color ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [stockDraft, setStockDraft] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shoeToEdit, setShoeToEdit] = useState<Shoe | null>(null);

  const selectedShoe = shoes.find((s) => s.id === selectedShoeId) || shoes[0];
  const activeVariant = selectedShoe?.colors?.find((c) => c.color === activeColor) || {
    color: selectedShoe?.color ?? '',
    sizes: selectedShoe?.sizes ?? [],
  };
  const currentSizes: SizeEntry[] = [...activeVariant.sizes].sort((a, b) => Number(a.size) - Number(b.size));

  const getStockCount = (size: number, prevStock: number): number => {
    const key = `${selectedShoe.id}::${activeColor}::${size}`;
    return stockDraft[key] !== undefined ? stockDraft[key] : prevStock;
  };

  const handleSizeChange = (size: number, newCount: number) => {
    setStockDraft((prev) => ({ ...prev, [`${selectedShoe.id}::${activeColor}::${size}`]: Math.max(0, newCount) }));
  };

  let changedCount = 0;
  let totalDiff = 0;
  currentSizes.forEach((entry) => {
    const diff = getStockCount(entry.size, entry.stock) - entry.stock;
    if (diff !== 0) { changedCount += 1; totalDiff += diff; }
  });

  const handleDiscard = () => {
    const updated = { ...stockDraft };
    currentSizes.forEach((entry) => delete updated[`${selectedShoe.id}::${activeColor}::${entry.size}`]);
    setStockDraft(updated);
  };

  const handleSave = async () => {
    if (saving || !changedCount) return;
    setSaving(true);
    try {
      for (const entry of currentSizes) {
        const delta = getStockCount(entry.size, entry.stock) - entry.stock;
        if (!delta) continue;
        if (!entry.variantId) throw new Error('Variante sin registrar.');
        await updateStock(entry.variantId, delta);
      }
      setToastMessage('Ajustes registrados.');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Error al registrar el ajuste.';
      setToastMessage(message + ' Revisa las existencias antes de continuar.');
    } finally {
      setStockDraft({});
      await reload();
      setSaving(false);
    }
  };

  const handleSaveProduct = async (draft: Shoe) => {
    const exists = Boolean(shoeToEdit);
    const result = await saveCatalog({
      name: draft.name, description: draft.subtitle ?? '', brand: draft.brand,
      category: draft.category, status: draft.status !== 'INACTIVE',
      variants: (draft.colors ?? []).flatMap(group => group.sizes.map(entry => ({
        id: entry.variantId, color: group.color, size: entry.size,
        catalogPrice: entry.price ?? draft.price, stock: entry.stock,
      }))),
    }, shoeToEdit ? Number(shoeToEdit.id) : undefined);
    const prod = mapProductToShoe(result);
    onSaveStock(exists ? shoes.map((s) => (s.id === prod.id ? prod : s)) : [prod, ...shoes]);
    setSelectedShoeId(prod.id);
    setActiveColor(prod.color);
    setToastMessage(exists ? '¡Calzado actualizado correctamente!' : '¡Nuevo calzado agregado al catálogo!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-16 left-0 right-0 z-50 mx-auto max-w-md px-4 animate-bounce">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-white shadow-xl">
            <span role="status" className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 px-4 py-4 pb-44">
        <InventoryHeader
          searchQuery={searchQuery} onSearchChange={setSearchQuery} shoes={shoes}
          onSelectShoe={(shoe) => { setSelectedShoeId(shoe.id); setActiveColor(shoe.color); }}
          onNewProduct={admin ? () => { setShoeToEdit(null); setIsModalOpen(true); } : undefined}
        />

        {selectedShoe && (
          <ShoeColorCard
            shoe={selectedShoe} activeColor={activeColor} onSelectColor={setActiveColor}
            onEdit={admin ? () => { setShoeToEdit(selectedShoe); setIsModalOpen(true); } : undefined}
          />
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Existencias por Talla</h3>
              <p className="text-xs text-stone-400">{activeColor}</p>
            </div>
            {totalDiff !== 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100/90 px-2.5 py-1 text-xs font-semibold text-amber-900">
                📦 Recepción activa: {totalDiff > 0 ? `+${totalDiff}` : totalDiff} pares
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {currentSizes.map((entry) => (
              <SizeRestockRow
                key={entry.size} size={entry.size} previousStock={entry.stock}
                count={getStockCount(entry.size, entry.stock)}
                onChange={(newCount) => handleSizeChange(entry.size, newCount)}
              />
            ))}
          </div>
        </div>

        <fieldset disabled={saving}><ReceptionSummary changedCount={changedCount} totalDiff={totalDiff} onSave={handleSave} onDiscard={handleDiscard} /></fieldset>
      </div>

      <ProductFormModal
        key={isModalOpen ? shoeToEdit?.id ?? 'new' : 'closed'}
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        shoeToEdit={shoeToEdit} onSave={handleSaveProduct}
      />
    </>
  );
}
