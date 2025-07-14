import { InfoRow } from '@/components/ui/InfoRow';

export const VaultSettings = ({ vault }) => (
  <>
    <div className="flex flex-col items-center mb-6">
      <img
        alt={vault.name}
        className="w-[100px] h-[100px] rounded-full mb-4 object-cover"
        src={vault.vaultImage || '/assets/vaults/space-man.webp'}
      />
      <h1 className="text-3xl font-bold">{vault.name}</h1>
    </div>
    <div className="bg-steel-750 rounded-lg p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold mb-4">Vault Info</h2>
        <InfoRow label="Token Name" value={vault.tokenName} />
        <InfoRow label="Token Symbol" value={vault.tokenSymbol} />
        <InfoRow copyable label="Token Policy" value={vault.tokenPolicy} />
        <InfoRow label="Total Supply" value={vault.totalSupply} />
        <InfoRow label="% of Asset Fractionalized @ Lock" value={vault.assetFractionalized} />
        <InfoRow label="Acquire Window" value={vault.acquireWindow} />
        <InfoRow label="Asset Value Cap @ Lock" value={vault.assetValueCap} />
        <InfoRow label="Acquire Amount @ Lock" value={vault.acquireAmount} />
        <InfoRow label="Acquire Reserve" value={vault.acquireReserve} />
        <InfoRow label="% Liquidity Pool Contribution" value={vault.liquidityPoolContribution} />
        <InfoRow label="Termination Type" value={vault.terminationType} />
        <InfoRow label="Proposal Creation Threshold %" value={vault.creationThreshold} />
        <InfoRow label="Proposal Cosigning Threshold %" value={vault.cosigningThreshold} />
        <InfoRow label="Vote Start Threshold %" value={vault.startThreshold} />
        <InfoRow label="Minimum Participation Threshold %" value={vault.voteThreshold} />
        <InfoRow label="Proposal Execution Threshold %" value={vault.executionThreshold} />
      </div>
    </div>
  </>
);
