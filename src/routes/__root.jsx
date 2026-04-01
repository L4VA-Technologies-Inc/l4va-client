import { lazy, Suspense } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import { NotFound } from '@/components/NotFound';
import { Modal } from '@/lib/modals/modal.registry';

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-router-devtools').then(res => ({
        default: res.TanStackRouterDevtools,
      }))
    );

const RootComponent = () => {
  return (
    <>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <Suspense fallback={null}>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
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
};

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
