import { useCallback, useState } from 'react';

import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { UnlistAction } from '@/components/modals/CreateProposalModal/MarketActions/UnlistAction.jsx';
import { UpdateListingAction } from '@/components/modals/CreateProposalModal/MarketActions/UpdateListingAction.jsx';
import { BuyingSelling } from '@/components/modals/CreateProposalModal/BuyingSelling.jsx';

const marketOptions = [
  { value: 'buy_sell', label: 'Buying/Selling' },
  { value: 'unlist', label: 'Unlist' },
  { value: 'update_list', label: 'Update List' },
];

export const MarketActions = ({ vaultId, onDataChange, error }) => {
  const [selectedOption, setSelectedOption] = useState(marketOptions[0].value);

  const handleOptionChange = value => {
    setSelectedOption(value);
    onDataChange?.({
      marketActionType: value,
      unlistAssets: [],
      updateListingAssets: [],
      isValid: false,
    });
  };

  const handleActionDataChange = useCallback(
    data => {
      onDataChange?.({
        ...data,
        marketActionType: selectedOption,
      });
    },
    [onDataChange, selectedOption]
  );

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium">Market Options</h3>
      <LavaSteelSelect
        options={marketOptions}
        placeholder="Select market option"
        value={selectedOption}
        onChange={handleOptionChange}
      />
      {selectedOption === 'buy_sell' && (
        <BuyingSelling error={error} vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {selectedOption === 'unlist' && <UnlistAction vaultId={vaultId} onDataChange={handleActionDataChange} />}
      {selectedOption === 'update_list' && (
        <UpdateListingAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
    </div>
  );
};
