import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy } from 'lucide-react';
import toast from 'react-hot-toast';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { cn } from '@/lib/utils';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';
import { CoreApiProvider } from '@/services/api/core';
import {
  CHAT_OTHER_TEXT,
  CHAT_USER_BUBBLE,
  ChatAvatar,
  ChatComposer,
  ChatMarkdown,
} from '@/components/shared/chat/ChatPrimitives';

const DISCORD_URL = 'https://discord.com/invite/mBbTUfAzuS';
const MAX_MESSAGE_LENGTH = 2000;
const POLL_INTERVAL_MS = 5000;
const SUPPORT_TICKET_QUERY_KEY = ['support', 'ticket'];

const formatTime = iso =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const errorMessage = (error, fallback) =>
  error?.response?.status === 429
    ? error?.response?.data?.message || 'Too many messages — please wait a moment'
    : error?.response?.data?.message || fallback;

const MessageBubble = ({ message }) => {
  if (message.author === 'system') {
    return <p className="py-1 text-center text-xs text-dark-100">{message.content}</p>;
  }

  if (message.author === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className={cn(CHAT_USER_BUBBLE, 'whitespace-pre-wrap break-words')}>{message.content}</div>
        <span className="px-2 text-[11px] text-dark-100">{formatTime(message.createdAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <ChatAvatar icon={LifeBuoy} />
      <div className={CHAT_OTHER_TEXT}>
        <p className="text-[11px] text-dark-100">
          <span className="font-medium text-white">{message.authorName || 'L4VA team'}</span> · L4VA team ·{' '}
          {formatTime(message.createdAt)}
        </p>
        <ChatMarkdown content={message.content} />
      </div>
    </div>
  );
};

/**
 * In-app support chat. Each chat is a private ticket channel in the team Discord: messages typed here
 * appear there, and the team's replies there appear here (polled while the chat is open).
 */
export const SupportModal = () => {
  const { closeModal, openModal } = useModalControls();
  const { isAuthenticated } = useAuth();
  const { network } = useNetwork();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // After a closed chat the user can start over; until then the closed history stays visible.
  const [startingNew, setStartingNew] = useState(false);
  const listRef = useRef(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: SUPPORT_TICKET_QUERY_KEY,
    queryFn: async () => (await CoreApiProvider.getSupportTicket()).data.ticket,
    enabled: isAuthenticated,
    refetchInterval: query => (query.state.data?.status === 'open' ? POLL_INTERVAL_MS : false),
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  const isOpenChat = ticket?.status === 'open' && !startingNew;
  const showHistory = ticket && !startingNew;
  const messageCount = ticket?.messages?.length ?? 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messageCount, startingNew]);

  const handleSend = async () => {
    const message = draft.trim();
    if (!message || isSending) return;

    setIsSending(true);
    try {
      const { data } = isOpenChat
        ? await CoreApiProvider.sendSupportMessage(ticket.id, message)
        : await CoreApiProvider.openSupportTicket({ message, chain: network, pageUrl: window.location.href });
      queryClient.setQueryData(SUPPORT_TICKET_QUERY_KEY, data.ticket);
      setDraft('');
      setStartingNew(false);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not send your message, please try again'));
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async () => {
    if (!ticket || isClosing) return;
    setIsClosing(true);
    try {
      const { data } = await CoreApiProvider.closeSupportTicket(ticket.id);
      queryClient.setQueryData(SUPPORT_TICKET_QUERY_KEY, data.ticket);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not close the chat, please try again'));
    } finally {
      setIsClosing(false);
    }
  };

  const discordLink = (
    <p className="text-xs text-dark-100 text-center">
      Prefer chatting with the community?{' '}
      <a className="text-orange-500 hover:underline" href={DISCORD_URL} rel="noopener noreferrer" target="_blank">
        Join our Discord
      </a>
    </p>
  );

  if (!isAuthenticated) {
    return (
      <ModalWrapper isOpen title="Support" onClose={closeModal} size="md">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-dark-100">
            Log in with your wallet to chat with the L4VA team. Your conversation is saved to your account.
          </p>
          <PrimaryButton onClick={() => openModal('LoginModal')}>Log in</PrimaryButton>
          {discordLink}
        </div>
      </ModalWrapper>
    );
  }

  const title = isOpenChat ? `Support · #${String(ticket.number).padStart(4, '0')}` : 'Support';

  return (
    <ModalWrapper isOpen title={title} onClose={closeModal} size="md">
      <div className="flex flex-col gap-3">
        {/* Same fixed height while the ticket loads, so the modal doesn't jump; it just stays empty. */}
        <div ref={listRef} className="flex flex-col gap-5 h-[45vh] min-h-64 overflow-y-auto pr-1">
          {isLoading ? null : showHistory ? (
            ticket.messages.map(message => <MessageBubble key={message.id} message={message} />)
          ) : (
            <p className="m-auto max-w-xs text-center text-sm text-dark-100">
              Ask us anything about vaults, tokens or your wallet. The L4VA team replies right here
            </p>
          )}
          {isOpenChat && ticket.messages.every(message => message.author !== 'team') && (
            <p className="text-center text-xs text-dark-100 py-1">
              The team has your message and will reply here. You can close this window — the chat stays saved.
            </p>
          )}
        </div>

        {ticket?.status === 'closed' && !startingNew ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-dark-100">This chat is closed.</p>
            <PrimaryButton size="sm" onClick={() => setStartingNew(true)}>
              Start a new chat
            </PrimaryButton>
          </div>
        ) : (
          <>
            <ChatComposer
              autoFocus
              disabled={isSending || isLoading}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={isOpenChat ? 'Write a message…' : 'Describe your question or issue…'}
              value={draft}
              onChange={setDraft}
              onSubmit={handleSend}
            />
            {isOpenChat && (
              <button
                className="self-center text-xs text-dark-100 hover:text-orange-500 disabled:opacity-50"
                disabled={isClosing}
                type="button"
                onClick={handleClose}
              >
                {isClosing ? 'Closing…' : 'My issue is solved — close this chat'}
              </button>
            )}
          </>
        )}
        {discordLink}
      </div>
    </ModalWrapper>
  );
};
