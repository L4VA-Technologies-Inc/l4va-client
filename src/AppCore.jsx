import { WeldProvider } from '@ada-anvil/weld/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { NovuProvider } from '@novu/react';

import { routeTree } from './routeTree.gen';

import { ModalProvider } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { useAuthInterceptor } from '@/hooks/useAxiosInterceptor';

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

const AppWithInterceptor = () => {
  useAuthInterceptor();
  return (
    <ModalProvider>
      <RouterProvider router={router} />
    </ModalProvider>
  );
};

export function AppCore() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <NovuProvider applicationIdentifier="yf1FEY4EziuC" subscriberId={user?.address || 'guest'}>
      <WeldProvider>
        <AppWithInterceptor />
      </WeldProvider>
    </NovuProvider>
  );
}
