/**
 * ManageEmployeesModal.tsx
 *
 * Mobile sheet for ADMIN users to list, register, and toggle staff accounts.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createUser, getUsers, toggleUserStatus, type ApiUser, type CreateUserPayload } from '../services/api';
import type { UserProfile } from '../types/user';
import DeactivateEmployeeDialog from './DeactivateEmployeeDialog';
import EmployeeCard from './EmployeeCard';
import EmployeeRegistrationForm from './EmployeeRegistrationForm';
interface ManageEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export default function ManageEmployeesModal({ isOpen, onClose, currentUser }: ManageEmployeesModalProps) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<ApiUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setErrorMessage(null);
    getUsers()
      .then(setUsers)
      .catch((err) => setErrorMessage(err instanceof Error ? err.message : 'No se pudo cargar la lista de empleados.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  if (!isOpen) return null;

  const handleCreateUser = async (payload: CreateUserPayload): Promise<boolean> => {
    setErrorMessage(null);
    try {
      const created = await createUser(payload);
      setUsers((prev) => [...prev, created]);
      return true;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo registrar el empleado. Verifica los datos.');
      return false;
    }
  };

  const handleToggleStatus = async (id: number) => {
    setErrorMessage(null);
    setIsUpdating(true);
    try {
      const updated = await toggleUserStatus(id, currentUser.id);
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
      setPendingDeactivation(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo actualizar el estado del empleado.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = (user: ApiUser) => {
    if (user.id === currentUser.id || user.username.toLowerCase() === 'admin') return;
    if (user.active) {
      setPendingDeactivation(user);
      return;
    }
    void handleToggleStatus(user.id);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl" style={{ height: '90dvh' }}>
        <header className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Gestión de Empleados</h2>
            <p className="text-xs text-stone-500">Administra el personal de Comercial Torres</p>
          </div>
          <button type="button" aria-label="Cerrar modal" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">✕</button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {errorMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xs animate-in fade-in">
              <span className="flex items-center gap-2">⚠️ {errorMessage}</span>
              <button type="button" aria-label="Descartar alerta" onClick={() => setErrorMessage(null)} className="text-amber-700 font-bold ml-2">✕</button>
            </div>
          )}

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-stone-800">Personal Actual</h3>
            {isLoading ? (
              <p className="py-6 text-center text-xs font-semibold text-stone-500">Cargando empleados...</p>
            ) : users.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500">No hay empleados registrados.</p>
            ) : (
              users.map((user) => (
                <EmployeeCard
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUser.id}
                  isOwner={user.username.toLowerCase() === 'admin'}
                  onToggle={handleToggle}
                />
              ))
            )}
          </section>

          <EmployeeRegistrationForm onCreate={handleCreateUser} />
        </div>
      </div>

      <DeactivateEmployeeDialog
        employee={pendingDeactivation}
        isSubmitting={isUpdating}
        onCancel={() => setPendingDeactivation(null)}
        onConfirm={() => { if (pendingDeactivation) void handleToggleStatus(pendingDeactivation.id); }}
      />
    </div>,
    document.body,
  );
}
