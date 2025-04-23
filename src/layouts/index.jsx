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
    <div className="fixed right-4 bottom-4 translate-x-[110px] translate-y-[10px] transform rounded-lg p-4 shadow-lg transition-transform duration-300 hover:translate-x-0 hover:translate-y-0">Transform translate example</div>
  </div>
);
