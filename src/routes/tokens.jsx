import { createFileRoute, Outlet } from '@tanstack/react-router';

const TokensLayout = () => <Outlet />;

export const Route = createFileRoute('/tokens')({
  component: TokensLayout,
});
