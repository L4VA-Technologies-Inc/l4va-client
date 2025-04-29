import { createFileRoute, Navigate } from '@tanstack/react-router';

import { CreateVault } from '@/pages/CreateVault';
import { useAuth } from '@/lib/auth/auth';

const CreateComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <CreateVault />;
};

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});
