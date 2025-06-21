import { createFileRoute } from '@tanstack/react-router';

import Test from '@/components/Test';

const SandboxComponent = () => <Test />;

export const Route = createFileRoute('/sandbox')({
  component: SandboxComponent,
});
