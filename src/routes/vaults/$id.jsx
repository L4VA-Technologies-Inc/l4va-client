import { createFileRoute } from '@tanstack/react-router';
import { Vault } from '@/pages/Vault';

function VaultComponent() {
  return <Vault />;
}

export const Route = createFileRoute('/vaults/$id')({
  component: VaultComponent,
});