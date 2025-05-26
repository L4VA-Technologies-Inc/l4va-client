import { CommunityVaultsList } from '@/components/vaults/CommunityVaultsList';

export const Acquire = () => (
  <div className="min-h-screen">
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <CommunityVaultsList />
      </div>
    </div>
  </div>
);
