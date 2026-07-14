import { Outlet } from 'react-router-dom';
import { Header } from './Header.tsx';
import { NavBar } from './NavBar.tsx';
import { Footer } from './Footer.tsx';

export function PageLayout() {
  return (
    <div className="page-layout">
      <Header />
      <NavBar />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
