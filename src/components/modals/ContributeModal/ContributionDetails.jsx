import PrimaryButton from '@/components/shared/PrimaryButton';
import MetricCard from '@/components/shared/MetricCard';

export const ContributionDetails = ({ contributionDetails, status, onContribute }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-medium">Contribution Summary</h2>
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Total Assets Selected" value={contributionDetails.totalAssets} />
      <MetricCard label="Vault Allocation" value={`${contributionDetails.vaultAllocation}%`} />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Estimated Value" value={`$${contributionDetails.estimatedValue.toLocaleString()}`} />
      <MetricCard label="Estimated TICKER VAL ($VAL)" value={contributionDetails.estimatedTickerVal.toLocaleString()} />
    </div>
    <div className="flex justify-center pt-4">
      <PrimaryButton disabled={contributionDetails.totalAssets === 0 || status !== 'idle'} onClick={onContribute}>
        {status === 'idle' ? 'CONTRIBUTE' : status.toUpperCase()}
      </PrimaryButton>
    </div>
  </div>
);
