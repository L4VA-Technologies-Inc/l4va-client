import { WeldProvider } from '@ada-anvil/weld/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import { RouterProvider, createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

import { AuthProvider } from '@/context/AuthContext';
import { ModalProvider } from '@/context/ModalsContext';

import './css/index.css';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeldProvider>
      <ModalProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            toastOptions={{
              style: {
                background: '#282B3F',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </ModalProvider>
    </WeldProvider>
  </StrictMode>,
);
