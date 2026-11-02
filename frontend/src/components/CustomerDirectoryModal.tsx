/**
 * CustomerDirectoryModal.tsx
 *
 * Read-only directory of registered customers with contact and purchase metrics.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCustomers, type ApiCustomer } from '../services/api';

interface CustomerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDirectoryModal({ isOpen, onClose }: CustomerDirectoryModalProps) {
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    getCustomers()
      .then(setCustomers)
      .catch(() => setError('No se pudo cargar el directorio de clientes.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
      <div className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl" style={{ height: '85dvh' }}>
        <header className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Directorio de Clientes</h2>
            <p className="text-xs text-stone-500">Contactos y pares comprados</p>
          </div>
          <button type="button" aria-label="Cerrar directorio" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">✕</button>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-xs font-semibold text-stone-500">Cargando clientes...</p>
          ) : customers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl">👥</p>
              <p className="mt-2 text-xs text-stone-500">Aún no hay clientes registrados.</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-900">{customer.name}</p>
                  <p className="truncate text-xs text-stone-400">{customer.phone || 'Sin teléfono'}</p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                  {customer.totalPurchases ?? 0} pares
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
