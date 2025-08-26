import { createFileRoute } from '@tanstack/react-router';

function SandboxComponent() {
  return <div>sandbox</div>;
}

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
