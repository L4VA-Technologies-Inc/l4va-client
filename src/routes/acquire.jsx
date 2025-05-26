import { createFileRoute, Navigate } from '@tanstack/react-router';

import { Acquire } from '@/pages/Acquire';
import { useAuth } from '@/lib/auth/auth';

const AcquireComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Acquire />;
};

export const Route = createFileRoute('/acquire')({
  component: AcquireComponent,
});
