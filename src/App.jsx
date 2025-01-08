import { AuthProvider } from './context/AuthContext';
import { Routes } from './routes';

export const App = () => (
  <AuthProvider>
    <div className="min-h-screen bg-gray-100">
      <Routes />
    </div>
  </AuthProvider>
);
