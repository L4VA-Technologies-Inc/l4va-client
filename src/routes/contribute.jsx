import { createFileRoute } from '@tanstack/react-router';
import { Contribute } from '@/pages/Contribute';

const ContributeComponent = () => <Contribute />;

export const Route = createFileRoute('/contribute')({
  component: ContributeComponent,
});