import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rewards/epochs/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/rewards/epochs/$id"!</div>;
}
