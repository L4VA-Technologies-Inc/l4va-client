import { FeaturedVaultsList } from '@/components/vaults/FeaturedVaultsList';
import { CommunityVaultsList } from '@/components/vaults/CommunityVaultsList';

export const Contribute = () => (
  <div className="min-h-screen">
    <div className="flex justify-center py-8">
      <span className="font-russo text-[40px] uppercase">Contribute</span>
    </div>
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <FeaturedVaultsList />
        <CommunityVaultsList />
      </div>
    </div>
  </div>
);
