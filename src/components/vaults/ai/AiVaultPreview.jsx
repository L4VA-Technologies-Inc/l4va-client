import { ListChecks, RotateCcw, Sparkles } from 'lucide-react';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { vaultSchema } from '@/components/vaults/constants/vaults.constants';
import { useCurrency } from '@/hooks/useCurrency';
import { useModalControls } from '@/lib/modals/modal.context';

const formatDuration = value => {
  if (!value) return '—';

  const durationMs = Number(value);
  if (durationMs < 86400000) {
    const minutes = durationMs / 60000;
    return `${minutes % 1 === 0 ? minutes : minutes.toFixed(1)} minutes`;
  }

  const days = durationMs / 86400000;
  return `${days % 1 === 0 ? days : days.toFixed(1)} days`;
};

const percent = value => (value === null || value === undefined ? '—' : `${value}%`);
const listValue = value => (Array.isArray(value) && value.length ? value.join(', ') : '—');
const textValue = value => (value === null || value === undefined || value === '' ? '—' : value);

const Row = ({ label, value, isAiSet }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-steel-800 last:border-b-0">
    <span className="text-dark-100 text-sm uppercase font-russo">{label}</span>
    <span className="text-white text-sm text-right break-words min-w-0">
      {value}
      {isAiSet && <span className="ml-2 inline-block text-orange-500 text-xs uppercase">ai</span>}
    </span>
  </div>
);

export const AiVaultPreview = ({ vault, aiFields, onLaunch, isLaunching, onReset, onUpdateVault }) => {
  const { currencyLabel } = useCurrency();
  const { openModal } = useModalControls();

  const isAiSet = field => aiFields.includes(field);
  // Mirrors the manual form's own gate (same schema powers "Confirm & launch" there) instead of
  // trusting the assistant's self-reported status, which can lag behind an already-valid draft.
  const canOpenInForm = vaultSchema.isValidSync(vault);
  const whitelistCount = (vault.assetsWhitelist || []).filter(item => item?.policyId).length;

  const openWhitelistModal = () => {
    openModal('AiAssetWhitelistModal', {
      whitelist: vault.assetsWhitelist || [],
      setWhitelist: assets => onUpdateVault('assetsWhitelist', assets),
      isExpandable: vault.isExpandableAssetWhitelist,
      onExpandableChange: checked => onUpdateVault('isExpandableAssetWhitelist', checked),
    });
  };

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
        <Row isAiSet={isAiSet('name')} label="Name" value={vault.name || '—'} />
        <Row isAiSet={isAiSet('vaultTokenTicker')} label="Ticker" value={vault.vaultTokenTicker || '—'} />
        <Row isAiSet={isAiSet('privacy')} label="Privacy" value={vault.privacy || '—'} />
        <Row isAiSet={isAiSet('description')} label="Description" value={textValue(vault.description)} />
        <Row
          isAiSet={isAiSet('tokenDescription')}
          label="Token description"
          value={textValue(vault.tokenDescription)}
        />
        <Row isAiSet={isAiSet('tags')} label="Tags" value={listValue(vault.tags)} />
        <Row
          isAiSet={isAiSet('contributionDuration')}
          label="Contribution"
          value={formatDuration(vault.contributionDuration)}
        />
        <Row
          isAiSet={isAiSet('contributionOpenWindowType')}
          label="Contribution opens"
          value={textValue(vault.contributionOpenWindowType)}
        />
        <Row
          isAiSet={isAiSet('acquireWindowDuration')}
          label="Acquire"
          value={formatDuration(vault.acquireWindowDuration)}
        />
        <Row
          isAiSet={isAiSet('acquireOpenWindowType')}
          label="Acquire opens"
          value={textValue(vault.acquireOpenWindowType)}
        />
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
        <Row isAiSet={isAiSet('isAcquireOnly')} label="Acquisitions only" value={String(!!vault.isAcquireOnly)} />
        <Row
          isAiSet={isAiSet('allowAcquireExpansion')}
          label="Acquire expansion"
          value={String(!!vault.allowAcquireExpansion)}
        />
        <Row
          isAiSet={isAiSet('terminationType')}
          label="Termination"
          value={textValue(vault.terminationType).toUpperCase()}
        />
        {/* One image backs both the vault and its token; it is created and shown in the chat. */}
        <Row label="Image" value={vault.vaultImage ? 'Added' : '—'} />
      </div>

      {!vault.isAcquireOnly && (
        <div className="border-t border-steel-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-russo uppercase text-sm text-white">Asset whitelist</span>
            <span className="text-dark-100 text-sm">{whitelistCount}/10</span>
          </div>
          <p className="mt-1 text-sm text-dark-100">
            Pick verified collections contributors can deposit, plus min/max caps for each.
          </p>
          <SecondaryButton className="mt-3 w-full" onClick={openWhitelistModal}>
            <ListChecks className="w-4 h-4" />
            {whitelistCount > 0 ? 'Manage asset whitelist' : 'Add asset whitelist'}
          </SecondaryButton>
        </div>
      )}

      <div className="space-y-2">
        <PrimaryButton className="w-full uppercase" disabled={!canOpenInForm || isLaunching} onClick={onLaunch}>
          <Sparkles className="w-4 h-4" />
          {isLaunching ? 'Launching...' : 'Confirm & launch'}
        </PrimaryButton>
      </div>
    </div>
  );
};
