import { Hero } from '@/components/profile/Hero';
import { Stats } from '@/components/profile/Stats';
import { ProfileSocialLinks } from '@/components/profile/ProfileSocialLinks';
import { MyVaultsList } from '@/components/vaults/MyVaultsList';

export const Profile = () => (
  <div className="min-h-screen">
    <Hero />
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <Stats />
        <ProfileSocialLinks />
        <MyVaultsList />
      </div>
    </div>
  </div>
);
