import VaultChat from '@/components/chat/VaultChat';

export const VaultChatWrapper = ({ vault }) => {
  return (
    <div className="h-full bg-gray-900">
      <VaultChat vault={vault} apiKey={import.meta.env.VITE_STREAM_API_KEY} />
    </div>
  );
};

export default VaultChatWrapper;
