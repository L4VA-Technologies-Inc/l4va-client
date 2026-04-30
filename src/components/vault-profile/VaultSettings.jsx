import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { InfoRow } from '@/components/ui/infoRow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/lib/auth/auth';
import { VaultsApiProvider } from '@/services/api/vaults';
import { ConfirmBurnModal } from '@/components/modals/CreateProposalModal/ConfirmBurnModal';
import { cn } from '@/lib/utils';
import { formatAdaPrice, formatPolicyId } from '@/utils/core.utils.js';

const collectionDisplayName = asset =>
  asset.collectionName?.trim() || asset.name?.trim() || asset.policyName?.trim() || null;

const pricingMethodLabel = valuationMethod => {
  if (valuationMethod === 'custom') return 'Custom';
  if (valuationMethod === 'lp_token_dynamic') return 'LP Token Price';
  return 'Market / Floor';
};

export const VaultSettings = ({ vault }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currency } = useCurrency();
  const { user } = useAuth();
  const wallet = useWallet('handler', 'isConnected', 'isUpdatingUtxos');
  const navigate = useNavigate();

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
        toast.success(`Asset Policy ID copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const renderAssets = assetsWhitelist => {
    const whitelistedAssets = (assetsWhitelist ?? []).filter(asset => asset.policyId);
    if (!whitelistedAssets.length) {
      return <span className="text-dark-100">No assets in whitelist</span>;
    }

    return (
      <Accordion type="multiple" className="w-full min-w-[200px] text-left">
        {whitelistedAssets.map((asset, index) => {
          const isFirst = index === 0;
          const name = collectionDisplayName(asset);
          const itemValue = `asset-whitelist-${asset.policyId}-${index}`;
          const shortPolicy = formatPolicyId(asset.policyId);
          const method = pricingMethodLabel(asset.valuationMethod);
          const isCustom = asset.valuationMethod === 'custom';
          const hasCustomPrice =
            asset.customPriceAda != null &&
            asset.customPriceAda !== '' &&
            !Number.isNaN(Number(asset.customPriceAda)) &&
            Number(asset.customPriceAda) > 0;

          return (
            <AccordionItem
              key={itemValue}
              value={itemValue}
              className="w-full min-w-0 border-b border-white/10 last:border-0"
            >
              <AccordionTrigger
                className={cn(
                  'w-full min-w-0 text-left text-sm font-medium hover:no-underline pr-1 data-[state=open]:pb-2 [&[data-state=open]>svg]:text-stone-300',
                  isFirst ? 'pt-0 pb-3' : 'py-3'
                )}
              >
                <span className="min-w-0 flex-1 break-words pr-2">{name || 'Unnamed collection'}</span>
              </AccordionTrigger>
              <AccordionContent className="w-full min-w-0 text-dark-100 space-y-2 pb-3 pt-0">
                <div className="text-sm">
                  <span className="text-dark-100">Pricing method</span>
                  <span className="mx-2 text-dark-100">·</span>
                  <span>{method}</span>
                </div>
                {isCustom && hasCustomPrice && (
                  <div className="text-sm">
                    <span className="text-dark-100">Custom price</span>
                    <span className="mx-2 text-dark-100">·</span>
                    <span>₳{formatAdaPrice(asset.customPriceAda)}</span>
                  </div>
                )}
                {isCustom && !hasCustomPrice && <div className="text-sm text-dark-100">Custom price not set</div>}
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <span className="font-mono">{shortPolicy}</span>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopy(asset.policyId);
                    }}
                    aria-label="Copy policy ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center mb-6">
          {vault.vaultImage ? (
            <img
              alt={vault.name}
              className="w-[100px] h-[100px] rounded-full mb-4 object-cover"
              src={vault.vaultImage}
            />
          ) : (
            <div className="w-[100px] h-[100px] rounded-full mb-4 bg-steel-850 flex items-center justify-center">
              <L4vaIcon className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold">{vault.name}</h1>
        </div>
        <div className="bg-steel-750 rounded-lg p-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold mb-4">Vault Info</h2>
            <InfoRow label="Token Name" value={vault.name} />
            <InfoRow label="Token Ticker" value={vault.vaultTokenTicker} />
            <InfoRow hideLongString copyable label="Token Policy" value={vault.policyId} />
            <InfoRow
              customClassName="flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              valueWrapperClassName="w-full justify-start sm:w-auto sm:min-w-0 sm:justify-end"
              label="Asset Whitelist"
              value={renderAssets(vault.assetsWhitelist)}
            />
            <InfoRow label="Total Supply" symbol={vault.vaultTokenTicker} value={vault.ftTokenSupply} />
            <InfoRow label="Vault Lock Date & Time" value={vault.lockedAt} />
            <InfoRow label="Tokens For Acquirers (%)" symbol="%" value={vault.tokensForAcquires} />
            <InfoRow
              label="Asset Value @ Lock"
              symbol={currency === 'ada' ? 'ADA' : 'USD'}
              value={currency === 'ada' ? vault.assetsPrices.totalValueAda : vault.assetsPrices.totalValueUsd}
            />
            <InfoRow
              label="Acquire Amount @ Lock"
              symbol={currency === 'ada' ? 'ADA' : 'USD'}
              value={currency === 'ada' ? vault.assetsPrices.totalAcquiredAda : vault.assetsPrices.totalAcquiredUsd}
            />
            <InfoRow
              label="Implied Vault Valuation @ Lock"
              symbol="ADA"
              value={vault.valuationAmount ? vault.valuationAmount : 0}
            />
            <InfoRow label="Acquire Reserve" symbol="%" value={vault.acquireReserve} />
            <InfoRow label="% Liquidity Pool Contribution" symbol="%" value={vault.liquidityPoolContribution} />
            <InfoRow label="Termination Type" value={vault.terminationType} />
            <InfoRow label="Proposal Creation Threshold %" symbol="%" value={vault.creationThreshold} />
            {/* <InfoRow label="Proposal Cosigning Threshold %" symbol="%" value={vault.cosigningThreshold} /> */}
            {/* <InfoRow label="Vote Start Threshold %" symbol="%" value={vault.startThreshold} /> */}
            <InfoRow label="Vote Quorum Threshold (%)" symbol="%" value={vault.cosigningThreshold} />
            <InfoRow label="Proposal Execution Threshold %" symbol="%" value={vault.executionThreshold} />
          </div>
        </div>
        {user?.id === vault.owner.id && (
          <div className="flex justify-center">
            <Button
              disabled={vault.vaultStatus !== 'failed'}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              onClick={() => setShowConfirmation(true)}
            >
              Burn Vault
            </Button>
          </div>
        )}
      </div>

      <ConfirmBurnModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => handleBurneVault(vault.id)}
      />
    </>
  );
};
