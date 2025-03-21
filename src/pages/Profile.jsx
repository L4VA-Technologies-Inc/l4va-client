import { Hero } from '@/components/profile/Hero';
import { Stats } from '@/components/profile/Stats';
import { ProfileSocialLinks } from '@/components/profile/ProfileSocialLinks';
import { VaultsList } from '@/components/vaults/VaultsList';

export const Profile = () => (
  <div className="min-h-screen">
    <Hero />
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <Stats />
        <ProfileSocialLinks />
        <VaultsList />
      </div>
    </div>
  </div>
);
