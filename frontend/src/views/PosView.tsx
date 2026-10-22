/**
 * PosView.tsx
 *
 * "Venta Rápida" screen — main POS view for Comercial Torres.
 * Manages search, category filtering, cart state, quantity drawer, and checkout modal.
 */

import { useState } from 'react';
import { MOCK_SHOES } from '../data/mockShoes';
import type { CartItem } from '../types/cart';
import { cartKey } from '../types/cart';
import ShoeCard from '../components/ShoeCard';
import QuantityDrawer, { type DrawerVariant } from '../components/QuantityDrawer';
import FloatingOrderBar from '../components/FloatingOrderBar';
import CheckoutModal from '../components/CheckoutModal';
import SearchBar from '../components/SearchBar';
import CategoryPills, { CATEGORIES, type FilterCategory } from '../components/CategoryPills';

interface PosViewProps {
  isCheckoutOpen?: boolean;
  onCheckoutOpenChange?: (open: boolean) => void;
}

export default function PosView({
  isCheckoutOpen: externalIsCheckoutOpen,
  onCheckoutOpenChange,
}: PosViewProps) {
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
  const getCartQty = (shoeId: string, size: number): number =>
    cart.get(cartKey(shoeId, size))?.quantity ?? 0;

  const openDrawer = (shoeId: string, size: number) => {
    const shoe = MOCK_SHOES.find((s) => s.id === shoeId)!;
    const sizeEntry = shoe.sizes.find((se) => se.size === size)!;
    const existing = cart.get(cartKey(shoeId, size));
    setDrawerVariant({
      shoeId,
      name: shoe.name,
      brand: shoe.brand,
      color: shoe.color,
      size,
      catalogPrice: shoe.price,
      maxStock: sizeEntry.stock,
      existingQty: getCartQty(shoeId, size),
      existingUnitPrice: existing?.unitPrice ?? shoe.price,
    });
  };

  const handleConfirm = (item: CartItem) => {
    const key = cartKey(item.shoeId, item.size);
    setCart((prev) => {
      const next = new Map(prev);
      if (item.quantity <= 0) next.delete(key);
      else next.set(key, item);
      return next;
    });
    setDrawerVariant(null);
  };

  const handleRemoveItem = (shoeId: string, size: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(cartKey(shoeId, size));
      if (next.size === 0) setCheckoutOpen(false);
      return next;
    });
  };

  const handleConfirmSale = () => {
    setCart(new Map());
    setCheckoutOpen(false);
    setToastMessage('¡Venta registrada con éxito!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const normalised = query.trim().toLowerCase();
  const filtered = MOCK_SHOES.filter((shoe) => {
    const passesCategory = category === 'Todas' || shoe.category === category;
    const passesText = !normalised || shoe.name.toLowerCase().includes(normalised) || shoe.brand.toLowerCase().includes(normalised);
    return passesCategory && passesText;
  });

  const counts = CATEGORIES.reduce<Record<FilterCategory, number>>((acc, cat) => {
    acc[cat] = MOCK_SHOES.filter((shoe) => {
      const passesText = !normalised || shoe.name.toLowerCase().includes(normalised) || shoe.brand.toLowerCase().includes(normalised);
      return passesText && (cat === 'Todas' || shoe.category === cat);
    }).length;
    return acc;
  }, { Todas: 0, Casual: 0, Zapatillas: 0, Formal: 0 });

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
                  selectedSize={drawerVariant?.shoeId === shoe.id ? drawerVariant.size : null}
                  onSizeSelect={(size) => openDrawer(shoe.id, size)}
                  cartQtyForSize={(size) => getCartQty(shoe.id, size)}
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

      <QuantityDrawer variant={drawerVariant} onConfirm={handleConfirm} onCancel={() => setDrawerVariant(null)} />
      {!isCheckoutOpen && <FloatingOrderBar cart={cartArray} onOpenCheckout={() => setCheckoutOpen(true)} />}
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
