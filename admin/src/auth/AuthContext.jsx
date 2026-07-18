import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login(newToken) {
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
      },
      logout() {
        localStorage.removeItem('admin_token');
        setToken(null);
      },
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
