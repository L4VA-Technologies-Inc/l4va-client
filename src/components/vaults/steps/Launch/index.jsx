import { LaunchConfigureVault } from '@/components/vaults/steps/Launch/LaunchConfigureVault';
import { LaunchAssetContribution } from '@/components/vaults/steps/Launch/LaunchAssetContribution';
import { LaunchAcquireWindow } from '@/components/vaults/steps/Launch/LaunchAcquireWindow';
import { LaunchGovernance } from '@/components/vaults/steps/Launch/LaunchGovernance';

export const Launch = ({ data, setCurrentStep }) => (
  <div className="space-y-12 mt-16 min-w-0 overflow-x-hidden">
    <LaunchConfigureVault data={data} setCurrentStep={setCurrentStep} />
    <LaunchAssetContribution data={data} setCurrentStep={setCurrentStep} />
    <LaunchAcquireWindow data={data} setCurrentStep={setCurrentStep} />
    <LaunchGovernance data={data} setCurrentStep={setCurrentStep} />
    <div className="bg-steel-900/50 border border-steel-800/50 rounded-lg p-4 md:p-6">
      <p className="text-sm text-dark-100 mb-2">Transaction Costs:</p>
      <p className="text-base font-medium">
        You will spend: <span className="text-white">1000 VLRM + ~44.44 ADA</span>
      </p>
      <p className="text-sm text-dark-100 mt-1">(39 ADA is upload on-chain fee that will be taken)</p>
    </div>
  </div>
);
