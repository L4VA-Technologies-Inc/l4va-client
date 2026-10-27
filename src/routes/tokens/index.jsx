import { createFileRoute } from '@tanstack/react-router';

import { TokensPage } from '@/pages/tokens/TokensPage';

export const Route = createFileRoute('/tokens/')({
  component: TokensPage,
});
