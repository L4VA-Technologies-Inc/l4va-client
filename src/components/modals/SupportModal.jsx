import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';
import { LavaSteelTextarea } from '@/components/shared/LavaTextarea.jsx';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { Spinner } from '@/components/Spinner';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';
import { CoreApiProvider } from '@/services/api/core';

const DISCORD_URL = 'https://discord.com/invite/mBbTUfAzuS';
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SupportModal = () => {
  const { closeModal } = useModalControls();
  const { user } = useAuth();
  const { network } = useNetwork();
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  // Honeypot: hidden from people, filled in by form bots.
  const [website, setWebsite] = useState('');
  const [isSending, setIsSending] = useState(false);

  const trimmedMessage = message.trim();
  const canSend = EMAIL_REGEX.test(email.trim()) && trimmedMessage.length >= MIN_MESSAGE_LENGTH && !isSending;

  const handleSend = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      toast.error('Please enter a valid email so we can reply');
      return;
    }
    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      toast.error(`Please describe your question (at least ${MIN_MESSAGE_LENGTH} characters)`);
      return;
    }

    setIsSending(true);
    try {
      await CoreApiProvider.sendSupportRequest({
        email: email.trim(),
        message: trimmedMessage,
        walletAddress: user?.address || undefined,
        chain: network,
        pageUrl: window.location.href,
        website: website || undefined,
      });
      toast.success("Thanks! We'll reply to your email soon.", { duration: 6000 });
      closeModal();
    } catch (error) {
      const status = error?.response?.status;
      toast.error(
        status === 429
          ? 'Too many requests — please try again later'
          : error?.response?.data?.message || 'Could not send your message, please try again'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ModalWrapper isOpen title="Support" onClose={closeModal} size="md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-dark-100">
          Ask us anything about vaults, tokens or your wallet. The L4VA team will reply to your email.
        </p>
        <LavaSteelInput
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
          value={email}
          onChange={setEmail}
        />
        <LavaSteelTextarea
          label="Message"
          maxLength={MAX_MESSAGE_LENGTH}
          name="message"
          placeholder="Describe your question or issue. Include the vault name or transaction if relevant."
          required
          value={message}
          onChange={setMessage}
        />
        <input
          aria-hidden="true"
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
          tabIndex={-1}
          type="text"
          value={website}
          onChange={e => setWebsite(e.target.value)}
        />
        <PrimaryButton className="w-full" disabled={!canSend} onClick={handleSend}>
          {isSending ? <Spinner /> : <Send size={18} />}
          {isSending ? 'Sending…' : 'Send'}
        </PrimaryButton>
        <p className="text-xs text-dark-100 text-center">
          Prefer chatting with the community?{' '}
          <a className="text-orange-500 hover:underline" href={DISCORD_URL} rel="noopener noreferrer" target="_blank">
            Join our Discord
          </a>
        </p>
      </div>
    </ModalWrapper>
  );
};
