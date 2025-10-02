import { useState, useEffect } from 'react';

import { AssetsModalConfirm } from '@/components/modals/CreateProposalModal/AssetsModalConfirm.jsx';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker.js';
import { MIN_CONTRIBUTION_DURATION_MS } from '@/components/vaults/constants/vaults.constants.js';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';

export default function Burning({ onClose, vaultId, onDataChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalStart, setProposalStart] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const { data: assetsData, isLoading } = useVaultAssetsForProposalByType(vaultId, 'burn');

  useEffect(() => {
    setIsModalOpen(true);

    onDataChange?.({
      burnAssets: [],
      proposalStart: '',
      isValid: selectedAssets.length > 0,
    });
  }, [onDataChange]);

  useEffect(() => {
    onDataChange?.({
      burnAssets: selectedAssets,
      proposalStart,
      isValid: selectedAssets.length > 0,
    });
  }, [selectedAssets, proposalStart, onDataChange]);

  const handleCheckboxChange = assetId => {
    setSelectedAssets(prevSelected => {
      const isAlreadySelected = prevSelected.includes(assetId);
      const updatedSelection = isAlreadySelected
        ? prevSelected.filter(id => id !== assetId)
        : [...prevSelected, assetId];

      // Update selectAll status based on if all assets are selected
      setSelectedAll(updatedSelection.length === (assetsData?.data?.length || 0));

      return updatedSelection;
    });
  };

  const handleSelectAllChange = () => {
    const newValue = !selectedAll;
    setSelectedAll(newValue);

    if (newValue && assetsData.data) {
      // Select all assets
      setSelectedAssets(assetsData.data.map(asset => asset.id));
    } else {
      // Deselect all
      setSelectedAssets([]);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <AssetsModalConfirm
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="If you wish to proceed with a Burn flow, you must select the box below indicating that you understand how the NFT burn process works."
        understanding="I understand that the NFTs will be sent to a central exchange and the vault will receive the refund of the value in ADA. This action will permanently burn these NFTs and cannot be undone."
        confirming="By selecting this checkbox and continuing, you confirm that you want to include burning all NFTs in this vault as part of the termination process. I agree to proceed with termination and burning all NFTs."
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Assets to Burn</h3>
            <LavaCheckbox checked={selectedAll} onChange={handleSelectAllChange} description="Select All" />
          </div>
          <div className="space-y-4">
            <div className="bg-steel-800 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 font-bold">
                <p className="text-dark-100 text-sm mt-1 col-span-2">Asset Name</p>
                <p className="text-dark-100 text-sm mt-1">ID</p>
              </div>

              {assetsData?.data?.map((asset, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-2 col-span-2">
                    <LavaCheckbox
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleCheckboxChange(asset.id)}
                    />
                    <span className="text-sm">{asset.name}</span>
                  </div>
                  <span className="text-sm truncate" title={`${asset.policy_id}${asset.asset_id}`}>
                    {asset.asset_id ? asset.asset_id.substring(0, 10) + '...' : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-white font-medium mb-4">Voting Period</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <LavaIntervalPicker
                  value={proposalStart}
                  onChange={setProposalStart}
                  placeholder="Set Voting Period"
                  minDays={Math.floor(MIN_CONTRIBUTION_DURATION_MS / (1000 * 60 * 60 * 24))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
