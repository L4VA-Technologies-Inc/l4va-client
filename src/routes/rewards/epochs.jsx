import { createFileRoute, Outlet } from '@tanstack/react-router';

const EpochsLayout = () => <Outlet />;

export const Route = createFileRoute('/rewards/epochs')({
  component: EpochsLayout,
});
