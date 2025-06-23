import { SelectedAssetItem } from './SelectedAssetItem';

import PrimaryButton from '@/components/shared/PrimaryButton';

export const ContributionDetails = ({ contributionDetails, selectedNFTs, onRemove, status, onContribute }) => (
  <div className="w-full md:w-1/2 space-y-6 flex flex-col p-6 bg-slate-950 rounded-md">
    <div className="flex-1 space-y-6">
      <h2 className="text-xl text-center font-medium pb-2 border-b border-steel-800">Contribution Details</h2>

      <div className="grid grid-cols-2 gap-6 text-center">
        <div className="space-y-2 p-3 bg-steel-850 rounded-lg">
          <p className="text-dark-100 text-sm">Total Assets Selected</p>
          <p className="text-2xl font-medium">{contributionDetails.totalAssets}</p>
        </div>

        <div className="space-y-2 p-3 bg-steel-850 rounded-lg">
          <p className="text-dark-100 text-sm">Vault Allocation</p>
          <p className="text-2xl font-medium">{contributionDetails.vaultAllocation}%</p>
        </div>

        <div className="space-y-2 p-3 bg-steel-850 rounded-lg">
          <p className="text-dark-100 text-sm">Estimated Value</p>
          <p className="text-2xl font-medium">${contributionDetails.estimatedValue.toLocaleString()}</p>
        </div>

        <div className="space-y-2 p-3 bg-steel-850 rounded-lg">
          <p className="text-dark-100 text-sm">Estimated TICKER VAL ($VAL)</p>
          <p className="text-2xl font-medium">{contributionDetails.estimatedTickerVal.toLocaleString()}</p>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-medium flex justify-center">
          <span>{contributionDetails.totalAssets} Asset(s) Selected</span>
        </h3>
        <div className="space-y-1 h-[300px] overflow-y-auto pr-2">
          {selectedNFTs.length > 0 ? (
            selectedNFTs.map(asset => <SelectedAssetItem key={asset.id} asset={asset} onRemove={onRemove} />)
          ) : (
            <div className="text-center py-12 text-dark-100 bg-steel-850 rounded-lg">
              <p className="mb-2">No assets selected</p>
              <p className="text-sm">Select assets from the left panel to contribute</p>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="flex justify-center pt-4 border-t border-steel-800">
      <PrimaryButton disabled={selectedNFTs.length === 0 || status !== 'idle'} onClick={onContribute}>
        {status === 'idle' ? 'CONTRIBUTE' : status.toUpperCase()}
      </PrimaryButton>
    </div>
  </div>
);
