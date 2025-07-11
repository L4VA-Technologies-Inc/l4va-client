import { createFileRoute, Navigate } from '@tanstack/react-router';

import { Profile } from '@/pages/profile';
import { useAuth } from '@/lib/auth/auth';

const ProfileComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Profile />;
};

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
});
