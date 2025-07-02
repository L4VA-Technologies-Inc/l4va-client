import { WeldProvider } from '@ada-anvil/weld/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { routeTree } from './routeTree.gen';


import { AuthProvider } from '@/lib/auth/auth.context';
import { ModalProvider } from '@/lib/modals/modal.context';

import '@/css/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WeldProvider>
        <AuthProvider>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>
        </AuthProvider>
      </WeldProvider>
    </QueryClientProvider>
  </StrictMode>
);
