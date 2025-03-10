import { LaunchConfigureVault } from '@/components/vaults/steps/Launch/LaunchConfigureVault';
import { LaunchAssetContribution } from '@/components/vaults/steps/Launch/LaunchAssetContribution';
import { LaunchInvestmentWindow } from '@/components/vaults/steps/Launch/LaunchInvestmentWindow';
import { LaunchGovernance } from '@/components/vaults/steps/Launch/LaunchGovernance';

export const Launch = ({ data, setCurrentStep }) => (
  <div className="space-y-10">
    <LaunchConfigureVault data={data} setCurrentStep={setCurrentStep} />
    <LaunchAssetContribution data={data} setCurrentStep={setCurrentStep} />
    <LaunchInvestmentWindow data={data} setCurrentStep={setCurrentStep} />
    <LaunchGovernance data={data} setCurrentStep={setCurrentStep} />
  </div>
);
