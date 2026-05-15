import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useCart } from '../context';
import WheelPreview from '../components/WheelPreview';

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    apiFetch(`/api/products/${id}`)
      .then(setProduct)
      .catch(() => nav('/catalog'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  if (loading) return (
    <div style={{ paddingTop: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--y)', fontFamily: 'Orbitron, monospace', letterSpacing: 4 }}>LOADING...</div>
  );
  if (!product) return null;

  const features = Array.isArray(product.features) ? product.features : JSON.parse(product.features || '[]');

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', minHeight: 'calc(100vh - 88px)' }}>
        {/* Gallery */}
        <div style={{ background: 'var(--m)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 40px', borderRight: '1px solid var(--b)' }}>
          <WheelPreview config={{ brand: product.brand, stripeColor: product.stripe_color, stripeMode: product.stripe_color ? 'single' : 'none' }} size={300} />
        </div>

        {/* Info */}
        <div style={{ padding: '36px 32px', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 8 }}>
            {product.brand} · Custom Build
          </div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 44, letterSpacing: 1, lineHeight: 1, marginBottom: 6 }}>{product.name}</div>
          <div style={{ color: 'var(--t)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: 40, color: 'var(--y)', marginBottom: 4 }}>
            ${parseFloat(product.base_price).toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Starting price · Options may vary</div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t)' }}>
                <div style={{ width: 6, height: 6, background: 'var(--y)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
            <button className="btn" onClick={() => nav(`/configure?brand=${product.brand}`)}>CONFIGURE THIS WHEEL</button>
            <button className="btn-outline sm" onClick={() => {
              addItem({ name: `${product.brand} ${product.name}`, detail: features.slice(0, 3).join(' · '), price: parseFloat(product.base_price), config: { brand: product.brand } });
              showToast('ADDED TO CART');
            }}>ADD TO CART</button>
          </div>

          {/* Meta */}
          <div style={{ borderTop: '1px solid var(--b)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--t)' }}>
              <span style={{ color: 'var(--y)', fontSize: 13 }}>⏱</span> 3–5 week custom build
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--t)' }}>
              <span style={{ color: 'var(--y)', fontSize: 13 }}>🛡</span> 6 Month Manufacturer Warranty
            </div>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
