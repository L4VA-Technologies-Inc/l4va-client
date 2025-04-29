import { createFileRoute, Navigate } from '@tanstack/react-router';

import { Contribute } from '@/pages/Contribute';
import { useAuth } from '@/lib/auth/auth';

const ContributeComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Contribute />;
};

export const Route = createFileRoute('/contribute')({
  component: ContributeComponent,
});
