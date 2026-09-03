import { useState } from 'react';
import { ImagePlus } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import SecondaryButton from '@/components/shared/SecondaryButton';

const MAX_PROMPT_LENGTH = 1000;

/**
 * Inline image-prompt card rendered inside the conversation.
 * The prompt is prefilled from the vault the assistant already built; the user can edit it.
 */
export const AiVaultImageGenerator = ({ prompt, isGenerating, isReplacing, onGenerate }) => {
  const [value, setValue] = useState(prompt ?? '');

  return (
    <div className="max-w-md rounded-2xl border border-steel-750 bg-steel-850 p-4">
      <p className="font-russo uppercase text-sm text-white">
        {isReplacing ? 'Regenerate vault image' : 'Generate vault image'}
      </p>
      <textarea
        className="mt-3 w-full resize-none rounded-lg bg-steel-900 border border-steel-750 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
        disabled={isGenerating}
        maxLength={MAX_PROMPT_LENGTH}
        placeholder="Describe the image you want"
        rows={3}
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <SecondaryButton
        className="mt-2 w-full"
        disabled={isGenerating || value.trim().length < 3}
        onClick={() => onGenerate(value)}
      >
        {isGenerating ? (
          <Spinner size="sm" />
        ) : (
          <>
            <ImagePlus className="w-4 h-4" />
            {isReplacing ? 'Generate again' : 'Generate image'}
          </>
        )}
      </SecondaryButton>
    </div>
  );
};
