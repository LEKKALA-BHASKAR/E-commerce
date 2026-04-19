import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AnnouncementBar from './AnnouncementBar.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import MobileNav from './MobileNav.jsx';
import SearchOverlay from './SearchOverlay.jsx';

export default function StorefrontLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="relative z-10 min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileNav />
      <SearchOverlay />
    </>
  );
}
