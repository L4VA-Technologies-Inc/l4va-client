import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/context/auth';
import { Spinner } from '@/components/Spinner';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};
