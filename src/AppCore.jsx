import { useEffect } from 'react';
import { WeldProvider } from '@ada-anvil/weld/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { NovuProvider } from '@novu/react';
import toast from 'react-hot-toast';

import { routeTree } from './routeTree.gen';

import { ModalProvider } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { useAuthInterceptor } from '@/hooks/useAxiosInterceptor';
import { useWalletChangeListener } from '@/hooks/useWalletChangeListener';

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
  useWalletChangeListener();

  useEffect(() => {
    const message = sessionStorage.getItem('logout_toast');
    if (message) {
      sessionStorage.removeItem('logout_toast');
      toast.error(message);
    }
  }, []);

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
