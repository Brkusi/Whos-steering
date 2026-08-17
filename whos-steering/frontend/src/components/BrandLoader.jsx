import './BrandLoader.css';

export default function BrandLoader() {
  return (
    <div
      className="ws-brand-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Who's Steering"
    >
      <div className="ws-brand-loader__content">
        <div className="ws-brand-loader__mark">
          <span className="ws-brand-loader__orbit" aria-hidden="true" />
          <img
            src="/ws-logo.png"
            alt=""
            className="ws-brand-loader__logo"
            draggable="false"
          />
        </div>

        <div className="ws-brand-loader__bar" aria-hidden="true">
          <span />
        </div>

        <div className="ws-brand-loader__label">LOADING BUILD</div>
      </div>
    </div>
  );
}