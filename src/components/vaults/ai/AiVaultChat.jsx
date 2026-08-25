import { useEffect, useRef, useState } from 'react';
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
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const [input, setInput] = useState('');

  const lastMessage = messages[messages.length - 1];
  const isStreamingAssistant = isSending && lastMessage?.role === 'assistant';
  const showThinking = isSending && (!isStreamingAssistant || !lastMessage.content);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: isStreamingAssistant ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, isSending, isStreamingAssistant]);

  const submit = event => {
    event.preventDefault();
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '';
    }
  };

  return (
    <div className="flex flex-col h-[70vh] rounded-lg border border-steel-750 bg-steel-900">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((message, index) => {
          const isLiveAssistant = isStreamingAssistant && index === messages.length - 1;
          if (isLiveAssistant && !message.content) {
            return null;
          }

          return (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-lg px-4 py-3 ${bubbleClass(message.role)}`}
            >
              {isLiveAssistant ? (
                <p className="whitespace-pre-wrap">
                  {message.content}
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-400 align-text-bottom" />
                </p>
              ) : (
                renderMessageContent(message.content)
              )}
            </div>
          );
        })}
        {showThinking && (
          <div className="self-start flex items-center gap-2 text-dark-100 px-4 py-3">
            <Spinner size="sm" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form className="border-t border-steel-750" onSubmit={submit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full resize-none rounded-sm bg-steel-850 border border-steel-750 px-5 py-4 pr-16 text-white outline-none focus:border-orange-500"
            disabled={isSending}
            maxLength={4000}
            placeholder="Ask L4VA AI"
            rows={1}
            value={input}
            onChange={event => {
              const textarea = event.currentTarget;
              textarea.style.height = 'auto';
              textarea.style.height = `${textarea.scrollHeight}px`;
              setInput(textarea.value);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                submit(event);
              }
            }}
          />
          <PrimaryButton
            aria-label="Send message"
            className="absolute bottom-3.5 right-4 h-10 w-10 rounded-full p-0"
            disabled={isSending || !input.trim()}
            onClick={submit}
            title="Send message"
          >
            <SendHorizonal className="h-5 w-5" />
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};
