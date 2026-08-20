import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';

const bubbleClass = role =>
  role === 'user'
    ? 'self-end bg-orange-500/15 border border-orange-500/30 text-white'
    : 'self-start bg-steel-850 border border-steel-750 text-dark-100';

// Renders **bold**, `code` and inline text, splitting on the markers so no dangerouslySetInnerHTML is needed.
const renderInline = text =>
  text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="rounded bg-steel-750 px-1.5 py-0.5 text-sm text-orange-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

// Minimal markdown renderer for chat messages: supports paragraphs and "- " bullet lists.
const renderMessageContent = content => {
  const lines = content.split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5">
          {listItems.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      return;
    }
    flushList();
    if (trimmed) {
      blocks.push(<p key={`line-${index}`}>{renderInline(trimmed)}</p>);
    }
  });
  flushList();

  return <div className="flex flex-col gap-2">{blocks}</div>;
};

export const AiVaultChat = ({ messages, isSending, onSend }) => {
  const [input, setInput] = useState('');

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
            className={`max-w-[85%] rounded-lg px-4 py-3 ${bubbleClass(message.role)}`}
          >
            {renderMessageContent(message.content)}
          </div>
        ))}
        {isSending && (
          <div className="self-start flex items-center gap-2 text-dark-100 px-4 py-3">
            <Spinner size="sm" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}
      </div>
      <form className="flex gap-3 border-t border-steel-750 p-4" onSubmit={submit}>
        <textarea
          className="flex-1 resize-none rounded-lg bg-steel-850 border border-steel-750 px-4 py-3 text-white outline-none focus:border-orange-500"
          disabled={isSending}
          maxLength={4000}
          placeholder="Ask L4VA AI"
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
