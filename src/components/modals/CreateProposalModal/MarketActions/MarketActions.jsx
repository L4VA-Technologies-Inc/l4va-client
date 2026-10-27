import { useCallback, useState } from 'react';

import SwapAction from './SwapAction';
import EvmSwapAction from './EvmSwapAction';
import EvmClosePositionAction from './EvmClosePositionAction';

import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { UnlistAction } from '@/components/modals/CreateProposalModal/MarketActions/UnlistAction.jsx';
import { UpdateListingAction } from '@/components/modals/CreateProposalModal/MarketActions/UpdateListingAction.jsx';
import { BuyAction } from '@/components/modals/CreateProposalModal/MarketActions/BuyAction.jsx';
import { SellAction } from '@/components/modals/CreateProposalModal/MarketActions/SellAction.jsx';
import { CancelOfferAction } from '@/components/modals/CreateProposalModal/MarketActions/CancelOfferAction.jsx';

const cardanoMarketOptions = [
  { value: 'sell', label: 'Sell' },
  { value: 'unlist', label: 'Unlist' },
  { value: 'update_list', label: 'Update List' },
  { value: 'buy', label: 'Buy/Offer' },
  { value: 'cancel_offer', label: 'Cancel Offer' },
  { value: 'swap', label: 'Swap (DexHunter)' },
];

const evmMarketOptions = [
  { value: 'evm_swap', label: 'Swap (Uniswap V3)' },
  { value: 'evm_close_position', label: 'Close Position' },
];

export const MarketActions = ({ vaultId, assetsWhitelist, onDataChange, error, isEvmVault }) => {
  const marketOptions = isEvmVault ? evmMarketOptions : cardanoMarketOptions;
  const [selectedOption, setSelectedOption] = useState(marketOptions[0].value);

  const handleOptionChange = value => {
    setSelectedOption(value);
    onDataChange?.({
      marketActionType: value,
      unlistAssets: [],
      updateListingAssets: [],
      cancelOfferAssets: [],
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
      {/* Cardano actions */}
      {!isEvmVault && selectedOption === 'buy' && (
        <BuyAction
          error={error}
          vaultId={vaultId}
          assetsWhitelist={assetsWhitelist}
          onDataChange={handleActionDataChange}
        />
      )}
      {!isEvmVault && selectedOption === 'sell' && (
        <SellAction error={error} vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {!isEvmVault && selectedOption === 'swap' && (
        <SwapAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {!isEvmVault && selectedOption === 'unlist' && (
        <UnlistAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {!isEvmVault && selectedOption === 'update_list' && (
        <UpdateListingAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {!isEvmVault && selectedOption === 'cancel_offer' && (
        <CancelOfferAction vaultId={vaultId} onDataChange={handleActionDataChange} />
      )}
      {/* EVM actions */}
      {isEvmVault && selectedOption === 'evm_swap' && (
        <EvmSwapAction onDataChange={handleActionDataChange} error={error} />
      )}
      {isEvmVault && selectedOption === 'evm_close_position' && (
        <EvmClosePositionAction onDataChange={handleActionDataChange} error={error} />
      )}
    </div>
  );
};
