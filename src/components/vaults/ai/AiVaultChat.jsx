import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  ImagePlus,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { AiVaultImageCard } from './AiVaultImageCard';
import { AiVaultImageGenerator } from './AiVaultImageGenerator';
import { validateImageFile } from './aiVault.utils';

import {
  CHAT_OTHER_TEXT,
  CHAT_USER_BUBBLE,
  ChatAvatar,
  ChatComposer,
  ChatMarkdown,
} from '@/components/shared/chat/ChatPrimitives';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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

// First sentence of the assistant's message, used as the card title (the full text stays in the thread).
const questionTitle = content => {
  const text = (content || '').trim();
  const match = text.match(/^[\s\S]*?[?](?=\s|$)/);
  return (match ? match[0] : text.split(/(?<=[.!])\s/)[0]).replace(/[*_`]/g, '');
};

// Pending question rendered in place of the composer (ChatGPT-style): numbered options plus a
// a free-text line. Closing it falls back to the normal composer.
const QuestionCard = ({ title, options, actions = [], disabled, onSelect, onSubmitText, onClose }) => {
  const [text, setText] = useState('');
  const items = options.map(normalizeOption);

  useEffect(() => {
    const onKey = event => {
      if (disabled || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const n = Number(event.key);
      if (n >= 1 && n <= items.length) onSelect(items[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, items, onSelect]);

  const submit = event => {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSubmitText(value);
    setText('');
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-steel-750 bg-steel-850/90 p-4 shadow-xl shadow-black/20 backdrop-blur-md"
      initial={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium text-white">{title}</p>
        <button
          aria-label="Close"
          className="-mr-1 -mt-1 rounded-full p-1.5 text-dark-100 transition-colors hover:bg-steel-750 hover:text-white"
          type="button"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-col">
        {items.map((option, index) => (
          <button
            key={index}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] text-white transition-colors hover:bg-steel-750/60 active:bg-steel-750 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            type="button"
            onClick={() => onSelect(option)}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-steel-750 text-xs text-dark-100">
              {index + 1}
            </span>
            {option.label}
          </button>
        ))}
        {/* Extra actions tied to the question (e.g. replace the image), styled like the options. */}
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] text-white transition-colors hover:bg-steel-750/60 active:bg-steel-750 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            type="button"
            onClick={onClick}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-steel-750 text-dark-100">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {label}
          </button>
        ))}
      </div>
      <form className="mt-1 flex items-center gap-3" onSubmit={submit}>
        <Pencil className="h-4 w-4 shrink-0 text-dark-100" />
        <input
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-white outline-none placeholder:text-dark-100 sm:text-[15px]"
          disabled={disabled}
          placeholder="Describe your own"
          value={text}
          onChange={event => setText(event.target.value)}
        />
        {text.trim() && (
          <button
            aria-label="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-gradient text-slate-950 transition-transform active:scale-90"
            disabled={disabled}
            type="submit"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </form>
    </motion.div>
  );
};

const AssistantAvatar = () => <ChatAvatar icon={Sparkles} />;

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
  canLaunch = false,
  isLaunching = false,
  onLaunch,
}) => {
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState('');
  const isImageBusy = isGeneratingImage || isUploadingImage;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // The image belongs to the vault, not to a single message, so only the newest card can replace it.
  const lastImageIndex = messages.reduce(
    (last, message, index) => (message.attachment?.type === 'vault-image' ? index : last),
    -1
  );

  const lastMessage = messages[messages.length - 1];
  const isStreamingAssistant = isSending && lastMessage?.role === 'assistant';
  const showThinking = isSending && (!isStreamingAssistant || !lastMessage.content);

  // The newest assistant question with options is answered from a card that replaces the composer.
  const [dismissedQuestion, setDismissedQuestion] = useState(-1);
  const lastIndex = messages.length - 1;
  // Options are attached once the streamed text is complete, so the card can appear while the draft
  // is still being validated; it stays disabled until that finishes.
  const pendingQuestion =
    lastMessage?.role === 'assistant' && lastMessage.options?.length > 0 && dismissedQuestion !== lastIndex
      ? lastMessage
      : null;

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

  const submit = () => {
    onSend(input);
    setInput('');
  };

  return (
    // Mobile: fixed-height screen; only the message list scrolls. Settings button sits left of the composer.
    <div className="relative flex min-h-0 flex-1 flex-col lg:max-h-[860px]">
      <div className="hidden shrink-0 items-center justify-end pb-2 lg:flex">
        <button
          className="rounded-lg p-2 text-dark-100 transition-[color,background-color,transform] duration-150 ease-out hover:bg-steel-850 hover:text-white active:scale-90"
          title={isPreviewOpen ? 'Hide settings' : 'Show settings'}
          type="button"
          onClick={onTogglePreview}
        >
          {isPreviewOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 sm:px-2">
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
                <div className={isUser ? CHAT_USER_BUBBLE : CHAT_OTHER_TEXT}>
                  {isLiveAssistant ? (
                    <p className="whitespace-pre-wrap">
                      {message.content}
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-400 align-text-bottom" />
                    </p>
                  ) : (
                    <ChatMarkdown content={message.content} />
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
                      isCurrent={index === lastImageIndex && !(pendingQuestion && index === lastIndex)}
                      url={message.attachment.url}
                      onRegenerate={onStartImageGeneration}
                      onUpload={openFilePicker}
                    />
                  )}
                  {message.options?.length > 0 &&
                    !isLiveAssistant &&
                    (index === lastIndex ? !pendingQuestion : index !== 0) && (
                      <OptionButtons
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
          <div ref={bottomRef} className="scroll-mb-32 lg:scroll-mb-0" />
        </div>
      </div>

      <input accept="image/*" className="hidden" ref={fileInputRef} type="file" onChange={handleFileChange} />
      <div className="z-20 shrink-0 pb-[max(12px,env(safe-area-inset-bottom))] pt-4 lg:static lg:pb-0 lg:pt-1">
        <div className="mx-auto w-full max-w-[720px] sm:px-2">
          {/* On mobile the draft lives in a closed sheet, so surface the launch right where the user is. */}
          {canLaunch && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 lg:hidden"
              initial={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            >
              <PrimaryButton className="w-full uppercase" disabled={isLaunching} onClick={onLaunch}>
                <Rocket className="h-4 w-4" />
                {isLaunching ? 'Launching...' : 'Ready · Confirm & launch'}
              </PrimaryButton>
            </motion.div>
          )}
          {/* A pending question replaces the composer; closing it brings the composer (and settings) back. */}
          {pendingQuestion ? (
            <QuestionCard
              key={lastIndex}
              disabled={isImageBusy || isSending}
              actions={
                pendingQuestion.attachment?.type === 'vault-image' && lastIndex === lastImageIndex
                  ? [
                      { label: 'Regenerate', icon: ImagePlus, onClick: onStartImageGeneration },
                      { label: 'Upload another', icon: Upload, onClick: openFilePicker },
                    ]
                  : []
              }
              options={pendingQuestion.options}
              title={questionTitle(pendingQuestion.content)}
              onClose={() => setDismissedQuestion(lastIndex)}
              onSelect={handleOptionSelect}
              onSubmitText={onSend}
            />
          ) : (
            <ChatComposer
              autoFocus={isDesktop}
              disabled={isSending}
              leading={
                <button
                  aria-label="Vault settings"
                  className="relative mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-dark-100 transition-[color,transform] duration-150 hover:text-white active:scale-90 lg:hidden"
                  type="button"
                  onClick={onTogglePreview}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  {canLaunch && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-orange-500" />}
                </button>
              }
              placeholder="Ask L4VA AI"
              suggestion={
                !isSending && lastMessage?.role === 'assistant' && !lastMessage.options?.length
                  ? lastMessage.suggestedReply
                  : null
              }
              value={input}
              onChange={setInput}
              onSubmit={submit}
            />
          )}
        </div>
      </div>
    </div>
  );
};
