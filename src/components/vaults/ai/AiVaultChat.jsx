import { useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';

const bubbleClass = role =>
  role === 'user'
    ? 'self-end bg-orange-500/15 border border-orange-500/30 text-white'
    : 'self-start bg-steel-850 border border-steel-750 text-dark-100';

export const AiVaultChat = ({ messages, isSending, onSend }) => {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const submit = event => {
    event.preventDefault();
    onSend(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[70vh] rounded-lg border border-steel-750 bg-steel-900">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-lg px-4 py-3 whitespace-pre-wrap ${bubbleClass(message.role)}`}
          >
            {message.content}
          </div>
        ))}
        {isSending && (
          <div className="self-start flex items-center gap-2 text-dark-100 px-4 py-3">
            <Spinner size="sm" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="flex gap-3 border-t border-steel-750 p-4" onSubmit={submit}>
        <textarea
          className="flex-1 resize-none rounded-lg bg-steel-850 border border-steel-750 px-4 py-3 text-white outline-none focus:border-orange-500"
          disabled={isSending}
          maxLength={4000}
          placeholder="e.g. A public gaming NFT vault, 30% of tokens for acquirers, 7-day windows"
          rows={2}
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              submit(event);
            }
          }}
        />
        <PrimaryButton className="self-stretch px-6" disabled={isSending || !input.trim()} onClick={submit}>
          <SendHorizonal className="w-5 h-5" />
        </PrimaryButton>
      </form>
    </div>
  );
};
