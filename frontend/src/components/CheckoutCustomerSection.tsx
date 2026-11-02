/**
 * CheckoutCustomerSection.tsx
 *
 * Customer name/phone field with debounced POS autocomplete suggestions.
 */

import { useEffect, useState } from 'react';
import { searchCustomers, type ApiCustomer } from '../services/api';

interface CheckoutCustomerSectionProps {
  name: string;
  phone: string;
  onChange: (name: string, phone: string) => void;
}

export default function CheckoutCustomerSection({ name, phone, onChange }: CheckoutCustomerSectionProps) {
  const [suggestions, setSuggestions] = useState<ApiCustomer[]>([]);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const query = name.trim();
    if (isSelected || query.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      searchCustomers(query)
        .then((results) => {
          if (!cancelled) setSuggestions(results.slice(0, 5));
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, isSelected]);

  const selectCustomer = (customer: ApiCustomer) => {
    setIsSelected(true);
    onChange(customer.name, customer.phone ?? '');
    setSuggestions([]);
  };

  return (
    <div>
      <label htmlFor="customer-search" className="text-xs font-bold text-stone-700 block mb-1">
        Datos del Cliente
      </label>
      <input
        id="customer-search"
        type="text"
        value={name}
        onChange={(e) => {
          setIsSelected(false);
          onChange(e.target.value, '');
        }}
        placeholder="Nombre o Teléfono (opcional)"
        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 px-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-leather"
      />

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => selectCustomer(customer)}
              className="rounded-full border border-leather/20 bg-white px-3 py-1 text-[11px] font-semibold text-leather shadow-xs transition-colors hover:bg-leather/5 active:scale-95"
            >
              {customer.name}
              {customer.phone ? ` · ${customer.phone}` : ''}
            </button>
          ))}
        </div>
      )}

      {phone && (
        <p className="mt-1.5 text-[10px] font-semibold text-emerald-700">
          Teléfono registrado: {phone}
        </p>
      )}
      <p className="mt-1 text-[10px] text-stone-400">Por defecto: Público General</p>
    </div>
  );
}
