import { useWallet } from '@ada-anvil/weld/react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { Copy, ExternalLink } from 'lucide-react';
import { useNavigate, useRouter } from '@tanstack/react-router';

import { InfoRow } from '@/components/ui/infoRow';
import { Button } from '@/components/ui/button';
import { TokenImage } from '@/components/shared/TokenImage';
import { AddTokenToWalletButton } from '@/components/shared/AddTokenToWalletButton';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/lib/auth/auth';
import { VaultsApiProvider } from '@/services/api/vaults';
import { ConfirmBurnModal } from '@/components/modals/CreateProposalModal/ConfirmBurnModal';
import { CancelVaultConfirmModal } from '@/components/modals/CancelVaultConfirmModal';
import { formatAdaPrice, formatPolicyId } from '@/utils/core.utils.js';
import { getPolicyUrl } from '@/utils/explorer.utils';
import { useVaultIndex } from '@/services/api/queries';

const collectionDisplayName = asset =>
  asset.collectionName?.trim() || asset.name?.trim() || asset.policyName?.trim() || null;

const pricingMethodLabel = valuationMethod => {
  if (valuationMethod === 'custom') return 'Custom';
  if (valuationMethod === 'lp_token_dynamic') return 'LP Token Price';
  return 'Market / Floor';
};

// Acquirers paid this much for their share of the supply, so the whole vault is worth acquired / share.
const impliedValuation = (acquired, tokensForAcquires) =>
  acquired && tokensForAcquires ? parseFloat((acquired / (tokensForAcquires * 0.01)).toFixed(2)) : 0;

// Table-style row: label may wrap, value stays on one line so "4.01 USD" never splits.
const tableRow = {
  customClassName: 'gap-3 py-2.5 text-sm',
  labelClassName: 'min-w-0 flex-1 shrink',
  valueWrapperClassName: 'flex-none whitespace-nowrap text-right font-medium',
};

const InfoSection = ({ title, children }) => (
  <section>
    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-dark-100">{title}</h3>
    <div className="divide-y divide-white/10 rounded-md bg-black/15 px-3">{children}</div>
  </section>
);

export const VaultSettings = ({ vault }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isCancelVaultPending, setIsCancelVaultPending] = useState(false);
  const { pickByCurrency } = useCurrency();
  const { user } = useAuth();
  const wallet = useWallet('handler', 'isConnected', 'isUpdatingUtxos');
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleBurneVault = async vaultId => {
    try {
      const { data } = await VaultsApiProvider.buildBurnTransaction(vaultId);

      const signature = await wallet?.handler?.signTx(data.presignedTx, true);

      if (data) {
        const payload = {
          vaultId,
          transaction: data.presignedTx,
          txId: data.txId,
          signatures: [signature],
        };
        await VaultsApiProvider.publishBurnTransaction(vaultId, payload);
      }

      toast.success('Vault burn successful!');
      navigate({ to: '/vaults' });
    } catch (error) {
      if (error?.message === 'user declined sign tx') {
        toast.error('Vault burn cancelled by user');
      } else {
        toast.error(error.response?.data?.message || 'Failed to burn vault. Please try again.');
      }
    }
  };

  const handleCopy = value => {
    navigator.clipboard
      .writeText(value.toString())
      .then(() => {
        toast.success(`Asset ${isRobinhoodVault ? 'contract' : 'policy ID'} copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleCancelVault = async () => {
    if (!vault?.id || isCancelVaultPending) return;

    setIsCancelVaultPending(true);
    try {
      await VaultsApiProvider.cancelVaultByOwner(vault.id);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vault.id], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['vaults'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['vault-activity', vault.id], refetchType: 'all' }),
      ]);

      toast.success('Vault cancelled successfully');
      setShowCancelConfirmation(false);
      await router.invalidate();
      navigate({ to: '/vaults' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel vault. Please try again.');
    } finally {
      setIsCancelVaultPending(false);
    }
  };

  const currencySymbol = pickByCurrency({ ada: 'ADA', usd: 'USD', eth: 'ETH' });
  const totalAcquired = pickByCurrency({
    ada: vault.assetsPrices.totalAcquiredAda,
    usd: vault.assetsPrices.totalAcquiredUsd,
    eth: vault.assetsPrices.totalAcquiredEth,
  });

  const isOwner = user?.id === vault.owner.id;
  const isRobinhoodVault = vault?.chainType === 'robinhood';
  const { data: evmVaultTokenAddress } = useReadContract({
    address: vault?.contractAddress,
    abi: [
      { type: 'function', stateMutability: 'view', name: 'vaultToken', inputs: [], outputs: [{ type: 'address' }] },
    ],
    functionName: 'vaultToken',
    query: { enabled: isRobinhoodVault && !!vault?.contractAddress },
  });
  const canCancelVaultByOwner = isOwner && vault?.canCancelVault;
  // Burn Vault is not supported on Robinhood (EVM) vaults.
  const canBurnVault = isOwner && vault?.vaultStatus === 'failed' && !isRobinhoodVault;

  // Whitelist entries carry no logo; the Assets tab gets them from the index overview
  // (same cached query), so reuse those images here.
  const { data: indexData } = useVaultIndex(vault?.id, isRobinhoodVault && !!vault?.indexConfig);
  const indexImages = new Map(
    (indexData?.portfolio?.assets ?? [])
      .filter(a => a.image && a.assetAddress)
      .map(a => [a.assetAddress.toLowerCase(), a.image])
  );

  const renderAssets = assetsWhitelist => {
    const whitelistedAssets = (assetsWhitelist ?? []).filter(asset => asset.policyId);
    if (!whitelistedAssets.length) {
      return <span className="text-dark-100">No assets in whitelist</span>;
    }

    const visibleAssets = whitelistedAssets;
    // Same column widths in the fixed header and the scrolling body keep them aligned.
    const cols = (
      <colgroup>
        <col />
        <col className="hidden w-[30%] sm:table-column" />
        <col className="w-[150px]" />
      </colgroup>
    );

    return (
      <div className="w-full">
        <table className="w-full table-fixed text-left text-sm">
          {cols}
          <thead>
            <tr className="text-xs uppercase tracking-wide text-dark-100">
              <th className="pb-2 font-medium">Asset</th>
              <th className="hidden w-[30%] pb-2 font-medium sm:table-cell">Pricing</th>
              <th className="w-[150px] pb-2 text-right font-medium">{isRobinhoodVault ? 'Contract' : 'Policy ID'}</th>
            </tr>
          </thead>
        </table>
        {/* About 10 rows tall; longer whitelists scroll inside the box. */}
        <div className="max-h-[500px] overflow-y-auto pr-1">
          <table className="w-full table-fixed text-left text-sm">
            {cols}
            <tbody className="divide-y divide-white/5">
              {visibleAssets.map((asset, index) => {
                const name = collectionDisplayName(asset);
                const method = pricingMethodLabel(asset.valuationMethod);
                const explorerUrl = getPolicyUrl(asset.policyId, vault.chainType);
                const isCustom = asset.valuationMethod === 'custom';
                const hasCustomPrice =
                  asset.customPriceAda != null &&
                  asset.customPriceAda !== '' &&
                  !Number.isNaN(Number(asset.customPriceAda)) &&
                  Number(asset.customPriceAda) > 0;

                return (
                  <tr key={`asset-whitelist-${asset.policyId}-${index}`} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <TokenImage
                          asset={asset}
                          src={indexImages.get(asset.policyId?.toLowerCase())}
                          alt={name || asset.policyId}
                          chainType={vault.chainType}
                          className="h-7 w-7 shrink-0 rounded-full"
                          width={28}
                          height={28}
                        />
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-medium hover:text-[#7fe36e] hover:underline"
                          title={`${name || ''} · view on explorer`}
                        >
                          {name || 'Unnamed collection'}
                        </a>
                      </div>
                    </td>
                    <td className="hidden py-2.5 pr-3 text-dark-100 sm:table-cell">
                      {method}
                      {isCustom && (hasCustomPrice ? ` · ₳${formatAdaPrice(asset.customPriceAda)}` : ' · not set')}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-end gap-2 text-dark-100">
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs hover:text-white hover:underline"
                          title="View on explorer"
                        >
                          {formatPolicyId(asset.policyId)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          className="text-gray-500 hover:text-white"
                          type="button"
                          onClick={() => handleCopy(asset.policyId)}
                          aria-label="Copy address"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="bg-steel-750 rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4">Vault Info</h2>
          <div className="space-y-5">
            <InfoSection title="Token">
              <InfoRow {...tableRow} label="Token Name" value={vault.name} />
              <InfoRow {...tableRow} label="Token Ticker" value={vault.vaultTokenTicker} />
              {vault.policyId && (
                <InfoRow {...tableRow} hideLongString copyable label="Token Policy" value={vault.policyId} />
              )}
              {isRobinhoodVault && evmVaultTokenAddress && (
                <InfoRow
                  {...tableRow}
                  hideLongString
                  copyable
                  label="Token Contract"
                  value={evmVaultTokenAddress}
                  actions={
                    <>
                      <a
                        href={getPolicyUrl(evmVaultTokenAddress, vault.chainType)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white"
                        aria-label="View on explorer"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                      <AddTokenToWalletButton address={evmVaultTokenAddress} image={vault.vaultImage} />
                    </>
                  }
                />
              )}
              <InfoRow {...tableRow} label="Total Supply" symbol={vault.vaultTokenTicker} value={vault.ftTokenSupply} />
            </InfoSection>

            <InfoSection title="Assets">
              <div className="py-3">{renderAssets(vault.assetsWhitelist)}</div>
              <InfoRow
                {...tableRow}
                label="Expandable whitelist"
                value={vault.isExpandableAssetWhitelist ? 'Yes' : 'No'}
              />
              {vault.indexConfig && (
                <InfoRow
                  {...tableRow}
                  label="Auto-rebalance"
                  value={
                    vault.indexConfig.autoRebalance
                      ? `On${vault.indexConfig.rebalanceCadenceDays ? ` · every ${vault.indexConfig.rebalanceCadenceDays} ${vault.indexConfig.rebalanceCadenceDays === 1 ? 'day' : 'days'}` : ''}`
                      : 'Off'
                  }
                />
              )}
            </InfoSection>

            <InfoSection title="Acquire & valuation">
              <InfoRow {...tableRow} label="Vault Lock Date & Time" value={vault.lockedAt || '—'} />
              <InfoRow {...tableRow} label="Tokens For Acquirers" symbol="%" value={vault.tokensForAcquires} />
              <InfoRow
                {...tableRow}
                label="Asset Value @ Lock"
                symbol={currencySymbol}
                value={pickByCurrency({
                  ada: vault.assetsPrices.totalValueAda,
                  usd: vault.assetsPrices.totalValueUsd,
                  eth: vault.assetsPrices.totalValueEth,
                })}
              />
              <InfoRow {...tableRow} label="Acquire Amount @ Lock" symbol={currencySymbol} value={totalAcquired} />
              <InfoRow
                {...tableRow}
                label="Implied Valuation @ Lock"
                symbol={currencySymbol}
                value={impliedValuation(totalAcquired, vault.tokensForAcquires)}
              />
              <InfoRow {...tableRow} label="Acquire Reserve" symbol="%" value={vault.acquireReserve} />
              <InfoRow {...tableRow} label="LP Contribution" symbol="%" value={vault.liquidityPoolContribution} />
            </InfoSection>

            <InfoSection title="Governance">
              <InfoRow
                {...tableRow}
                label="Termination Type"
                value={vault.terminationType === 'dao' ? 'DAO' : vault.terminationType || '—'}
              />
              <InfoRow {...tableRow} label="Proposal Creation Threshold" symbol="%" value={vault.creationThreshold} />
              <InfoRow {...tableRow} label="Vote Quorum Threshold" symbol="%" value={vault.cosigningThreshold} />
              <InfoRow {...tableRow} label="Proposal Execution Threshold" symbol="%" value={vault.executionThreshold} />
            </InfoSection>
          </div>
        </div>
        {isOwner && (
          <div className="flex justify-center gap-3 flex-wrap">
            {canCancelVaultByOwner && (
              <Button
                disabled={isCancelVaultPending}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                onClick={() => setShowCancelConfirmation(true)}
              >
                Cancel Vault
              </Button>
            )}
            {canBurnVault && (
              <Button
                disabled={vault.vaultStatus !== 'failed'}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                onClick={() => setShowConfirmation(true)}
              >
                Burn Vault
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmBurnModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => handleBurneVault(vault.id)}
      />
      <CancelVaultConfirmModal
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleCancelVault}
        isLoading={isCancelVaultPending}
        vaultName={vault?.name}
        refundsAcquirers={isRobinhoodVault && vault?.vaultStatus === 'acquire'}
      />
    </>
  );
};
