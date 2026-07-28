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
import { useNetwork } from '@/hooks/useNetwork';

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
  const { updateNetwork } = useNetwork();

  useEffect(() => {
    const message = sessionStorage.getItem('logout_toast');
    if (message) {
      sessionStorage.removeItem('logout_toast');
      toast.error(message);
    }
  }, []);

  // Lets a link like example.com?chain=robinhood auto-select the network on landing,
  // then strips just that param so it doesn't stay visible in the address bar.
  useEffect(() => {
    const url = new URL(window.location.href);
    const chainParam = url.searchParams.get('chain');
    if (chainParam !== 'robinhood' && chainParam !== 'cardano') return;

    updateNetwork(chainParam);
    url.searchParams.delete('chain');
    const search = url.searchParams.toString();
    window.history.replaceState({}, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
  }, [updateNetwork]);

  return (
    <ModalProvider>
      <RouterProvider router={router} />
    </ModalProvider>
  );
};
// hi
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
