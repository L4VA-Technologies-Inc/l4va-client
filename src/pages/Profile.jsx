import { Hero } from '@/components/profile/Hero';
import { Stats } from '@/components/profile/Stats';
import { SocialLinks } from '@/components/profile/SocialLinks';
import { VaultsList } from '@/components/vaults/VaultsList';


export const Profile = () => (
  <div className="min-h-screen">
    <Hero />
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <Stats />
        <SocialLinks />
        <VaultsList />
      </div>
    </div>
  </div>
);
