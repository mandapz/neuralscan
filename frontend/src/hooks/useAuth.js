import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getMe, logout as apiLogout, loginWithGoogle } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { setUser(await getMe()); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const p = new URLSearchParams(window.location.search);
    if (p.get('auth') === 'success') { window.history.replaceState({}, '', window.location.pathname); refresh(); }
  }, [refresh]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login: loginWithGoogle,
      logout: async () => { try { await apiLogout(); } catch {} setUser(null); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
