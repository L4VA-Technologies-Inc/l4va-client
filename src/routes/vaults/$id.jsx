import { createFileRoute } from '@tanstack/react-router';
import { Vault } from '@/pages/Vault';

const VaultComponent = () => (
  <Vault />
);

export const Route = createFileRoute('/vaults/$id')({
  component: VaultComponent,
});