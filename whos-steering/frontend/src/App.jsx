import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider } from './context';
import Nav from './components/Nav';
import './index.css';

// Pages (lazy load for better performance)
import { lazy, Suspense } from 'react';
const Home     = lazy(() => import('./pages/Home'));
const Catalog  = lazy(() => import('./pages/Catalog'));
const Product  = lazy(() => import('./pages/Product'));
const Configure = lazy(() => import('./pages/Configure'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login    = lazy(() => import('./pages/Login'));
const Account  = lazy(() => import('./pages/Account'));
const Contact  = lazy(() => import('./pages/Contact'));
const Admin    = lazy(() => import('./pages/Admin'));

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
              <Route path="/"                    element={<Home />} />
              <Route path="/catalog"             element={<Catalog />} />
              <Route path="/catalog/:id"         element={<Product />} />
              <Route path="/configure"           element={<Configure />} />
              <Route path="/checkout"            element={<Checkout />} />
              <Route path="/order-confirmation"  element={<OrderConfirmation />} />
              <Route path="/login"               element={<Login />} />
              <Route path="/account"             element={<Account />} />
              <Route path="/contact"             element={<Contact />} />
              <Route path="/admin"               element={<Admin />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
