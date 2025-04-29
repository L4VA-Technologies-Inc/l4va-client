import { WeldProvider } from '@ada-anvil/weld/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

import { AuthProvider } from '@/lib/auth/auth.context';
import { ModalProvider } from '@/lib/modals/modal.context';

import '@/css/index.css';

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
    <WeldProvider>
      <AuthProvider>
        <ModalProvider>
          <RouterProvider router={router} />
          <Toaster
            toastOptions={{
              style: {
                background: '#282B3F',
                color: '#fff',
              },
            }}
          />
        </ModalProvider>
      </AuthProvider>
    </WeldProvider>
  </StrictMode>
);
