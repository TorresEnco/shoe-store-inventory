/**
 * EmployeeCard.tsx
 *
 * Staff row with role/status badges and a self-protected status toggle.
 */

import type { ApiUser } from '../services/api';

interface EmployeeCardProps {
  user: ApiUser;
  isSelf: boolean;
  isOwner: boolean;
  onToggle: (user: ApiUser) => void;
}

export default function EmployeeCard({ user, isSelf, isOwner, onToggle }: EmployeeCardProps) {
  const isLocked = isSelf || isOwner;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-stone-900">
          {user.fullName}
          {isSelf && <span className="ml-1 text-[10px] font-semibold text-stone-400">(Tú)</span>}
        </p>
        <p className="truncate text-xs text-stone-400">@{user.username}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${user.role === 'ADMIN' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-stone-200 bg-stone-100 text-stone-600'}`}>
            {user.role === 'ADMIN' ? '👑 Admin' : '💼 Cajero'}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${user.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
            {user.active ? 'Activo' : 'Inactivo'}
          </span>
          {isOwner && (
            <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              🔒 Cuenta Principal
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={isLocked}
        title={isOwner ? 'La cuenta principal del dueño está protegida' : isSelf ? 'No puedes desactivar tu propia cuenta' : undefined}
        onClick={() => onToggle(user)}
        className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${user.active ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
      >
        {user.active ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
}
