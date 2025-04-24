import { createFileRoute } from '@tanstack/react-router';

const AboutComponent = () => (
  <div className="p-2">
    <h3>About</h3>
  </div>
);

export const Route = createFileRoute('/about')({
  component: AboutComponent,
});
