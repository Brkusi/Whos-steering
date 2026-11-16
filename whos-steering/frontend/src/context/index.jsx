import {lightingVariant,lightingQuantity} from '../lib/ambientLighting';
import {infinitiAirbagPrice} from '../lib/infinitiAirbagConfiguration';
import {customWheelPrice} from '../lib/blackFriday';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch, authToken, warmAccountService } from '../lib/api';

export function currentCartItem(item) {
 const cfg=item.config||{};
 if(cfg.productType==='ambient-lighting'){const v=lightingVariant(cfg.lightingVariant);return {...item,price:v?v.priceCents/100:0,quantity:lightingQuantity(item.quantity)};}
 if(cfg.productType==='airbag-cover')return {...item,price:infinitiAirbagPrice(cfg).total/100};
 if(!cfg.brand||cfg.productId||cfg.readyToShip)return item;
 const regularPrice=item.regularPrice??item.price;
 return {...item,regularPrice,price:customWheelPrice(regularPrice)};
}
// ── CART ─────────────────────────────────────────────────────────────────────
const CartCtx = createContext(null);
export function CartProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);

  const [items, setItems] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ws_cart') || '[]').map(currentCartItem); } catch { return []; }
  });

  useEffect(() => {
    sessionStorage.setItem('ws_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item) => {
    setItems(prev => {
      const next=currentCartItem(item);
      if(next.config?.productType==='ambient-lighting'){
        const count=prev.filter(i=>i.config?.productType==='ambient-lighting').reduce((n,i)=>n+(i.quantity||1),0);
        if(count+(next.quantity||1)>100)return prev;
        const match=prev.find(i=>i.config?.productType==='ambient-lighting'&&i.config.lightingVariant===next.config.lightingVariant);
        if(match)return prev.map(i=>i.cartId===match.cartId?{...i,quantity:(i.quantity||1)+next.quantity}:i);
      }
      return [...prev,{...next,cartId:Date.now()+Math.random()}];
    });
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const updateQuantity=useCallback((cartId,value)=>setItems(prev=>{
    const quantity=lightingQuantity(value),item=prev.find(i=>i.cartId===cartId);
    if(item?.config?.productType!=='ambient-lighting')return prev;
    const others=prev.filter(i=>i.cartId!==cartId&&i.config?.productType==='ambient-lighting').reduce((n,i)=>n+(i.quantity||1),0);
    return prev.map(i=>i.cartId===cartId?{...i,quantity:Math.min(quantity,100-others)}:i);
  }),[]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.price*(i.quantity||1), 0);

  return (
    <CartCtx.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      count: items.reduce((n,i)=>n+(i.quantity||1),0),
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
  const authVersion=useRef(0);
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('ws_user') || sessionStorage.getItem('ws_user') || 'null'); } catch { return null; }
  })();
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    const version=authVersion.current;
    const token = authToken();
    if (token) {
      apiFetch('/api/auth/me')
        .then(u => {
          if(version!==authVersion.current)return;
          const normalized = normalizeUser(u);
          setUser(normalized);
          const storage = localStorage.getItem('ws_token') ? localStorage : sessionStorage;
          storage.setItem('ws_user', JSON.stringify(normalized));
        })
        .catch((error) => {
          if(version!==authVersion.current)return;
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('ws_token'); localStorage.removeItem('ws_user');
            sessionStorage.removeItem('ws_token'); sessionStorage.removeItem('ws_user');
            setUser(null);
          }
        })
        .finally(() => {if(version===authVersion.current)setLoading(false);});
    } else {
      warmAccountService();
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
    authVersion.current+=1;
    setUser(normalized);
    setLoading(false);
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
    authVersion.current+=1;
    setUser(normalized);
    setLoading(false);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    authVersion.current+=1;
    setLoading(false);
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
