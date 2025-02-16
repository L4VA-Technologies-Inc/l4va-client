import { Header } from '@/components/Header';

export const HomePageLayout = ({ children }) => (
  <div className="relative">
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[768px]"
      style={{ backgroundImage: 'url(/assets/hero-bg.webp)' }}
    />
    <Header/>
    {children}
  </div>
);

export const MainLayout = ({ children }) => (
  <>
    <Header/>
    {children}
  </>
);
