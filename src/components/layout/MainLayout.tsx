import { useEffect, type ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SupportButton } from '@/components/SupportButton';

interface LayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  // The AI chat is a full-screen app on mobile: no footer to scroll into, no floating button over the composer.
  const isChatPage = useRouterState({ select: state => state.location.pathname === '/create-ai' });

  // Chrome on iOS resolves dvh against the wrong viewport (gap under the composer); innerHeight is the real visible height.
  useEffect(() => {
    if (!isChatPage) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--app-height', `${window.innerHeight}px`);
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      root.style.removeProperty('--app-height');
    };
  }, [isChatPage]);

  return (
    <div>
      {/* Shared page background (was home-only). */}
      <div className="home-bg-texture pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-[-1] w-full min-h-[750px]" />
      <Header />
      <main
        className={`content-space-top ${isChatPage ? '!pb-0 h-[var(--app-height,100dvh)] overflow-hidden' : 'min-h-screen'}`}
      >
        {/* <AlertBanner
          message="TapTools API is currently unavailable. Some asset pricing, wallet discovery, and market data features may be limited. We are monitoring the situation."
          type="warning"
        /> */}
        <div className="container mx-auto px-4 xl:px-0">{children}</div>
      </main>
      <div className={isChatPage ? 'hidden lg:block' : undefined}>
        <Footer />
        <SupportButton />
      </div>
    </div>
  );
};

export default MainLayout;
