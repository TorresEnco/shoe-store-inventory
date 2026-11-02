/**
 * EmployeeRegistrationForm.tsx
 *
 * Staff registration form for the employee management sheet.
 */

import { useState, type FormEvent } from 'react';
import type { CreateUserPayload } from '../services/api';

interface EmployeeRegistrationFormProps {
  onCreate: (payload: CreateUserPayload) => Promise<boolean>;
}

export default function EmployeeRegistrationForm({ onCreate }: EmployeeRegistrationFormProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const created = await onCreate({
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      role,
    });
    if (created) {
      setFullName('');
      setUsername('');
      setPassword('');
      setRole('CASHIER');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-stone-800">Registrar Nuevo Empleado</h3>
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre Completo" className="w-full rounded-xl bg-[#FAF4EE] px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-leather/30" />
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" className="w-full rounded-xl bg-[#FAF4EE] px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-leather/30" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-xl bg-[#FAF4EE] px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-leather/30" />
      <div className="flex gap-2">
        {(['CASHIER', 'ADMIN'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setRole(option)} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95 ${role === option ? 'bg-leather-dark text-white shadow-sm' : 'border border-stone-200 bg-stone-50 text-stone-600'}`}>
            {option === 'ADMIN' ? 'Administrador' : 'Cajero'}
          </button>
        ))}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-leather py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-leather-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Registrando...' : '+ Registrar Empleado'}
      </button>
    </form>
  );
}
