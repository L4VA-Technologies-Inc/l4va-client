import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router';

import { MyVaultsList } from '@/components/vaults/MyVaultsList';
import { useAuth } from '@/lib/auth/auth';

const MyVaultsComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const search = useSearch({ from: '/vaults/my' });

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <MyVaultsList initialTab={search?.tab} />;
};

export const Route = createFileRoute('/vaults/my')({
  component: MyVaultsComponent,
  validateSearch: search => ({
    tab: search?.tab || undefined,
  }),
});
