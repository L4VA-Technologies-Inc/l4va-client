import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'react-hot-toast';
import { Snowfall } from 'react-snowfall';

import MainLayout from '@/components/layout/MainLayout';
import { NotFound } from '@/components/NotFound';
import { Modal } from '@/lib/modals/modal.registry';
import { useSnowfall } from '@/hooks/useSnowfall';

const RootComponent = () => {
  const { enabled } = useSnowfall();

  return (
    <>
      {enabled && (
        <Snowfall
          snowflakeCount={100}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
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
};

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
