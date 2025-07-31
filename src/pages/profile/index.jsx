import ProfileHero from '@/pages/profile/ProfileHero';
import { Stats } from '@/pages/profile/Stats';
import { ProfileSocialLinks } from '@/pages/profile/ProfileSocialLinks';
import { MyVaultsList } from '@/components/vaults/MyVaultsList';
import { Claims } from '@/pages/profile/Claims';

export const Profile = () => (
  <div className="min-h-screen">
    <ProfileHero />
    <div className="flex flex-col gap-20">
      <Stats />
      <ProfileSocialLinks />
      <MyVaultsList />
      <Claims />
    </div>
  </div>
);
