import type { ReactNode } from 'react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AlertBanner } from '@/components/shared/AlertBanner';

interface LayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      <main className="min-h-screen content-space-top">
        <AlertBanner
          message="⚠️ Asset pricing data may be incorrect. We are working on a solution. Please verify values before making contributions."
          type="warning"
        />
        <div className="container mx-auto px-4 xl:px-0">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
