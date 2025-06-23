import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'react-hot-toast';

import MainLayout from '@/components/layout/MainLayout';
import { Modal } from '@/lib/modals/modal.registry';
import { NotFound } from '@/pages/NotFound';

const RootComponent = () => (
  <>
    <MainLayout>
      <Outlet />
    </MainLayout>
    <TanStackRouterDevtools position="bottom-right" />
    <Modal />
    <Toaster
      toastOptions={{
        style: {
          background: '#282B3F',
          color: '#fff',
        },
      }}
    />
  </>
);

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
