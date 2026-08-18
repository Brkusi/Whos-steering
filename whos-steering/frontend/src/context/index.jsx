import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

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
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ws_token');
    if (token) {
      apiFetch('/api/auth/me')
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('ws_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('ws_token', token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user } = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('ws_token', token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ws_token');
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);