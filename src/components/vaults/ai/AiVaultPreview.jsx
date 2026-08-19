import { useState } from 'react';
import { ImagePlus, RotateCcw, Sparkles } from 'lucide-react';

import { Spinner } from '@/components/Spinner';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { useCurrency } from '@/hooks/useCurrency';

const msToDays = value => (value ? `${(Number(value) / 86400000).toFixed(1)} days` : '—');
const percent = value => (value === null || value === undefined ? '—' : `${value}%`);

const Row = ({ label, value, isAiSet }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-steel-800 last:border-b-0">
    <span className="text-dark-100 text-sm uppercase font-russo">{label}</span>
    <span className="text-white text-sm text-right break-words min-w-0">
      {value}
      {isAiSet && <span className="ml-2 text-orange-500 text-xs uppercase">ai</span>}
    </span>
  </div>
);

export const AiVaultPreview = ({
  vault,
  aiFields,
  missingFields,
  status,
  isGeneratingImage,
  onGenerateImage,
  onOpenInForm,
  onReset,
}) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const { currencyLabel } = useCurrency();

  const isAiSet = field => aiFields.includes(field);
  const canOpenInForm = status === 'ready' && !!vault.vaultImage;

  return (
    <div className="rounded-lg border border-steel-750 bg-steel-900 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-russo uppercase text-lg text-white">Vault draft</h2>
        <button
          className="text-dark-100 hover:text-white transition-colors"
          title="Start over"
          type="button"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div>
        {vault.vaultImage ? (
          <img alt="Generated vault" className="w-full aspect-square object-cover rounded-lg" src={vault.vaultImage} />
        ) : (
          <div className="w-full aspect-square rounded-lg border border-dashed border-steel-700 flex items-center justify-center text-dark-100 text-sm text-center px-6">
            Describe the image you want and generate it — the same image is used for the vault and its token.
          </div>
        )}
        <textarea
          className="mt-3 w-full resize-none rounded-lg bg-steel-850 border border-steel-750 px-3 py-2 text-white text-sm outline-none focus:border-orange-500"
          disabled={isGeneratingImage}
          maxLength={1000}
          placeholder="Describe the vault image"
          rows={3}
          value={imagePrompt}
          onChange={event => setImagePrompt(event.target.value)}
        />
        <SecondaryButton
          className="mt-2 w-full"
          disabled={isGeneratingImage || imagePrompt.trim().length < 3}
          onClick={() => onGenerateImage(imagePrompt)}
        >
          {isGeneratingImage ? (
            <Spinner size="sm" />
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              {vault.vaultImage ? 'Regenerate image' : 'Generate image'}
            </>
          )}
        </SecondaryButton>
      </div>

      <div>
        <Row isAiSet={isAiSet('name')} label="Name" value={vault.name || '—'} />
        <Row isAiSet={isAiSet('vaultTokenTicker')} label="Ticker" value={vault.vaultTokenTicker || '—'} />
        <Row isAiSet={isAiSet('privacy')} label="Privacy" value={vault.privacy || '—'} />
        <Row isAiSet={isAiSet('type')} label="Type" value={vault.type || '—'} />
        <Row
          isAiSet={isAiSet('contributionDuration')}
          label="Contribution"
          value={msToDays(vault.contributionDuration)}
        />
        <Row isAiSet={isAiSet('acquireWindowDuration')} label="Acquire" value={msToDays(vault.acquireWindowDuration)} />
        <Row isAiSet={isAiSet('tokensForAcquires')} label="For acquirers" value={percent(vault.tokensForAcquires)} />
        <Row isAiSet={isAiSet('acquireReserve')} label="Reserve" value={percent(vault.acquireReserve)} />
        <Row
          isAiSet={isAiSet('liquidityPoolContribution')}
          label="LP contribution"
          value={percent(vault.liquidityPoolContribution)}
        />
        <Row
          isAiSet={isAiSet('minAcquireThreshold')}
          label="Min acquire"
          value={vault.minAcquireThreshold ? `${vault.minAcquireThreshold} ${currencyLabel}` : '—'}
        />
        <Row
          isAiSet={isAiSet('ftTokenSupply')}
          label="Token supply"
          value={vault.ftTokenSupply?.toLocaleString() ?? '—'}
        />
        <Row
          isAiSet={isAiSet('creationThreshold')}
          label="Proposal threshold"
          value={percent(vault.creationThreshold)}
        />
        <Row isAiSet={isAiSet('cosigningThreshold')} label="Quorum" value={percent(vault.cosigningThreshold)} />
        <Row isAiSet={isAiSet('executionThreshold')} label="Approval" value={percent(vault.executionThreshold)} />
      </div>

      {missingFields.length > 0 && (
        <p className="text-sm text-dark-100">
          Still needed: <span className="text-orange-500">{missingFields.join(', ')}</span>
        </p>
      )}
      {status === 'ready' && !vault.vaultImage && (
        <p className="text-sm text-orange-500">Generate the vault image to continue.</p>
      )}
      {!vault.isAcquireOnly && (
        <p className="text-sm text-dark-100">
          Collections, whitelists and social links are added in the form — the assistant never invents addresses.
        </p>
      )}

      <PrimaryButton className="w-full uppercase" disabled={!canOpenInForm} onClick={onOpenInForm}>
        <Sparkles className="w-4 h-4" />
        Review & launch
      </PrimaryButton>
    </div>
  );
};
