import { createFileRoute } from '@tanstack/react-router';

import { ClaimsPage } from '@/pages/rewards/ClaimsPage';

export const Route = createFileRoute('/rewards/claims')({
  component: ClaimsPage,
});
