import { createFileRoute, Navigate } from '@tanstack/react-router';

import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';
import { useAuth } from '@/lib/auth/auth';

const CreateComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="flex justify-center py-8">
        <span className="font-russo text-4xl uppercase">Create Vault</span>
      </div>
      <CreateVaultForm />
    </>
  );
};

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});
