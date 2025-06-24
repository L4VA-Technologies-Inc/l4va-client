import type { ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface LayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isRootPage = location.pathname === '/';

  return (
    <div>
      <Header />
      <main className="min-h-screen content-space-top">
        <div
          className={`relative w-full h-full ${isRootPage ? 'bg-cover bg-center bg-no-repeat max-h-[480px]' : ''}`}
          style={isRootPage ? { backgroundImage: 'url(/assets/main-bg.png)' } : {}}
        >
          <div className="container mx-auto px-4 xl:px-0">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
