import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';

export const CreateVault = ({ vault }) => (
  <>
    <div className="flex justify-center pt-20 pb-8">
      <span className="font-russo text-[40px] uppercase">
        {vault ? 'Edit Vault' : 'Create Vault'}
      </span>
    </div>
    <div className="container mx-auto">
      <CreateVaultForm vault={vault} />
    </div>
  </>
);
