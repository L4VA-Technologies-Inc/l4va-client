import { useSearchParams } from 'react-router-dom';
import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';

export const CreateVault = () => {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');

  return (
    <>
      <div className="flex justify-center pt-20 pb-8">
        <span className="font-russo text-[40px] uppercase">
          {draftId ? 'Edit Draft Vault' : 'Create Vault'}
        </span>
      </div>
      <div className="container mx-auto">
        <CreateVaultForm draftId={draftId} />
      </div>
    </>
  );
};
