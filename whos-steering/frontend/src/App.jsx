import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider } from './context';
import Nav from './components/Nav';
import Footer from './components/Footer';
import './index.css';

import { lazy, Suspense } from 'react';
const Home              = lazy(() => import('./pages/Home'));
const Catalog           = lazy(() => import('./pages/Catalog'));
const Product           = lazy(() => import('./pages/Product'));
const Configure         = lazy(() => import('./pages/Configure'));
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

function Spinner() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--y)', fontFamily: 'Orbitron, monospace', letterSpacing: 4 }}>LOADING...</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Nav />
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/catalog"            element={<Catalog />} />
              <Route path="/catalog/:id"        element={<Product />} />
              <Route path="/configure"          element={<Configure />} />
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
            </Routes>
          </Suspense>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
