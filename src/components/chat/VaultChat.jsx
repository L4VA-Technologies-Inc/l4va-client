import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Channel, Chat, LoadingIndicator, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import { EmojiPicker } from 'stream-chat-react/emojis';

import { useAuth } from '@/lib/auth/auth.js';
import 'stream-chat-react/dist/css/v2/index.css';

const VaultChannelHeader = ({ vault }) => {
  return (
    <div className="flex items-center px-4 py-3 bg-steel-850">
      {vault?.image && <img src={vault.image} alt={vault.name || 'Vault'} className="w-6 h-6 rounded-full mr-3" />}
      <div className="flex items-center">
        <span className="text-white font-semibold text-base mr-2">#</span>
        <h3 className="text-white font-semibold text-base">{vault?.name || 'vault-chat'}</h3>
      </div>
    </div>
  );
};

const VaultChat = ({ vault, vaultId, apiKey }) => {
  const actualVaultId = vault?.id || vaultId;
  const actualApiKey = apiKey || import.meta.env.VITE_STREAM_API_KEY;
  const vaultImage = vault?.image || vault?.avatar || null;
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = user?.id || 'anonymous';
  const userName = user?.name || user?.username || 'Anonymous User';

  const scrollToBottom = () => {
    const messageList = document.querySelector('.str-chat__message-list-scroll');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  };

  useEffect(() => {
    if (channel) {
      const handleNewMessage = () => {
        setTimeout(scrollToBottom, 100);
      };

      channel.on('message.new', handleNewMessage);

      return () => {
        channel.off('message.new', handleNewMessage);
      };
    }
  }, [channel]);

  useEffect(() => {
    const initChat = async () => {
      if (!actualVaultId || !actualApiKey) {
        setError('Missing required parameters: vaultId or apiKey');
        setLoading(false);
        return;
      }

      if (actualApiKey === 'your-stream-api-key') {
        setError('Need to set real Stream API key instead of placeholder');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userResponse = await fetch(`/api/v1/chat/user/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userName,
            image: user?.avatar || `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
            role: 'user',
          }),
        });

        if (!userResponse.ok) {
          const userError = await userResponse.text();
          throw new Error(`${userError}`);
        }

        const tokenResponse = await fetch(`/api/v1/chat/token/${userId}`);

        if (!tokenResponse.ok) {
          const tokenError = await tokenResponse.text();
          throw new Error(`${tokenError}`);
        }

        const tokenData = await tokenResponse.json();
        const { token } = tokenData;

        const chatClient = StreamChat.getInstance(actualApiKey);

        const userData = {
          id: userId,
          name: userName,
          image: user?.avatar || `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
        };

        try {
          await chatClient.connectUser(userData, token);
        } catch (connectError) {
          throw new Error(`${connectError.message}`);
        }

        const channelResponse = await fetch(`/api/v1/chat/vault/${actualVaultId}/channel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            createdByUserId: userId,
          }),
        });

        if (!channelResponse.ok) {
          const channelError = await channelResponse.text();
          throw new Error(`${channelResponse.status} - ${channelError}`);
        }

        const chatChannel = chatClient.channel('messaging', `vault-${actualVaultId}`, {
          name: vault?.name || `Vault ${actualVaultId} Chat`,
          vault_id: actualVaultId,
          image: vaultImage,
          vault_name: vault?.name,
          vault_description: vault?.description,
          members: [userId],
        });

        await chatChannel.watch();

        try {
          await chatChannel.addMembers([userId]);
        } catch (memberError) {
          console.log('User already a member or error adding:', memberError);
        }

        setClient(chatClient);
        setChannel(chatChannel);

        setTimeout(scrollToBottom, 500);
      } catch (error) {
        setError(`${error}`);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      // Cleanup will be handled by the component unmount
    };
  }, [actualVaultId, userId, userName, actualApiKey, user?.avatar, vault?.name, vault?.description, vaultImage]);

  return (
    <div className="min-h-[600px] h-[600px] rounded-xl border border-steel-850 text-white flex items-center justify-center overflow-hidden">
      {loading ? (
        <>
          <LoadingIndicator size={40} />
          <span className="ml-2">Loading chat...</span>
        </>
      ) : error ? (
        <div className="text-center max-w-md border border-red-800 rounded-lg p-4">
          <div className="text-red-400 mb-2">⚠️ Something went wrong</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      ) : !client || !channel ? (
        <div>Initializing chat...</div>
      ) : (
        <div className="w-full h-full">
          <Chat client={client} className="w-full h-full">
            <Channel channel={channel} EmojiPicker={EmojiPicker}>
              <Window>
                <VaultChannelHeader vault={vault} />
                <MessageList />
                <MessageInput grow={true} maxRows={4} />
              </Window>
              <Thread className="w-full h-full" />
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
};

export default VaultChat;
