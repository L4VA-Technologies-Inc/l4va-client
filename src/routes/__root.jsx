import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { AuthModals } from '@/components/AuthModals';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const RootComponent = () => (
  <>
    <Header />
    <div className="min-h-screen">
      <Outlet />
    </div>
    <TanStackRouterDevtools position="bottom-right" />
    <AuthModals />
    <Footer />
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
});