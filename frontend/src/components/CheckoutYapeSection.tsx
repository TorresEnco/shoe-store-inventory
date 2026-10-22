/**
 * CheckoutYapeSection.tsx
 *
 * Compact Yape / Plin panel with a clean 140px QR code, copyable phone number,
 * and registered titular name.
 */

import { useState } from 'react';

interface CheckoutYapeSectionProps {
  total: number;
}

export default function CheckoutYapeSection({ total }: CheckoutYapeSectionProps) {
  const [copied, setCopied] = useState(false);
  const phoneNumber = '987 654 321';

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-3.5 border border-stone-200 shadow-xs">
      <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-0.5 text-[11px] font-semibold text-stone-700">
        <span className="h-2 w-2 rounded-full bg-amber-accent" />
        Escanea con App Yape o Plin
      </span>

      {/* Compact QR Code Container (max width 160px) */}
      <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-cream border border-stone-200 max-w-[160px] w-full">
        <svg
          viewBox="0 0 160 160"
          className="h-28 w-28 text-leather"
          fill="currentColor"
          aria-label="Código QR Yape Plin"
        >
          {/* Outer frame & finder patterns */}
          <rect x="10" y="10" width="40" height="40" rx="8" fill="currentColor" />
          <rect x="18" y="18" width="24" height="24" rx="4" fill="#FAF8F5" />
          <rect x="24" y="24" width="12" height="12" rx="2" fill="currentColor" />

          <rect x="110" y="10" width="40" height="40" rx="8" fill="currentColor" />
          <rect x="118" y="18" width="24" height="24" rx="4" fill="#FAF8F5" />
          <rect x="124" y="24" width="12" height="12" rx="2" fill="currentColor" />

          <rect x="10" y="110" width="40" height="40" rx="8" fill="currentColor" />
          <rect x="18" y="118" width="24" height="24" rx="4" fill="#FAF8F5" />
          <rect x="24" y="124" width="12" height="12" rx="2" fill="currentColor" />

          {/* Data modules */}
          <rect x="60" y="15" width="10" height="10" rx="2" />
          <rect x="75" y="20" width="10" height="15" rx="2" />
          <rect x="90" y="15" width="10" height="10" rx="2" />
          <rect x="60" y="40" width="25" height="10" rx="2" />
          <rect x="20" y="65" width="15" height="10" rx="2" />
          <rect x="40" y="65" width="10" height="25" rx="2" />
          <rect x="115" y="65" width="30" height="10" rx="2" />
          <rect x="125" y="85" width="15" height="20" rx="2" />
          <rect x="60" y="115" width="15" height="10" rx="2" />
          <rect x="85" y="110" width="15" height="20" rx="2" />
          <rect x="110" y="130" width="20" height="15" rx="2" />
          <rect x="135" y="125" width="15" height="15" rx="2" />

          {/* Center verification badge */}
          <circle cx="80" cy="80" r="16" fill="#5C3D28" />
          <circle cx="80" cy="80" r="12" fill="#FAF8F5" />
          <path
            d="M75 80l3.5 3.5 7-7"
            fill="none"
            stroke="#5C3D28"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="mt-1 text-[10px] font-medium text-stone-500">
          Monto: S/. {total.toFixed(2)}
        </span>
      </div>

      {/* Phone number & Titular */}
      <div className="w-full rounded-xl bg-stone-50 p-2.5 text-left border border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              Número de Celular
            </span>
            <p className="text-sm font-bold text-stone-900 tracking-wide">{phoneNumber}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyPhone}
            className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold text-stone-700 shadow-2xs transition-all active:scale-95 hover:bg-stone-50"
          >
            📋 {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-stone-200/80">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
            Titular Registrado
          </span>
          <p className="text-xs font-bold text-stone-800">Comercial Torres E.I.R.L.</p>
        </div>
      </div>
    </div>
  );
}
