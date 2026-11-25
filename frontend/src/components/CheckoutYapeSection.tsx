export default function CheckoutYapeSection() {
  return (
    <details className="rounded-xl border border-stone-200 bg-white text-stone-700">
      <summary className="min-h-11 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-leather">
        Yape / Plin · QR de muestra
      </summary>
      <div className="flex flex-col items-center gap-2 px-4 pb-4 text-center">
        <p className="text-sm">Cobro por Yape o Plin pendiente de habilitar.</p>
        <svg
          viewBox="0 0 160 160"
          className="h-28 w-28 text-leather"
          fill="currentColor"
          aria-hidden="true"
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
      </div>
    </details>
  );
}
