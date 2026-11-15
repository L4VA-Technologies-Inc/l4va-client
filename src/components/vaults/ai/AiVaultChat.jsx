import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PanelRightClose, PanelRightOpen, Rocket, SlidersHorizontal, Sparkles } from 'lucide-react';
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
    // Mobile: the page itself scrolls and the composer sticks to the bottom (like ChatGPT), so there is
    // no scroll area nested inside a scrolling page. Desktop keeps the fixed-height panel.
    <div className="relative flex flex-1 flex-col lg:h-[calc(100dvh-220px)] lg:max-h-[860px] lg:min-h-[560px]">
      {/* Mobile: pinned under the header so the settings sheet is one tap away at any scroll depth. */}
      <div className="sticky top-[var(--header-height)] z-20 -mx-4 flex shrink-0 justify-end bg-primary-background/90 px-4 py-2 backdrop-blur-md lg:hidden">
        <button
          className="flex items-center gap-2 rounded-full border border-steel-750 bg-steel-850 px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97]"
          type="button"
          onClick={onTogglePreview}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Vault settings
          {canLaunch && <span className="h-2 w-2 rounded-full bg-orange-500" />}
        </button>
      </div>
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

      <div className="flex-1 lg:overflow-y-auto">
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
          <div ref={bottomRef} className="scroll-mb-32 lg:scroll-mb-0" />
        </div>
      </div>

      <input accept="image/*" className="hidden" ref={fileInputRef} type="file" onChange={handleFileChange} />
      <div className="sticky bottom-0 z-20 shrink-0 bg-gradient-to-t from-primary-background from-70% to-transparent pb-[max(12px,env(safe-area-inset-bottom))] pt-4 lg:static lg:bg-none lg:pb-0 lg:pt-1">
        <div className="mx-auto w-full max-w-[720px] px-2 sm:px-2">
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
          <ChatComposer
            autoFocus={isDesktop}
            disabled={isSending}
            placeholder="Ask L4VA AI"
            value={input}
            onChange={setInput}
            onSubmit={submit}
          />
        </div>
      </div>
    </div>
  );
};
