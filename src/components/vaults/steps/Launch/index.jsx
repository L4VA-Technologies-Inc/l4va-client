import { LaunchConfigureVault } from '@/components/vaults/steps/Launch/LaunchConfigureVault';
import { LaunchAssetContribution } from '@/components/vaults/steps/Launch/LaunchAssetContribution';
import { LaunchAcquireWindow } from '@/components/vaults/steps/Launch/LaunchAcquireWindow';
import { LaunchGovernance } from '@/components/vaults/steps/Launch/LaunchGovernance';

export const Launch = ({ data, setCurrentStep }) => (
  <div className="space-y-12 mt-16">
    <LaunchConfigureVault data={data} setCurrentStep={setCurrentStep} />
    <LaunchAssetContribution data={data} setCurrentStep={setCurrentStep} />
    <LaunchAcquireWindow data={data} setCurrentStep={setCurrentStep} />
    <LaunchGovernance data={data} setCurrentStep={setCurrentStep} />
  </div>
);
