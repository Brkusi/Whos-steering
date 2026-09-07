import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider } from './context';
import Nav from './components/Nav';
import Footer from './components/Footer';
import BrandLoader from './components/BrandLoader';
import './index.css';
import './experience.css';
import { RouteExperience } from './components/Experience';

import { lazy, Suspense } from 'react';
const Home              = lazy(() => import('./pages/Home'));
const Catalog           = lazy(() => import('./pages/Catalog'));
const Product           = lazy(() => import('./pages/Product'));
const BuildStart        = lazy(() => import('./pages/BuildStart'));
const Configure         = lazy(() => import('./pages/Configure'));
const TrackOrder        = lazy(() => import('./pages/TrackOrder'));
const Checkout          = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login             = lazy(() => import('./pages/Login'));
const Account           = lazy(() => import('./pages/Account'));
const Contact           = lazy(() => import('./pages/Contact'));
const Admin             = lazy(() => import('./pages/Admin'));
const TermsOfService    = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const ShippingPolicy    = lazy(() => import('./pages/ShippingPolicy'));
const RefundPolicy      = lazy(() => import('./pages/RefundPolicy'));
const PaymentPolicy     = lazy(() => import('./pages/PaymentPolicy'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Nav />
          <a className="skip-link" href="#route-content">Skip to content</a>
          <div id="route-content" tabIndex={-1}>
          <RouteExperience />
          <Suspense fallback={<BrandLoader />}>
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/catalog"            element={<Catalog />} />
              <Route path="/catalog/:id"        element={<Product />} />
              <Route path="/build"              element={<BuildStart />} />
              <Route path="/configure"          element={<Configure />} />
              <Route path="/track-order"        element={<TrackOrder />} />
              <Route path="/checkout"           element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/login"              element={<Login />} />
              <Route path="/account"            element={<Account />} />
              <Route path="/contact"            element={<Contact />} />
              <Route path="/admin"              element={<Admin />} />
              {/* Legal pages */}
              <Route path="/terms"              element={<TermsOfService />} />
              <Route path="/privacy"            element={<PrivacyPolicy />} />
              <Route path="/shipping"           element={<ShippingPolicy />} />
              <Route path="/refund-policy"      element={<RefundPolicy />} />
              <Route path="/payment-policy"     element={<PaymentPolicy />} />
              <Route path="*" element={<div className="empty-state"><h1>That page took a wrong turn.</h1><p>Let’s get you back to your next wheel.</p><a className="btn" href="/">Back to the showroom</a></div>} />
            </Routes>
          </Suspense>
          </div>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
