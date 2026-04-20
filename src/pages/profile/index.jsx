import { useSearch } from '@tanstack/react-router';

import ProfileHero from '@/pages/profile/ProfileHero';
import { Stats } from '@/pages/profile/Stats';
import { ProfileSocialLinks } from '@/pages/profile/ProfileSocialLinks';
import { MyVaultsList } from '@/components/vaults/MyVaultsList';
import { Claims } from '@/pages/profile/Claims';
import { useAuth } from '@/lib/auth/auth.js';
import { usePublicProfile } from '@/services/api/queries.js';
import { Spinner } from '@/components/Spinner.jsx';
import { UserPublicVaultsList } from '@/components/vaults/UserPublicVaultsList.jsx';
import { Transactions } from '@/pages/profile/Transactions.jsx';

export const Profile = ({ userId, isEditable }) => {
  const { user } = useAuth();
  const { data: publicData, isLoading } = usePublicProfile(userId);
  const search = useSearch({
    from: userId ? '/profile/$id' : '/profile/',
  });

  const userData = userId ? publicData?.data : user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-100">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ProfileHero user={userData} isEditable={isEditable} />
      <div className="flex flex-col gap-20">
        <Stats user={userData} />
        <ProfileSocialLinks user={userData} isEditable={isEditable} />
        {userId && <UserPublicVaultsList ownerId={userId} />}
        {!userId && <MyVaultsList initialTab={search?.tab} />}
        {!userId && <Claims />}
        {!userId && <Transactions />}
      </div>
    </div>
  );
};
