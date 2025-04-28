import { createFileRoute } from '@tanstack/react-router';
import { CreateVault } from '@/pages/CreateVault';

const CreateComponent = () => <CreateVault />;

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});