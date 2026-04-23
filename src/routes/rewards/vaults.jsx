import { createFileRoute, Outlet } from '@tanstack/react-router';

const VaultsLayout = () => <Outlet />;

export const Route = createFileRoute('/rewards/vaults')({
  component: VaultsLayout,
});
