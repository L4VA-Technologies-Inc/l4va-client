import { AuthProvider } from './context/AuthContext';
import { Routes } from './routes';

export const App = () => (
  <AuthProvider>
    <Routes />
  </AuthProvider>
);
