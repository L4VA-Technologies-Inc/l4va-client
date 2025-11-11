import { createFileRoute, useParams } from '@tanstack/react-router';

import { Profile } from '@/pages/profile/index.jsx';

const ProfileComponent = () => {
  const userId = useParams({
    from: '/profile/$id',
    select: p => p.id,
  });

  return <Profile userId={userId} isEditable={false} />;
};

export const Route = createFileRoute('/profile/$id')({
  component: ProfileComponent,
});
