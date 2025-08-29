import { useState, useEffect } from 'react';

import { AssetsModalConfirm } from '@/components/modals/CreateProposalModal/AssetsModalConfirm.jsx';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker.js';
import { MIN_CONTRIBUTION_DURATION_MS } from '@/components/vaults/constants/vaults.constants.js';
import { LavaCheckbox } from '@/components/shared/LavaCheckbox';

export default function Burning({ onClose, vaultId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalStart, setProposalStart] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const BurningAssets = [
    { project: 'SpaceBudz', projectId: 'SpaceBudz #2383' },
    { project: 'Chilled Kongs - Magic Kongs', projectId: 'MagicKong11435' },
  ];

  const handleCheckboxChange = project => {
    setSelectedProjects(prevSelected => {
      const isAlreadySelected = prevSelected.includes(project);
      const updatedSelection = isAlreadySelected ? prevSelected.filter(p => p !== project) : [...prevSelected, project];

      setSelectedAll(updatedSelection.length === BurningAssets.length);

      return updatedSelection;
    });
  };

  const handleSelectAllChange = () => {
    const newValue = !selectedAll;
    setSelectedAll(newValue);

    const allProjects = BurningAssets.map(a => a.project);
    setSelectedProjects(newValue ? allProjects : []);
  };

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    console.log('Confirmed!');
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Assets to Burn</h3>
          <LavaCheckbox checked={selectedAll} onChange={handleSelectAllChange} description="Select All" />
        </div>
        <div className="space-y-4">
          <div className="bg-steel-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 font-bold">
              <p className="text-dark-100 text-sm mt-1 col-span-2">Project</p>
              <p className="text-dark-100 text-sm mt-1">ID</p>
            </div>

            {BurningAssets.map((asset, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2 col-span-2">
                  <LavaCheckbox
                    type="checkbox"
                    checked={selectedProjects.includes(asset.project)}
                    onChange={() => handleCheckboxChange(asset.project)}
                  />
                  <span className="text-sm">{asset.project}</span>
                </div>
                <span className="text-sm">{asset.projectId}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-white font-medium mb-4">Proposal Start</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <LavaIntervalPicker
                value={proposalStart}
                onChange={setProposalStart}
                minDays={Math.floor(MIN_CONTRIBUTION_DURATION_MS / (1000 * 60 * 60 * 24))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
