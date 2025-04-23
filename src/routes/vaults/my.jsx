import { createFileRoute } from '@tanstack/react-router';
import { MyVaults } from '@/pages/MyVaults';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const MyVaultsComponent = () => (
  <ProtectedRoute>
    <MyVaults />
  </ProtectedRoute>
);

export const Route = createFileRoute('/vaults/my')({
  component: MyVaultsComponent,
});