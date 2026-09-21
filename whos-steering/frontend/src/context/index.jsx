import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, authToken } from '../lib/api';

// ── CART ─────────────────────────────────────────────────────────────────────
const CartCtx = createContext(null);
export function CartProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);

  const [items, setItems] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ws_cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem('ws_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, { ...item, cartId: Date.now() + Math.random() }]);
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <CartCtx.Provider value={{
      items,
      addItem,
      removeItem,
      clearCart,
      total,
      count: items.length,
      cartOpen,
      setCartOpen,
    }}>
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => useContext(CartCtx);

// ── AUTH ─────────────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const normalizeUser = (user) => user ? ({
  ...user,
  firstName: user.firstName ?? user.first_name,
  lastName: user.lastName ?? user.last_name,
  isAdmin: user.isAdmin ?? user.is_admin,
}) : null;
export function AuthProvider({ children }) {
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('ws_user') || sessionStorage.getItem('ws_user') || 'null'); } catch { return null; }
  })();
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    const token = authToken();
    if (token) {
      apiFetch('/api/auth/me')
        .then(u => {
          const normalized = normalizeUser(u);
          setUser(normalized);
          const storage = localStorage.getItem('ws_token') ? localStorage : sessionStorage;
          storage.setItem('ws_user', JSON.stringify(normalized));
        })
        .catch(() => {
          localStorage.removeItem('ws_token'); localStorage.removeItem('ws_user');
          sessionStorage.removeItem('ws_token'); sessionStorage.removeItem('ws_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('ws_user');
      sessionStorage.removeItem('ws_user');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const { token, user } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    localStorage.removeItem('ws_token'); localStorage.removeItem('ws_user');
    sessionStorage.removeItem('ws_token'); sessionStorage.removeItem('ws_user');
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('ws_token', token);
    const normalized = normalizeUser(user);
    storage.setItem('ws_user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user } = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('ws_token', token);
    const normalized = normalizeUser(user);
    localStorage.setItem('ws_user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ws_token');
    localStorage.removeItem('ws_user');
    sessionStorage.removeItem('ws_token');
    sessionStorage.removeItem('ws_user');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);
