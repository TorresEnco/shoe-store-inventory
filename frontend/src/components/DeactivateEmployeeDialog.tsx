/**
 * DeactivateEmployeeDialog.tsx
 *
 * Warm cream/leather confirmation card shown before disabling a staff account.
 */

import type { ApiUser } from '../services/api';

interface DeactivateEmployeeDialogProps {
  employee: ApiUser | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeactivateEmployeeDialog({
  employee,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeactivateEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6 backdrop-blur-xs">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl border border-stone-200 bg-cream p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">⚠️</span>
          <h3 className="text-base font-bold text-stone-900">¿Desactivar empleado?</h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          ¿Estás seguro de desactivar a{' '}
          <span className="font-bold text-stone-800">{employee.fullName}</span>? No podrá
          iniciar sesión ni registrar ventas.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-leather py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-leather-dark active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? 'Desactivando...' : 'Sí, desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}
