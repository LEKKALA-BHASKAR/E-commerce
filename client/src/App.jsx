import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StorefrontLayout from './components/layout/StorefrontLayout.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import RouteSkeleton from './components/ui/RouteSkeleton.jsx';
import RoleGuard from './components/auth/RoleGuard.jsx';
import useHydrateUser from './lib/useHydrateUser.js';

// Storefront
const Home = lazy(() => import('./pages/storefront/Home.jsx'));
const Catalog = lazy(() => import('./pages/storefront/Catalog.jsx'));
const ProductDetail = lazy(() => import('./pages/storefront/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/storefront/Cart.jsx'));
const Checkout = lazy(() => import('./pages/storefront/Checkout.jsx'));
const OrderConfirmation = lazy(() => import('./pages/storefront/OrderConfirmation.jsx'));
const Wishlist = lazy(() => import('./pages/storefront/Wishlist.jsx'));
const Search = lazy(() => import('./pages/storefront/Search.jsx'));
const NotFound = lazy(() => import('./pages/storefront/NotFound.jsx'));
const Login = lazy(() => import('./pages/storefront/Login.jsx'));
const Register = lazy(() => import('./pages/storefront/Register.jsx'));
const Forgot = lazy(() => import('./pages/storefront/Forgot.jsx'));
const AccountDashboard = lazy(() => import('./pages/storefront/AccountDashboard.jsx'));
const Orders = lazy(() => import('./pages/storefront/Orders.jsx'));
const OrderDetail = lazy(() => import('./pages/storefront/OrderDetail.jsx'));
const Profile = lazy(() => import('./pages/storefront/Profile.jsx'));
const Contact = lazy(() => import('./pages/storefront/Contact.jsx'));
const Invoice = lazy(() => import('./pages/storefront/Invoice.jsx'));

// Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const Overview = lazy(() => import('./pages/admin/Overview.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail.jsx'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews.jsx'));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS.jsx'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  useHydrateUser();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return (
    <div className="grain min-h-screen">
      <Suspense fallback={<RouteSkeleton />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<PageTransition><Overview /></PageTransition>} />
              <Route path="products" element={<PageTransition><AdminProducts /></PageTransition>} />
              <Route path="products/:id" element={<PageTransition><AdminProductEdit /></PageTransition>} />
              <Route path="orders" element={<PageTransition><AdminOrders /></PageTransition>} />
              <Route path="orders/:id" element={<PageTransition><AdminOrderDetail /></PageTransition>} />
              <Route path="customers" element={<PageTransition><AdminCustomers /></PageTransition>} />
              <Route path="categories" element={<PageTransition><AdminCategories /></PageTransition>} />
              <Route path="coupons" element={<PageTransition><AdminCoupons /></PageTransition>} />
              <Route path="reviews" element={<PageTransition><AdminReviews /></PageTransition>} />
              <Route path="cms" element={<PageTransition><AdminCMS /></PageTransition>} />
              <Route path="analytics" element={<PageTransition><AdminAnalytics /></PageTransition>} />
              <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
            </Route>

            <Route path="/" element={<StorefrontLayout />}>
              <Route index element={<PageTransition><Home /></PageTransition>} />
              <Route path="shop" element={<PageTransition><Catalog /></PageTransition>} />
              <Route path="product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
              <Route path="cart" element={<PageTransition><Cart /></PageTransition>} />
              <Route path="checkout" element={<PageTransition><Checkout /></PageTransition>} />
              <Route path="order/:id" element={<PageTransition><OrderConfirmation /></PageTransition>} />
              <Route path="wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
              <Route path="search" element={<PageTransition><Search /></PageTransition>} />
              <Route path="login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="register" element={<PageTransition><Register /></PageTransition>} />
              <Route path="forgot" element={<PageTransition><Forgot /></PageTransition>} />
              <Route path="account" element={<RoleGuard roles={null} redirectTo="/login"><PageTransition><AccountDashboard /></PageTransition></RoleGuard>} />
              <Route path="account/orders" element={<RoleGuard roles={null} redirectTo="/login"><PageTransition><Orders /></PageTransition></RoleGuard>} />
              <Route path="account/orders/:id" element={<RoleGuard roles={null} redirectTo="/login"><PageTransition><OrderDetail /></PageTransition></RoleGuard>} />
              <Route path="account/orders/:id/invoice" element={<RoleGuard roles={null} redirectTo="/login"><PageTransition><Invoice /></PageTransition></RoleGuard>} />
              <Route path="account/profile" element={<RoleGuard roles={null} redirectTo="/login"><PageTransition><Profile /></PageTransition></RoleGuard>} />
              <Route path="contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
