import { createFileRoute } from '@tanstack/react-router';

import { Sandbox } from '@/pages/Sandbox';

const SandboxComponent = () => (
  <Sandbox />
);

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});