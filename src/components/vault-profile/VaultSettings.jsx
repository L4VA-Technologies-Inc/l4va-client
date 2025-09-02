import { InfoRow } from '@/components/ui/InfoRow';
import L4vaIcon from '@/icons/l4va.svg?react';

export const VaultSettings = ({ vault }) => {
  return (
    <>
      <div className="flex flex-col items-center mb-6">
        {vault.vaultImage ? (
          <img alt={vault.name} className="w-[100px] h-[100px] rounded-full mb-4 object-cover" src={vault.vaultImage} />
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
          <InfoRow copyable label="Token Policy" value={vault.policyId} />
          <InfoRow label="Total Supply" symbol={vault.vaultTokenTicker} value={vault.ftTokenSupply} />
          <InfoRow label="Vault Lock Date & Time" value={vault.acquireWindow} />
          <InfoRow label="TOKENS FOR ACQUIRERS (%)" value={vault.tokensForAcquires} />
          <InfoRow label="Asset Value @ Lock" symbol="%" value={vault.assetsPrices.totalValueUsd} />
          <InfoRow label="Acquire Amount @ Lock" value={vault.acquireAmount} />
          <InfoRow label="Implied Vault Valuation @ Lock" value={vault.valuationAmount} />
          <InfoRow label="Acquire Reserve" value={vault.acquireReserve} />
          <InfoRow label="% Liquidity Pool Contribution" symbol="%" value={vault.liquidityPoolContribution} />
          <InfoRow label="Termination Type" value={vault.terminationType} />
          <InfoRow label="Proposal Creation Threshold %" symbol="%" value={vault.creationThreshold} />
          <InfoRow label="Proposal Cosigning Threshold %" symbol="%" value={vault.cosigningThreshold} />
          <InfoRow label="Vote Start Threshold %" symbol="%" value={vault.startThreshold} />
          <InfoRow label="Minimum Participation Threshold %" symbol="%" value={vault.voteThreshold} />
          <InfoRow label="Proposal Execution Threshold %" symbol="%" value={vault.executionThreshold} />
        </div>
      </div>
    </>
  );
};
