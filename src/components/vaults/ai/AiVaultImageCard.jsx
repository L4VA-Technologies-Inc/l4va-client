import { ImagePlus, Upload } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import SecondaryButton from '@/components/shared/SecondaryButton';

/**
 * A generated or uploaded vault image, shown inline in the conversation.
 * One image backs both the vault and its token, so there is only ever one of these to replace.
 */
export const AiVaultImageCard = ({ url, alt, isCurrent, isBusy, onRegenerate, onUpload }) => (
  <div>
    <img
      alt={alt || 'Vault image'}
      className="w-full max-w-[280px] aspect-square rounded-2xl border border-steel-750 object-cover"
      src={url}
    />
    {isCurrent && (
      <div className="mt-2 flex flex-wrap gap-2 max-w-[280px]">
        <SecondaryButton className="flex-1" disabled={isBusy} onClick={onRegenerate}>
          {isBusy ? (
            <Spinner size="sm" />
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Regenerate
            </>
          )}
        </SecondaryButton>
        <SecondaryButton className="flex-1" disabled={isBusy} onClick={onUpload}>
          <Upload className="w-4 h-4" />
          Upload another
        </SecondaryButton>
      </div>
    )}
  </div>
);
