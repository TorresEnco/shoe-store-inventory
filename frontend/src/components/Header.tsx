/**
 * Header.tsx
 *
 * Top sticky mobile bar for the Comercial Torres POS shell.
 * Displays the store brand on the left and status + user avatar on the right.
 */

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">

        {/* ── Brand (left) ── */}
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight text-leather">
            Comercial Torres
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-amber-accent">
            Control de Inventario y Ventas
          </span>
        </div>

        {/* ── Status + Avatar (right) ── */}
        <div className="flex items-center gap-3">
          {/* Open-register badge */}
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Caja Abierta
          </span>

          {/* Circular user avatar icon */}
          <button
            type="button"
            aria-label="Perfil de usuario"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-leather text-white shadow-sm transition-opacity hover:opacity-80 active:scale-95"
          >
            {/* Minimal person outline SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
