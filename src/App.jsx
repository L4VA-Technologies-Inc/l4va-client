import { AuthProvider } from './context/AuthContext.jsx';
import { Header } from './components/Header';

export const App = () => (
  <AuthProvider>
    <div className="min-h-screen bg-gray-100">
      <Header />
    </div>
  </AuthProvider>
);
