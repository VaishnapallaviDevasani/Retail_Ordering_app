import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.roles?.includes('ROLE_ADMIN')) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch { setUser(null); }
    finally { setLoading(false); }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (!res.data.roles?.includes('ROLE_ADMIN')) {
      await api.post('/auth/logout');
      throw new Error('Admin access only');
    }
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
