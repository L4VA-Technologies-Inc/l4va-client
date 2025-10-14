import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
} from 'stream-chat-react';

const VaultChannelHeader = ({ vault }) => {
  return (
    <div
      className="flex items-center px-4 py-3 border-b"
      style={{
        backgroundColor: '#2D3049',
        borderBottomColor: '#40444b',
      }}
    >
      {vault?.image && <img src={vault.image} alt={vault.name || 'Vault'} className="w-6 h-6 rounded-full mr-3" />}
      <div className="flex items-center">
        <span className="text-white font-semibold text-base mr-2">#</span>
        <h3 className="text-white font-semibold text-base">{vault?.name || 'vault-chat'}</h3>
      </div>
    </div>
  );
};

import { useAuth } from '@/lib/auth/auth.js';
import 'stream-chat-react/dist/css/v2/index.css';
import './dark-theme.css';

const darkThemeStyles = {
  '--str-chat__primary-color': '#2D3049',
  '--str-chat__active-primary-color': '#2D3049',
  '--str-chat__surface-color': '#2D3049',
  '--str-chat__secondary-surface-color': '#2D3049',
  '--str-chat__primary-surface-color': '#2D3049',
  '--str-chat__primary-surface-color-low-emphasis': '#2D3049',

  '--str-chat__background-color': '#2D3049',
  '--str-chat__channel-header-background-color': '#2D3049',
  '--str-chat__message-list-background-color': '#2D3049',
  '--str-chat__message-input-background-color': '#2D3049',
  '--str-chat__thread-background-color': '#2D3049',

  '--str-chat__color-text-high-emphasis': '#ffffff',
  '--str-chat__color-text-mid-emphasis': '#b9bbbe',
  '--str-chat__color-text-low-emphasis': '#72767d',
  '--str-chat__color-text-inverse': '#000000',

  '--str-chat__message-background-color': 'transparent',
  '--str-chat__message-background-color-hover': 'rgba(79, 84, 92, 0.16)',
  '--str-chat__message-own-background-color': 'transparent',
  '--str-chat__message-text-color': '#dcddde',

  '--str-chat__color-bg-input': '#40444b',
  '--str-chat__color-bg-input-hover': '#484c52',
  '--str-chat__color-bg-input-focus': '#484c52',
  '--str-chat__input-background-color': '#40444b',
  '--str-chat__input-border-color': '#40444b',
  '--str-chat__input-text-color': '#ffffff',
  '--str-chat__input-placeholder-color': '#72767d',

  '--str-chat__color-border': '#40444b',
  '--str-chat__border-color': '#40444b',
  '--str-chat__separator-color': '#40444b',

  '--str-chat__color-bg-overlay': 'rgba(0, 0, 0, 0.85)',
  '--str-chat__modal-background-color': '#2f3136',

  '--str-chat__border-radius-circle': '50%',
  '--str-chat__border-radius-sm': '4px',
  '--str-chat__border-radius-md': '8px',
  '--str-chat__border-radius-lg': '16px',

  '--str-chat__avatar-background-color': '#5865f2',
  '--str-chat__date-separator-color': '#72767d',
  '--str-chat__quoted-message-background-color': '#32353b',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-950 text-white">
        <LoadingIndicator size={40} />
        <span className="ml-2">Loading chat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-950 border border-red-800 rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-2">⚠️ Something went wrong</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-950 text-white">
        <div>Initializing chat...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] dark-theme" style={darkThemeStyles}>
      <Chat client={client} theme="dark">
        <Channel channel={channel}>
          <Window>
            <VaultChannelHeader vault={vault} />
            <MessageList />
            <MessageInput focus={true} grow={true} maxRows={4} />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default VaultChat;
