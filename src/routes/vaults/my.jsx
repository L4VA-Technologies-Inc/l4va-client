import { createFileRoute, Navigate } from '@tanstack/react-router';

import { MyVaultsList } from '@/components/vaults/MyVaultsList';
import { useAuth } from '@/lib/auth/auth';

const MyVaultsComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <MyVaultsList />;
};

export const Route = createFileRoute('/vaults/my')({
  component: MyVaultsComponent,
});
