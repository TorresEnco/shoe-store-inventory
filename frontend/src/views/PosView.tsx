/**
 * PosView.tsx
 *
 * "Venta Rápida" screen — main POS view for Comercial Torres.
 * Manages search, category filtering, cart state, quantity drawer, and checkout modal.
 */

import { useState } from 'react';
import type { Shoe, SizeEntry } from '../data/mockShoes';
import type { CartItem } from '../types/cart';
import { cartKey } from '../types/cart';
import ShoeCard from '../components/ShoeCard';
import QuantityDrawer, { type DrawerVariant } from '../components/QuantityDrawer';
import FloatingOrderBar from '../components/FloatingOrderBar';
import CheckoutModal from '../components/CheckoutModal';
import SearchBar from '../components/SearchBar';
import CategoryPills from '../components/CategoryPills';
import { CATEGORIES, type FilterCategory } from '../data/categoryFilters';

interface PosViewProps {
  shoes?: Shoe[];
  isCheckoutOpen?: boolean;
  onCheckoutOpenChange?: (open: boolean) => void;
  onSaleCompleted?: () => void | Promise<void>;
}

export default function PosView({
  shoes,
  isCheckoutOpen: externalIsCheckoutOpen,
  onCheckoutOpenChange,
  onSaleCompleted,
}: PosViewProps) {
  const shoeList = (shoes ?? []).filter(shoe => shoe.status !== 'INACTIVE');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('Todas');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [drawerVariant, setDrawerVariant] = useState<DrawerVariant | null>(null);
  const [internalCheckoutOpen, setInternalCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCheckoutOpen = externalIsCheckoutOpen ?? internalCheckoutOpen;
  const setCheckoutOpen = (open: boolean) => {
    if (onCheckoutOpenChange) onCheckoutOpenChange(open);
    else setInternalCheckoutOpen(open);
  };

  const cartArray = [...cart.values()];
  const getCartQty = (variantId: number): number =>
    cart.get(cartKey(variantId))?.quantity ?? 0;

  const openDrawer = (shoe: Shoe, sizeEntry: SizeEntry, color: string) => {
    if (!sizeEntry.variantId || sizeEntry.stock <= 0) return;
    const existing = cart.get(cartKey(sizeEntry.variantId));
    const price = sizeEntry.price ?? shoe.price;
    setDrawerVariant({
      shoeId: shoe.id,
      variantId: sizeEntry.variantId ?? 0,
      name: shoe.name,
      brand: shoe.brand,
      color,
      size: sizeEntry.size,
      catalogPrice: price,
      maxStock: sizeEntry.stock,
      existingQty: getCartQty(sizeEntry.variantId),
      existingUnitPrice: existing?.unitPrice ?? price,
    });
  };

  const handleConfirm = (item: CartItem) => {
    const key = cartKey(item.variantId);
    setCart((prev) => {
      const next = new Map(prev);
      if (item.quantity <= 0) next.delete(key);
      else next.set(key, item);
      return next;
    });
    setDrawerVariant(null);
  };

  const handleRemoveItem = (variantId: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(cartKey(variantId));
      if (next.size === 0) setCheckoutOpen(false);
      return next;
    });
  };

  const handleConfirmSale = () => {
    setCart(new Map());
    setCheckoutOpen(false);
    setToastMessage('¡Venta registrada con éxito!');
    setTimeout(() => setToastMessage(null), 3500);
    void onSaleCompleted?.();
  };

  const normalised = query.trim().toLowerCase();
  const filtered = shoeList.filter((shoe) => {
    const passesCategory = category === 'Todas' || shoe.category === category;
    const passesText = !normalised || shoe.name.toLowerCase().includes(normalised) || shoe.brand.toLowerCase().includes(normalised);
    return passesCategory && passesText;
  });

  const counts = CATEGORIES.reduce<Record<FilterCategory, number>>((acc, cat) => {
    acc[cat] = shoeList.filter((shoe) => {
      const passesText = !normalised || shoe.name.toLowerCase().includes(normalised) || shoe.brand.toLowerCase().includes(normalised);
      return passesText && (cat === 'Todas' || shoe.category === cat);
    }).length;
    return acc;
  }, {} as Record<FilterCategory, number>);

  return (
    <>
      {toastMessage && (
        <div className="fixed top-16 left-0 right-0 z-50 max-w-md mx-auto px-4 animate-bounce">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-white shadow-xl">
            <span className="text-xl">✅</span>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-4 px-4 py-4 transition-all duration-300 ${cartArray.length > 0 ? 'pb-36' : 'pb-6'}`}>
        <div>
          <h2 className="text-lg font-bold text-stone-800">Venta Rápida</h2>
          <p className="text-xs text-stone-400">
            {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            {cartArray.length > 0 && <span className="ml-2 font-semibold text-leather">· {cartArray.length} en venta</span>}
          </p>
        </div>

        <SearchBar value={query} onChange={setQuery} />
        <CategoryPills active={category} onSelect={setCategory} counts={counts} />

        {filtered.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label="Catálogo de calzado">
            {filtered.map((shoe) => (
              <li key={shoe.id}>
                <ShoeCard
                  shoe={shoe}
                  selectedVariantId={drawerVariant?.variantId ?? null}
                  onSizeSelect={(entry, color) => openDrawer(shoe, entry, color)}
                  cartQtyForVariant={getCartQty}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 py-12 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-semibold text-stone-500">Sin resultados para <span className="text-leather">"{query}"</span></p>
            <button
              type="button"
              onClick={() => { setQuery(''); setCategory('Todas'); }}
              className="rounded-full bg-leather/10 px-4 py-1.5 text-xs font-semibold text-leather hover:bg-leather/20"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {drawerVariant && <QuantityDrawer key={drawerVariant.variantId} variant={drawerVariant}
        onConfirm={handleConfirm} onCancel={() => setDrawerVariant(null)} />}
      <FloatingOrderBar cart={cartArray} onOpenCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cartArray}
        onClose={() => setCheckoutOpen(false)}
        onRemoveItem={handleRemoveItem}
        onConfirmSale={handleConfirmSale}
      />
    </>
  );
}
