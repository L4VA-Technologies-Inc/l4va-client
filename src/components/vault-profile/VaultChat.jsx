import { lazy, Suspense } from 'react';

const LazyVaultChat = lazy(() =>
  import('@/components/chat/VaultChat').catch(error => {
    console.error('Failed to load VaultChat:', error);
    return {
      default: () => (
        <div className="p-6 text-center">
          <div className="text-red-400 mb-2">⚠️ Failed to load chat</div>
          <div className="text-steel-400 text-sm">Please refresh the page to try again</div>
        </div>
      ),
    };
  })
);

export const VaultChatWrapper = ({ vault }) => {
  return (
    <Suspense fallback={<div className="p-6 text-dark-100">Loading chat…</div>}>
      <LazyVaultChat vault={vault} apiKey={import.meta.env.VITE_STREAM_API_KEY} />
    </Suspense>
  );
};

export default VaultChatWrapper;
