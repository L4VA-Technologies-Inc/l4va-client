import { createFileRoute } from '@tanstack/react-router';
import { Contribute } from '@/pages/Contribute';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ContributeComponent = () => (
  <ProtectedRoute>
    <Contribute />
  </ProtectedRoute>
);

export const Route = createFileRoute('/contribute')({
  component: ContributeComponent,
});