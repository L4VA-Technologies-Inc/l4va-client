import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rewards/vaults/$vaultId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/rewards/vaults/$vaultId"!</div>;
}
