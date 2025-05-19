import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';

export const CreateVault = () => (
  <div className="min-h-screen">
    <div className="flex justify-center py-8">
      <span className="font-russo text-[40px] uppercase">Create Vault</span>
    </div>
    <div className="container mx-auto">
      <CreateVaultForm />
    </div>
  </div>
);
