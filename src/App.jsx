import { Toaster } from 'react-hot-toast';

import { Routes } from './routes';

import { AuthProvider } from '@/context/AuthContext';
import { ModalProvider } from '@/context/ModalsContext';

export const App = () => (
  <ModalProvider>
    <AuthProvider>
      <Routes />
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
);
