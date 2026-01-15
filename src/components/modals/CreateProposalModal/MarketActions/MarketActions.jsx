import { useCallback, useState } from 'react';

import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { UnlistAction } from '@/components/modals/CreateProposalModal/MarketActions/UnlistAction.jsx';
import { UpdateListingAction } from '@/components/modals/CreateProposalModal/MarketActions/UpdateListingAction.jsx';
import { BuyAction } from '@/components/modals/CreateProposalModal/MarketActions/BuyAction.jsx';
import { SellAction } from '@/components/modals/CreateProposalModal/MarketActions/SellAction.jsx';

const marketOptions = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
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
      {selectedOption === 'buy' && <BuyAction error={error} vaultId={vaultId} onDataChange={handleActionDataChange} />}
      {selectedOption === 'sell' && (
        <SellAction error={error} vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {selectedOption === 'unlist' && <UnlistAction vaultId={vaultId} onDataChange={handleActionDataChange} />}
      {selectedOption === 'update_list' && (
        <UpdateListingAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
    </div>
  );
};
