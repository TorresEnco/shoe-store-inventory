/**
 * LoginView.tsx
 *
 * Premium full-screen login for Comercial Torres.
 * Collects username and password with a show/hide toggle, then delegates to the parent.
 */

import { useState, type FormEvent } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-6 py-10">
      {/* ── Brand medallion ── */}
      <div className="w-20 h-20 rounded-full bg-leather text-white flex items-center justify-center shadow-lg border-2 border-dashed border-amber-accent/40 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9" aria-hidden="true">
          <path d="M4 10l1.5-5h13L20 10" />
          <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z" />
          <path d="M9 20v-5h6v5" />
          <path d="M4 10c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
        </svg>
      </div>

      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-4 text-center">
        Comercial Torres
      </h1>
      <p className="text-sm font-medium text-stone-500 mt-1 text-center">
        Control de Inventario
      </p>

      {/* ── Login card ── */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mt-8 bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4"
      >
        <div>
          <label htmlFor="username" className="text-xs font-bold text-stone-700 tracking-wide">
            Usuario
          </label>
          <div className="relative mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="carlos_torres"
              className="w-full bg-[#FAF4EE] border-none rounded-2xl pl-11 pr-4 py-3.5 text-sm text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-leather/30 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-bold text-stone-700 tracking-wide">
            Contraseña
          </label>
          <div className="relative mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="1.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Introduce tu contraseña"
              className="w-full bg-[#FAF4EE] border-none rounded-2xl pl-11 pr-12 py-3.5 text-sm text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-leather/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-leather transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
                {!showPassword && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-leather hover:bg-leather-dark text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Iniciar Sesión ➔
        </button>
      </form>

      {/* ── Footer ── */}
      <p className="text-xs text-stone-400 text-center mt-6">
        Comercial Torres v1.0 · Sistema interno
      </p>
    </div>
  );
}
