import { createFileRoute } from '@tanstack/react-router';
import { CreateVault } from '@/pages/CreateVault';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CreateComponent = () => (
  <ProtectedRoute>
    <CreateVault />
  </ProtectedRoute>
);

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});