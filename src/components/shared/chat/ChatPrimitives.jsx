import { useEffect, useRef } from 'react';
import { SendHorizonal } from 'lucide-react';

import PrimaryButton from '@/components/shared/PrimaryButton';

// Building blocks shared by the AI vault chat and the support chat, so both read as one product.

export const CHAT_USER_BUBBLE =
  'max-w-[75%] rounded-3xl bg-steel-850 px-4 py-2.5 text-[15px] leading-relaxed text-white';
export const CHAT_OTHER_TEXT = 'min-w-0 flex-1 space-y-3 pt-0.5 text-[15px] leading-relaxed text-dark-100';

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

/** Minimal markdown for chat messages: paragraphs and "- " bullet lists. */
export const ChatMarkdown = ({ content }) => {
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

  return <div className="flex flex-col gap-2 break-words">{blocks}</div>;
};

export const ChatAvatar = ({ icon: Icon }) => (
  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-gradient">
    <Icon className="h-3.5 w-3.5 text-slate-950" />
  </div>
);

/** Floating pill composer: auto-growing textarea, Enter sends, Shift+Enter adds a line. */
export const ChatComposer = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  canSend = true,
  placeholder,
  maxLength = 4000,
  autoFocus = false,
}) => {
  const textareaRef = useRef(null);

  // Shrink back to one line once the parent clears the draft after sending.
  useEffect(() => {
    if (!value && textareaRef.current) textareaRef.current.style.height = '';
  }, [value]);

  // A disabled textarea can't take autofocus, so grab it once the composer becomes usable.
  useEffect(() => {
    if (autoFocus && !disabled) textareaRef.current?.focus();
  }, [autoFocus, disabled]);

  const submit = event => {
    event.preventDefault();
    if (disabled || !canSend || !value.trim()) return;
    onSubmit();
  };

  return (
    <form onSubmit={submit}>
      <div className="relative flex items-end gap-2 rounded-[26px] border border-steel-750 bg-steel-850/90 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-md transition-colors duration-150 focus-within:border-orange-500/60">
        <textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-white outline-none placeholder:text-dark-100"
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={1}
          value={value}
          onChange={event => {
            const textarea = event.currentTarget;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
            onChange(textarea.value);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              submit(event);
            }
          }}
        />
        <PrimaryButton
          aria-label="Send message"
          className="mb-0.5 h-9 w-9 shrink-0 rounded-full p-0"
          disabled={disabled || !canSend || !value.trim()}
          onClick={submit}
          title="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </PrimaryButton>
      </div>
    </form>
  );
};
