import { createFileRoute } from '@tanstack/react-router';

import { MyVaults } from '@/pages/MyVaults';

const VaultsComponent = () => <MyVaults />;

export const Route = createFileRoute('/vaults/')({
  component: VaultsComponent,
});
