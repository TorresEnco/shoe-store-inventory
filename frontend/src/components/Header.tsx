/**
 * Header.tsx
 *
 * Top sticky mobile bar for the Comercial Torres POS shell.
 * Displays the store brand, register status, and a user profile dropdown with logout.
 */

import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '../types/user';

interface HeaderProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || avatarRef.current?.contains(target)) return;
      setIsProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    onLogout();
  };

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
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Caja Abierta
          </span>

          <button
            ref={avatarRef}
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-label="Perfil de usuario"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-leather text-white shadow-sm transition-opacity hover:opacity-80 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Profile dropdown ── */}
      {isProfileMenuOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-4 top-16 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 z-50 animate-in fade-in zoom-in-95"
        >
          <div className="px-1">
            <p className="font-bold text-stone-900 leading-tight">{currentUser.fullName}</p>
            <p className="text-xs text-stone-400">@{currentUser.username}</p>
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                currentUser.role === 'ADMIN'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              {currentUser.role === 'ADMIN' ? '👑 Administrador' : '💼 Cajero / Ventas'}
            </span>
          </div>

          <div className="h-px bg-stone-100 my-2" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
              <path d="M10 8l-4 4 4 4" />
              <path d="M6 12h10" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
}
