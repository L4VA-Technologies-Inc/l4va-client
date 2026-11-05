import { useEffect, useState } from 'react';
import { CheckCircle, Info, XCircle } from 'lucide-react';
import { formatEther } from 'viem';

import { AssetsModalConfirm } from '@/components/modals/CreateProposalModal/AssetsModalConfirm.jsx';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';
import { formatNum } from '@/utils/core.utils.js';
import { useCurrency } from '@/hooks/useCurrency';

export default function Terminating({ onClose, vaultId, onDataChange }) {
  const { currencyLabel } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: terminationData, isLoading } = useVaultAssetsForProposalByType(vaultId, 'terminate');
  // Present only for Robinhood vaults: there is no NFT burn / CEX flow, holders redeem instead.
  const evm = terminationData?.data?.evm ?? null;

  const getTerminatingAssets = () => {
    if (!terminationData?.data || isLoading) return [];

    const assetsData = terminationData.data.assets || [];

    const nftAssets = assetsData
      .filter(asset => asset.type === 'nft')
      .map(asset => ({
        collection: asset.name || `${asset.policy_id?.substring(0, 8)}...`,
        value: asset.asset_id
          ? asset.asset_id.length > 10
            ? `${asset.asset_id.substring(0, 10)}...`
            : asset.asset_id
          : 'N/A',
        id: asset.id,
        imageUrl: asset.imageUrl,
      }));

    const ftAssets = assetsData
      .filter(asset => asset.type === 'ft')
      .map(asset => ({
        collection:
          asset.name ||
          (asset.policy_id === '' && asset.asset_id === '' ? currencyLabel : `${asset.policy_id?.substring(0, 8)}...`),
        value: asset.formattedQuantity || asset.quantity || '0',
        id: asset.id,
        imageUrl: asset.imageUrl,
      }));

    const result = [];

    if (evm) {
      // Robinhood: nothing is burned or sold — every asset in custody is paid out in kind.
      const all = [...ftAssets, ...nftAssets];
      return all.length > 0
        ? [
            {
              title: 'Distributed to VT holders',
              type: 'Assets',
              note: '*Each holder receives a share of every asset, proportional to their VT.',
              assets: all,
            },
          ]
        : [];
    }

    if (nftAssets.length > 0) {
      result.push({
        title: 'Burn Assets',
        type: 'NFTs',
        note: '*These assets will be permanently burned. This cannot be undone.',
        assets: nftAssets,
      });
    }

    if (ftAssets.length > 0) {
      result.push({
        title: 'Vault Assets to be Distributed',
        type: 'FTs',
        note: '*These assets will be distributed to token holders proportionally.',
        assets: ftAssets,
      });
    }

    return result;
  };

  useEffect(() => {
    onDataChange?.({
      terminateAssets: [],
      proposalStart: '',
    });
  }, [onDataChange]);

  // The NFT burn / CEX acknowledgement is Cardano-only.
  useEffect(() => {
    if (!isLoading && terminationData?.data && !terminationData.data.evm) setIsModalOpen(true);
  }, [isLoading, terminationData]);

  useEffect(() => {
    if (!isLoading && terminationData?.data) {
      const assets = terminationData.data.assets || [];
      const validation = terminationData.data.validation || {};
      const canTerminate = validation.canCreateProposal ?? true;

      onDataChange({
        terminateAssets: assets.length > 0 ? assets.map(asset => asset.id) : [],
        isValid: canTerminate, // Block proposal creation if LP validation fails
      });
    }
  }, [terminationData, isLoading, onDataChange]);

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
  };

  const TerminatingAssets = getTerminatingAssets();

  const validation = terminationData?.data?.validation ?? {
    canCreateProposal: true,
    warnings: [],
    blockingReason: null,
  };

  return (
    <div>
      <AssetsModalConfirm
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="You cannot proceed with the Termination flow if you have NFTs in this Vault."
        understanding={`I understand that the NFTs will be sent to a central exchange and the vault will receive the refund of the value in ${currencyLabel}. This action will permanently burn these NFTs and cannot be undone.`}
        confirming="By selecting this checkbox and continuing, you confirm that you want to include burning all NFTs in this vault as part of the termination process. I agree to proceed with termination and burning all NFTs."
        description="If you wish to proceed with a Burn and Terminate flow, you must select the box below indicating that you understand how the NFT burn process works."
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Terminating All Assets</h3>
        </div>

        {/* Mirrors the backend: a passed termination closes every other open proposal of the vault. */}
        <div className="flex gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-dark-100" />
          <p className="text-sm text-dark-100">
            If this proposal passes, all other upcoming and active proposals of this vault will be closed as rejected,
            and their creation fees refunded.
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            TerminatingAssets?.map((asset, i) => {
              return (
                <div className="bg-steel-800 rounded-lg p-4 space-y-4" key={i}>
                  <div className="flex gap-4">
                    <div className="text-sm text-white/60 flex gap-8 w-full">
                      <div className="flex w-auto flex-col">
                        <div>
                          <span className="text-white">{asset.title}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px' }}>{asset.note}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-white">{asset.type}</span>
                      </div>
                      <div>
                        <div>
                          {asset.assets?.map((item, j) => {
                            return (
                              <div className="flex gap-2 text-white" key={j}>
                                <span>{item.collection}</span>
                                <span>{item.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {!isLoading && evm && TerminatingAssets.length === 0 && (
            <p className="text-sm text-dark-100">The vault holds no assets to distribute.</p>
          )}
        </div>

        {!isLoading && evm && <EvmTerminationSteps evm={evm} />}

        {/* LP Pool Validation Info */}
        {!isLoading && terminationData?.data?.lpInfo?.hasLp && (
          <div className="bg-steel-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Liquidity Pool Validation</h4>
              {!validation.canCreateProposal && <span className="text-red-500 text-sm font-semibold">⚠ Blocked</span>}
              {validation.canCreateProposal && validation.warnings.length > 0 && (
                <span className="text-yellow-500 text-sm font-semibold">⚠ Warning</span>
              )}
              {validation.canCreateProposal && validation.warnings.length === 0 && (
                <span className="text-green-500 text-sm font-semibold">✓ Valid</span>
              )}
            </div>

            {/* Blocking reason */}
            {validation.blockingReason && (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <p className="text-red-400 text-sm">{validation.blockingReason}</p>
              </div>
            )}

            {/* Warning messages */}
            {!validation.blockingReason && validation.warnings.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                {validation.warnings.map((warning, idx) => (
                  <p key={idx} className="text-yellow-400 text-sm">
                    {warning}
                  </p>
                ))}
              </div>
            )}

            {/* Pool details */}
            {terminationData.data.lpInfo.pools && terminationData.data.lpInfo.pools.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Liquidity Pools ({terminationData.data.lpInfo.pools.length}):</p>
                {terminationData.data.lpInfo.pools.map((pool, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded ${
                      pool.isRecoverable
                        ? 'bg-green-900/10 border border-green-500/20'
                        : 'bg-red-900/10 border border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {pool.isRecoverable ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-white font-medium">{pool.dex}</span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-white/60">
                        {formatNum(pool.adaAmount, 2)} {currencyLabel}
                      </span>
                      <span className="text-white/60">{formatNum(pool.vtAmount, 0)} VT</span>
                      <span className={`font-medium ${pool.isRecoverable ? 'text-green-400' : 'text-red-400'}`}>
                        {pool.isRecoverable ? 'Recoverable' : 'Unrecoverable'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info text */}
            <div className="text-white/50 text-xs mt-2">
              {validation.canCreateProposal
                ? 'Recoverable LP will be automatically returned during termination. VyFi LP can be recovered from the admin wallet.'
                : 'Please remove unrecoverable liquidity manually before creating a termination proposal.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatEthShort = wei => {
  const value = Number(formatEther(BigInt(wei || '0')));
  if (value === 0) return '0';
  return value >= 1
    ? value.toLocaleString('en', { maximumFractionDigits: 4 })
    : new Intl.NumberFormat('en', { maximumSignificantDigits: 4 }).format(value);
};

/** What a Robinhood termination does, step by step, for this vault. */
function EvmTerminationSteps({ evm }) {
  const lp = evm.lp;
  return (
    <div className="bg-steel-800 rounded-lg p-4 space-y-3 text-sm">
      <h4 className="text-white font-medium">What happens if this passes</h4>
      <ol className="list-decimal list-inside space-y-2 text-white/70">
        <li>
          {lp ? (
            <>
              <span className="text-white">Liquidity is withdrawn from Uniswap.</span> The vault&apos;s position
              {lp.vaultSharePct != null && ` (${formatNum(lp.vaultSharePct, 1)}% of the pool`}
              {lp.valueNative && `${lp.vaultSharePct != null ? ', ' : ' ('}≈ ${formatEthShort(lp.valueNative)} ETH`}
              {(lp.vaultSharePct != null || lp.valueNative) && ')'} is removed before termination starts. The pool
              itself stays on Uniswap with any liquidity other people added, but VT has no backing after termination.
            </>
          ) : (
            <>The vault has no Uniswap liquidity position, so nothing needs to be withdrawn.</>
          )}
        </li>
        <li>
          <span className="text-white">Governance ends.</span> All other open proposals of this vault are closed as
          rejected and their fees refunded.
        </li>
        <li>
          <span className="text-white">Holders redeem.</span> Each holder burns all of their VT and receives their share
          of every asset above in one transaction. Holders who don&apos;t act can be paid out by the operator.
        </li>
        <li>
          <span className="text-white">Redemption window: {evm.claimWindowDays} days.</span> Whatever is not redeemed by
          then goes to the treasury.
        </li>
      </ol>
    </div>
  );
}
