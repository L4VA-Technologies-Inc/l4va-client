import ProfileHero from '@/pages/profile/ProfileHero';
import { Stats } from '@/pages/profile/Stats';
import { ProfileSocialLinks } from '@/pages/profile/ProfileSocialLinks';
import { MyVaultsList } from '@/components/vaults/MyVaultsList';

export const Profile = () => (
  <>
    <ProfileHero />
    <div className="container mx-auto">
      <div className="flex flex-col gap-20">
        <Stats />
        <ProfileSocialLinks />
        <MyVaultsList />
      </div>
    </div>
  </>
);
