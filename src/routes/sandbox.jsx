import { createFileRoute } from '@tanstack/react-router';

const SandboxComponent = () => {
  return <div className="min-h-screen flex items-center justify-center">swap</div>;
};

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
