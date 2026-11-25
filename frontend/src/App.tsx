import { useEffect, useState } from 'react';
import AuthenticatedPos from './AuthenticatedPos';
import LoginView from './views/LoginView';
import { currentSession, login, logout } from './services/api';
import type { UserProfile } from './types/user';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    function expired() {
      setUser(null);
      setNotice('Tu sesión ha caducado. Vuelve a iniciar sesión.');
    }
    window.addEventListener('session-expired', expired);
    currentSession().then(profile => { if (active) setUser(profile); })
      .catch((cause: Error) => { if (active) setNotice(cause.message === 'Tu sesión ha caducado.' ? '' : cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; window.removeEventListener('session-expired', expired); };
  }, []);

  async function signOut() {
    try {
      await logout();
      setUser(null);
      setNotice('');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'No se pudo confirmar el cierre de sesión.');
    }
  }

  if (loading) return <p role="status" className="p-6 text-center">Comprobando sesión…</p>;
  if (!user) return <LoginView notice={notice} onLogin={async (username, password) => {
    const profile = await login(username, password);
    setNotice('');
    setUser(profile);
  }} />;
  return <>
    {notice && <p role="alert" className="p-2 text-center text-red-700">{notice}</p>}
    <AuthenticatedPos key={user.id} currentUser={user} onLogout={signOut} />
  </>;
}
