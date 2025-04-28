import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/pages/Profile';

const ProfileComponent = () => <Profile />;

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
});