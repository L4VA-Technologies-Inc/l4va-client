import { createFileRoute } from '@tanstack/react-router';
import { MyVaults } from '@/pages/MyVaults';

const MyVaultsComponent = () => <MyVaults />;

export const Route = createFileRoute('/vaults/my')({
  component: MyVaultsComponent,
});