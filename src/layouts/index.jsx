import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const HomePageLayout = ({ children }) => (
  <div className="relative">
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[768px]"
      style={{ backgroundImage: 'url(/assets/hero-bg.webp)' }}
    />
    <Header/>
    {children}
    <Footer />
  </div>
);

export const MainLayout = ({ children, includeFooter = true }) => (
  <>
    <Header/>
    {children}
    {includeFooter && <Footer />}
  </>
);

export const CreateVaultLayout = ({ children }) => (
  <div className="relative">
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[518px]"
      style={{ backgroundImage: 'url(/assets/vaults/create-vault-bg.webp)' }}
    />
    <Header/>
    {children}
    <Footer/>
  </div>
);
