import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/pages/Home';

const HomeComponent = () => (
  <div className="p-2">
    <Home />
  </div>
);

export const Route = createFileRoute('/')({
  component: HomeComponent,
});