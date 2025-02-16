import { Routes } from './routes';

import { AuthProvider } from '@/context/AuthContext';
import { ModalProvider } from '@/context/ModalsContext';

export const App = () => (
  <ModalProvider>
    <AuthProvider>
      <Routes />
    </AuthProvider>
  </ModalProvider>
);
