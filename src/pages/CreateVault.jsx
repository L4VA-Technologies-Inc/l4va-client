import { CreateVaultForm } from '@/components/vaults/create/CreateVaultForm';

export const CreateVault = () => (
  <>
    <div className="flex justify-center py-20 bg-dark-600 mb-8">
      <span className="font-satoshi text-4xl uppercase">
        Create Vault
      </span>
    </div>
    <div className="main container mx-auto">
      <CreateVaultForm />
    </div>
  </>
);
