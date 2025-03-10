import { VaultsList } from '@/components/shared/VaultsList';

export const Vaults = () => (
  <>
    <div className="flex justify-center pt-20 pb-8">
      <span className="font-russo text-[40px] uppercase">
        Vaults
      </span>
    </div>
    <div className="container mx-auto">
      <VaultsList />
    </div>
  </>
);
