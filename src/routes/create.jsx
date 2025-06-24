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
      <div className="flex justify-center py-4">
        <span className="font-russo text-4xl uppercase">Create Vault</span>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full max-w-[1920px] min-h-[300px] bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/vaults/create-vault-bg.webp)',
        }}
      />
      <CreateVaultForm />
    </>
  );
};

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});
