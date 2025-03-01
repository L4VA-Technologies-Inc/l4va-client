import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';

export const CreateVault = () => (
  <>
    <div className="flex justify-center pt-20 pb-8">
      <span className="font-russo text-[40px] uppercase">
        Create Vault
      </span>
    </div>
    <div className="container mx-auto">
      <CreateVaultForm />
    </div>
  </>
);
