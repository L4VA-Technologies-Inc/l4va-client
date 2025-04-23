import { AuthModals } from '@/components/AuthModals';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const Layout = ({
  children,
  includeFooter = true,
  backgroundImage = null,
  backgroundHeight = null,
}) => (
  <div className="relative">
    {backgroundImage && (
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: backgroundHeight || '100%',
        }}
      />
    )}
    <Header />
    {children}
    {includeFooter && <Footer />}
    <AuthModals />
  </div>
);
