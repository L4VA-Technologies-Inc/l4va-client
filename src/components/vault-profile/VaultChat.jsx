import { lazy, Suspense } from 'react';

const LazyVaultChat = lazy(() => import('@/components/chat/VaultChat'));

export const VaultChatWrapper = ({ vault }) => {
  return (
    <Suspense fallback={<div className="p-6 text-dark-100">Loading chat…</div>}>
      <LazyVaultChat vault={vault} apiKey={import.meta.env.VITE_STREAM_API_KEY} />
    </Suspense>
  );
};

export default VaultChatWrapper;
