import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Modal } from '@/lib/modals/modal.registry';

const RootComponent = () => (
  <>
    <Header />
    <div className="min-h-screen">
      <Outlet />
    </div>
    <TanStackRouterDevtools position="bottom-right" />
    <Footer />
    <Modal />
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
});
