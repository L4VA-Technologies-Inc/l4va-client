import ProfileHero from '@/pages/profile/ProfileHero';
import { Stats } from '@/pages/profile/Stats';
import { ProfileSocialLinks } from '@/pages/profile/ProfileSocialLinks';
import { MyVaultsList } from '@/components/vaults/MyVaultsList';
import { Claims } from '@/pages/profile/Claims';
import { PendingTransactions } from '@/components/PendingTransactions';

export const Profile = () => (
  <div className="min-h-screen">
    <ProfileHero />
    <div className="flex flex-col gap-20">
      <Stats />
      <ProfileSocialLinks />
      <MyVaultsList />
      <Claims />
      <PendingTransactions />
    </div>
  </div>
);
