import { useState, useEffect } from 'react';

import { AssetsModalConfirm } from '@/components/modals/CreateProposalModal/AssetsModalConfirm.jsx';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker.js';
import { MIN_CONTRIBUTION_DURATION_MS } from '@/components/vaults/constants/vaults.constants.js';
import { useVaultAssetsForProposalByType } from '@/services/api/queries';

export default function Terminating({ onClose, vaultId, onDataChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalStart, setProposalStart] = useState('');

  const { data: assetsData, isLoading } = useVaultAssetsForProposalByType(vaultId, 'terminate');

  const getTerminatingAssets = () => {
    if (!assetsData?.data || isLoading) return [];

    const nftAssets = assetsData.data
      .filter(asset => asset.type === 'nft')
      .map(asset => ({
        collection: asset.name || `${asset.policy_id?.substring(0, 8)}...`,
        value: asset.asset_id
          ? asset.asset_id.length > 10
            ? `${asset.asset_id.substring(0, 10)}...`
            : asset.asset_id
          : 'N/A',
        id: asset.id,
        imageUrl: asset.imageUrl,
      }));

    const ftAssets = assetsData.data
      .filter(asset => asset.type === 'ft')
      .map(asset => ({
        collection:
          asset.name ||
          (asset.policy_id === '' && asset.asset_id === '' ? 'ADA' : `${asset.policy_id?.substring(0, 8)}...`),
        value: asset.formattedQuantity || asset.quantity || '0',
        id: asset.id,
        imageUrl: asset.imageUrl,
      }));

    const result = [];

    if (nftAssets.length > 0) {
      result.push({
        title: 'Burn Assets',
        type: 'NFTs',
        note: '*These assets will be permanently burned. This cannot be undone.',
        assets: nftAssets,
      });
    }

    if (ftAssets.length > 0) {
      result.push({
        title: 'Vault Assets to be Distributed',
        type: 'FTs',
        note: '*These assets will be distributed to token holders proportionally.',
        assets: ftAssets,
      });
    }

    return result;
  };

  useEffect(() => {
    setIsModalOpen(true);
    onDataChange?.({
      terminateAssets: [],
      proposalStart: '',
    });
  }, [onDataChange]);

  useEffect(() => {
    if (!isLoading && assetsData.data) {
      onDataChange({
        terminateAssets: assetsData.data.length > 0 ? assetsData.data.map(asset => asset.id) : [],
        proposalStart,
      });
    }
  }, [assetsData, isLoading, proposalStart, onDataChange]);

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
  };

  const TerminatingAssets = getTerminatingAssets();

  return (
    <div>
      <AssetsModalConfirm
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="You cannot proceed with the Termination flow if you have NFTs in this Vault."
        understanding="I understand that the NFTs will be sent to a central exchange and the vault will receive the refund of the value in ADA. This action will permanently burn these NFTs and cannot be undone."
        confirming="By selecting this checkbox and continuing, you confirm that you want to include burning all NFTs in this vault as part of the termination process. I agree to proceed with termination and burning all NFTs."
        description="If you wish to proceed with a Burn and Terminate flow, you must select the box below indicating that you understand how the NFT burn process works."
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Terminating All Assets</h3>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            TerminatingAssets?.map((asset, i) => {
              return (
                <div className="bg-steel-800 rounded-lg p-4 space-y-4" key={i}>
                  <div className="flex gap-4">
                    <div className="text-sm text-white/60 flex gap-8 w-full">
                      <div className="flex w-auto flex-col">
                        <div>
                          <span className="text-white">{asset.title}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px' }}>{asset.note}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-white">{asset.type}</span>
                      </div>
                      <div>
                        <div>
                          {asset.assets?.map((item, j) => {
                            return (
                              <div className="flex gap-2 text-white" key={j}>
                                <span>{item.collection}</span>
                                <span>{item.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
    </div>
  );
}
