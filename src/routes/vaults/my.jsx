import { createFileRoute, Navigate } from '@tanstack/react-router';
import { MyVaults } from '@/pages/MyVaults';
import { useAuth } from '@/lib/auth/auth';

const MyVaultsComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <MyVaults />;
};

export const Route = createFileRoute('/vaults/my')({
  component: MyVaultsComponent,
});
