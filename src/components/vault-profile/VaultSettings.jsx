import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Copy } from 'lucide-react';

import { InfoRow } from '@/components/ui/infoRow';
import { Button } from '@/components/ui/button';
import L4vaIcon from '@/icons/l4va.svg?react';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/lib/auth/auth';
import { VaultsApiProvider } from '@/services/api/vaults';
import { ConfirmBurnModal } from '@/components/modals/CreateProposalModal/ConfirmBurnModal';
import { ASSET_WHITE_LIST } from '@/components/vaults/constants/vaults.constants.js';

export const VaultSettings = ({ vault }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currency } = useCurrency();
  const { user } = useAuth();
  const wallet = useWallet('handler', 'isConnected', 'isUpdatingUtxos');

  const handleBurneVault = async vaultId => {
    try {
      const { data } = await VaultsApiProvider.buildBurnTransaction(vaultId);

      const signature = await wallet?.handler?.signTx(data.presignedTx, true);

      if (!signature) {
        throw new Error('Transaction signing was cancelled');
      }
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to burn vault. Please try again.');
    } finally {
      window.location.href = '/vaults';
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
    return (
      <div className="flex flex-col gap-4">
        {assetsWhitelist.map((asset, index) => {
          if (asset.policyId && ASSET_WHITE_LIST[asset.policyId]) {
            const assetData = ASSET_WHITE_LIST[asset.policyId];
            const shortPolicy =
              asset.policyId.substring(0, 6) + '...' + asset.policyId.substring(asset.policyId.length - 6);

            return (
              <div key={index} className="flex w-full items-center justify-end gap-6">
                <div className="flex items-center gap-2">
                  <img src={assetData.imgUrl} alt={assetData.assetName} className="w-8 h-8 rounded-full" />
                  <span>{assetData.assetName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{shortPolicy}</span>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    type="button"
                    onClick={() => handleCopy(asset.policyId)}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          }

          if (asset.policyId) {
            const shortPolicy =
              asset.policyId.substring(0, 6) + '...' + asset.policyId.substring(asset.policyId.length - 6);

            return (
              <div key={index} className="flex gap-2 w-full justify-end items-center">
                <span>{shortPolicy}</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                  onClick={() => handleCopy(asset.policyId)}
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            );
          }

          return null;
        })}
      </div>
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
            <InfoRow label="Token Symbol" value={vault.vaultTokenTicker} />
            <InfoRow hideLongString copyable label="Token Policy" value={vault.policyId} />
            <InfoRow
              customClassName="items-start"
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
            <InfoRow label="Minimum Participation Threshold %" symbol="%" value={vault.voteThreshold} />
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
