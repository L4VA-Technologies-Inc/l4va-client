import { createFileRoute, Navigate, useParams } from '@tanstack/react-router';

import { TokenDetailPage } from '@/pages/tokens/TokenDetailPage';

function TokenDetailRoute() {
  const id = useParams({
    from: '/tokens/$id',
    select: params => params.id,
  });

  if (!id) {
    return <Navigate replace to="/tokens" />;
  }

  return <TokenDetailPage tokenId={id} />;
}

export const Route = createFileRoute('/tokens/$id')({
  component: TokenDetailRoute,
});
