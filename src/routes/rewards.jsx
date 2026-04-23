import { createFileRoute, Outlet } from '@tanstack/react-router';

const RewardsLayout = () => <Outlet />;

export const Route = createFileRoute('/rewards')({
  component: RewardsLayout,
});
