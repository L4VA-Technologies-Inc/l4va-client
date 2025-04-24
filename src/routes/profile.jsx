import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/pages/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ProfileComponent = () => (
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
);

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
});