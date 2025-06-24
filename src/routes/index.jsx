import { createFileRoute } from '@tanstack/react-router';

import { Home } from '@/pages/home';

const HomeComponent = () => <Home />;

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
