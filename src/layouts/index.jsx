import { Header } from '@/components/Header';

export const HomePageLayout = ({ children }) => (
  <div className="relative">
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
