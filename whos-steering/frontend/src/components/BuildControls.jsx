import {WheelDiscountTag} from './BlackFriday';
import { useId, useRef } from 'react';
import { useDialog } from './Experience';

// Shared by wheel and airbag builds: retain the original wheel typography,
// sizing, spacing, review actions and floating-total presentation.
export function BuildCheckoutTotal({price,originalPrice,onReview,mobile=false}) {
  return <>
    {originalPrice > price && <div className="bf-config-offer"><WheelDiscountTag/><del>${originalPrice.toFixed(2)}</del><small>Nov 11–28 · Custom wheels only</small></div>}
    <div aria-live="polite" style={mobile ? {textAlign:'center',marginBottom:16} : {paddingTop:8,borderTop:'1px solid var(--b)',width:'100%',textAlign:'center',flexShrink:0}}>
      <div style={{fontFamily:'Arial, sans-serif',fontSize:14,letterSpacing:.6,color:'var(--t)',textTransform:'uppercase',marginBottom:mobile?3:2}}>Estimated Total</div>
      <div style={{fontFamily:'"Barlow Condensed", sans-serif',fontWeight:900,fontSize:mobile?46:'clamp(54px,5vw,72px)',color:'var(--y)',lineHeight:mobile?1:.95,letterSpacing:mobile?undefined:-1}}>${price.toFixed(2)}</div>
      {!mobile && <div style={{fontSize:14,color:'var(--t)',letterSpacing:1.15,marginTop:2}}>Final price confirmed at checkout</div>}
    </div>
    <button type="button" className="btn build-add-to-cart" style={{width:'100%',clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',padding:18,fontSize:14,letterSpacing:.6}} onClick={onReview}>+ ADD TO CART</button>
  </>;
}
export function FloatingBuildTotal({price,onReview,className}) {
  return (        <button
          type="button"
          className={className}
          onClick={onReview}
          aria-label={`Build total $${price.toFixed(2)}. Jump to review.`}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            width: 'calc(100% - 28px)',
            maxWidth: 560,
            minHeight: 58,
            padding: '9px 14px 9px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid rgba(232,184,0,.72)',
            background: 'rgba(8,8,8,.94)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 10px 36px rgba(0,0,0,.55), 0 0 0 1px rgba(232,184,0,.05) inset',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: 1.8,
              color: 'var(--y)',
              marginBottom: 2,
            }}>
              BUILD TOTAL
            </span>
            <span style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontSize: 28,
              fontWeight: 900,
              lineHeight: .95,
              letterSpacing: .3,
              whiteSpace: 'nowrap',
            }}>
              ${price.toFixed(2)}
            </span>
          </span>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--y)',
            fontFamily: 'Arial, sans-serif',
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: 1.2,
            whiteSpace: 'nowrap',
          }}>
            REVIEW BUILD
            <span aria-hidden="true" style={{ fontSize: 14 }}>↓</span>
          </span>
        </button>);
}
export function BuildReviewDialog({rows,onConfirm,onClose,children,className}) {
  const panel=useRef(null),id=useId();
  useDialog(panel,true,onClose);
  return (        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20, overflowY: 'auto' }}>
          <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} className={className} style={{ boxSizing:'border-box', minWidth:0, background: 'var(--p)', border: '1px solid var(--b)', padding: 32, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, letterSpacing: .6, color: 'var(--y)', marginBottom: 4 }}>REVIEW YOUR BUILD</div>
            <div id={id} style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 32, marginBottom: 20 }}>LOOKS GOOD?</div>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1A', gap: 10 }}>
                <span style={{ fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: '#666', flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: k === 'Est. Price' ? 32 : 13, fontWeight: 900, color: k === 'Est. Price' ? 'var(--y)' : 'var(--w)', textAlign: 'right', fontFamily: k === 'Est. Price' ? '"Barlow Condensed", sans-serif' : 'inherit', letterSpacing: k === 'Est. Price' ? 1 : 'normal' }}>{v}</span>
              </div>
            ))}
            {children}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn" style={{ clipPath: 'none', flex: 1 }} onClick={onConfirm}>LOOKS PERFECT — ADD TO CART</button>
              <button className="btn-outline sm" onClick={onClose}>MAKE CHANGES</button>
            </div>
          </div>
        </div>);
}
