import { useRef } from 'react';
import { useDialog } from './Experience';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, total } = useCart();
  const nav = useNavigate();

  const panelRef = useRef(null);
  useDialog(panelRef, open, onClose);
  return (
    <>
      {open && <div className="cart-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1099 }} />}
      <div ref={panelRef} className="cart-panel" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden={!open} inert={!open ? '' : undefined} tabIndex={-1} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: 'var(--m)', borderLeft: '1px solid var(--b)',
        display: 'flex', flexDirection: 'column', zIndex: 1100,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, letterSpacing: .6, color: 'var(--y)', textTransform: 'uppercase' }}>
            Cart {items.length > 0 && `(${items.length})`}
          </div>
          <button aria-label="Close cart" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t)', gap: 8 }}>
              <div style={{ fontSize: 36, opacity: .3 }}>⊙</div>
              <div style={{ letterSpacing: .6, textTransform: 'uppercase', fontSize: 14 }}>No wheels yet</div>
            </div>
          ) : items.map(item => (
            <div className="cart-item" key={item.cartId} style={{ padding: '16px 0', borderBottom: '1px solid var(--b)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontStyle: 'italic', fontSize: 18 }}>{item.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--t)', marginTop: 3, lineHeight: 1.5 }}>{item.detail}</div>
                </div>
                <button aria-label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.cartId)}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, marginLeft: 8, flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--y)', marginTop: 6 }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid var(--b)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, letterSpacing: .6, color: 'var(--t)', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 28, color: 'var(--y)' }}>${total.toFixed(2)}</span>
            </div>
            <button className="btn" style={{ width: '100%', clipPath: 'none' }}
              onClick={() => { onClose(); nav('/checkout'); }}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
