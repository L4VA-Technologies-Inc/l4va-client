import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PanelRightClose, PanelRightOpen, SendHorizonal, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { AiVaultImageCard } from './AiVaultImageCard';
import { AiVaultImageGenerator } from './AiVaultImageGenerator';
import { validateImageFile } from './aiVault.utils';

import PrimaryButton from '@/components/shared/PrimaryButton';

// Options arrive as { label, value }; plain strings are tolerated for transcripts persisted
// before the assistant started returning structured options.
const normalizeOption = option => (typeof option === 'string' ? { label: option, value: option } : option);

// Suggestion chips, not form buttons: pill-shaped so they read as quick replies, not settings.
const OptionButtons = ({ options, onSelect, disabled, stacked }) => (
  <div className={`flex flex-wrap gap-2 ${stacked ? 'flex-col items-start' : ''}`}>
    {options.map(normalizeOption).map((option, index) => (
      <button
        key={index}
        onClick={() => onSelect(option)}
        disabled={disabled}
        className={`rounded-full border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition-[background-color,border-color,transform] duration-150 ease-out hover:border-orange-500 hover:bg-orange-500/20 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${stacked ? 'w-full text-left' : ''}`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

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

const AssistantAvatar = () => (
  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-gradient">
    <Sparkles className="h-3.5 w-3.5 text-slate-950" />
  </div>
);

const TypingIndicator = () => (
  <motion.div
    animate={{ opacity: 1 }}
    className="flex items-center gap-3"
    initial={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <AssistantAvatar />
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map(dot => (
        <motion.span
          key={dot}
          animate={{ opacity: [0.3, 1, 0.3] }}
          className="h-1.5 w-1.5 rounded-full bg-dark-100"
          transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);

// Intent is the assistant's job: it decides when to request the launch_vault tool, the backend
// validates it, and the confirmation arrives as a structured action. Nothing here reads the text.
export const AiVaultChat = ({
  messages,
  isSending,
  isGeneratingImage,
  isUploadingImage,
  isPreviewOpen,
  onSend,
  onOptionSelect,
  onStartImageGeneration,
  onGenerateImage,
  onUploadImage,
  onTogglePreview,
}) => {
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState('');
  const isImageBusy = isGeneratingImage || isUploadingImage;
  // The image belongs to the vault, not to a single message, so only the newest card can replace it.
  const lastImageIndex = messages.reduce(
    (last, message, index) => (message.attachment?.type === 'vault-image' ? index : last),
    -1
  );

  const lastMessage = messages[messages.length - 1];
  const isStreamingAssistant = isSending && lastMessage?.role === 'assistant';
  const showThinking = isSending && (!isStreamingAssistant || !lastMessage.content);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: isStreamingAssistant ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, isSending, isStreamingAssistant]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    onUploadImage(file);
  };

  // The image actions are handled here rather than sent as a reply — they open UI, not conversation.
  const handleOptionSelect = option => {
    if (option.value === 'generate_image') {
      onStartImageGeneration();
      return;
    }
    if (option.value === 'upload_image') {
      openFilePicker();
      return;
    }
    onOptionSelect?.(option);
  };

  const submit = event => {
    event.preventDefault();
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '';
    }
  };

  return (
    <div className="relative flex h-[calc(100dvh-220px)] max-h-[860px] min-h-[560px] flex-col">
      <div className="flex shrink-0 items-center justify-end pb-2">
        <button
          className="rounded-lg p-2 text-dark-100 transition-[color,background-color,transform] duration-150 ease-out hover:bg-steel-850 hover:text-white active:scale-90"
          title={isPreviewOpen ? 'Hide settings' : 'Show settings'}
          type="button"
          onClick={onTogglePreview}
        >
          {isPreviewOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 sm:px-2">
          {messages.map((message, index) => {
            const isLiveAssistant = isStreamingAssistant && index === messages.length - 1;
            if (isLiveAssistant && !message.content) {
              return null;
            }
            const isUser = message.role === 'user';

            return (
              <motion.div
                key={`${message.role}-${index}`}
                animate={{ opacity: 1, y: 0 }}
                className={isUser ? 'flex justify-end' : 'flex gap-3'}
                initial={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              >
                {!isUser && <AssistantAvatar />}
                <div
                  className={
                    isUser
                      ? 'max-w-[75%] rounded-3xl bg-steel-850 px-4 py-2.5 text-[15px] leading-relaxed text-white'
                      : 'min-w-0 flex-1 space-y-3 pt-0.5 text-[15px] leading-relaxed text-dark-100'
                  }
                >
                  {isLiveAssistant ? (
                    <p className="whitespace-pre-wrap">
                      {message.content}
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-400 align-text-bottom" />
                    </p>
                  ) : (
                    renderMessageContent(message.content)
                  )}
                  {message.widget?.type === 'image-generator' && !isLiveAssistant && (
                    <AiVaultImageGenerator
                      isGenerating={isGeneratingImage}
                      isReplacing={message.widget.isReplacing}
                      prompt={message.widget.prompt}
                      onGenerate={onGenerateImage}
                    />
                  )}
                  {message.attachment?.type === 'vault-image' && !isLiveAssistant && (
                    <AiVaultImageCard
                      isBusy={isImageBusy}
                      isCurrent={index === lastImageIndex}
                      url={message.attachment.url}
                      onRegenerate={onStartImageGeneration}
                      onUpload={openFilePicker}
                    />
                  )}
                  {message.options?.length > 0 && !isLiveAssistant && (index !== 0 || messages.length === 1) && (
                    <OptionButtons
                      stacked={index === 0}
                      options={message.options}
                      onSelect={handleOptionSelect}
                      disabled={isSending || isImageBusy}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
          {showThinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
        {/* Fades the last bit of content under the floating composer instead of a hard divider. */}
        <div className="pointer-events-none sticky bottom-0 -mt-10 h-10 bg-gradient-to-t from-primary-background to-transparent" />
      </div>

      <input accept="image/*" className="hidden" ref={fileInputRef} type="file" onChange={handleFileChange} />
      <form className="shrink-0 pt-1" onSubmit={submit}>
        <div className="mx-auto w-full max-w-[720px] px-4 sm:px-2">
          <div className="relative flex items-end gap-2 rounded-[26px] border border-steel-750 bg-steel-850/90 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-md transition-colors duration-150 focus-within:border-orange-500/60">
            <textarea
              ref={textareaRef}
              autoFocus
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-white outline-none placeholder:text-dark-100"
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
              className="mb-0.5 h-9 w-9 shrink-0 rounded-full p-0"
              disabled={isSending || !input.trim()}
              onClick={submit}
              title="Send message"
            >
              <SendHorizonal className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
};
