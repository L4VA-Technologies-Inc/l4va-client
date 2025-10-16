import VaultChat from '@/components/chat/VaultChat';

export const VaultChatWrapper = ({ vault }) => {
  return <VaultChat vault={vault} apiKey={import.meta.env.VITE_STREAM_API_KEY} />;
};

export default VaultChatWrapper;
