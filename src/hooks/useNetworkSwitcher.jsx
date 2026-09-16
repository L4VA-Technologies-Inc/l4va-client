import { useCallback, useEffect } from 'react';

import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';
import { ChainType } from '@/utils/types';
import CardanoIcon from '@/icons/cardano.svg?react';
import RobinhoodIcon from '@/icons/robinhood.svg?react';
import ArcIcon from '@/icons/arc.svg?react';

const NETWORK_OPTIONS = [
  {
    label: 'Cardano',
    value: ChainType.CARDANO,
    icon: <CardanoIcon className="w-4 h-4 flex-shrink-0 text-white" />,
  },
  {
    label: 'Robinhood',
    value: ChainType.ROBINHOOD,
    icon: <RobinhoodIcon className="w-4 h-4 flex-shrink-0 text-white" />,
  },
  {
    label: 'Arc',
    value: ChainType.ARC,
    icon: <ArcIcon className="w-4 h-4 flex-shrink-0 text-white" />,
  },
];

const ADA_OPTION = { label: 'ADA', value: 'ada' };
const USD_OPTION = { label: 'USD', value: 'usdt' };
const ETH_OPTION = { label: 'ETH', value: 'eth' };

// ADA only exists on Cardano, ETH only on Robinhood; Arc's native token is USDC.
const CURRENCY_OPTIONS = {
  [ChainType.CARDANO]: [ADA_OPTION, USD_OPTION],
  [ChainType.ROBINHOOD]: [USD_OPTION, ETH_OPTION],
  [ChainType.ARC]: [USD_OPTION],
};

const FALLBACK_CURRENCY = {
  [ChainType.CARDANO]: 'ada',
  [ChainType.ROBINHOOD]: 'eth',
  [ChainType.ARC]: 'usdt',
};

const isCurrencyAvailable = (network, currency) => CURRENCY_OPTIONS[network].some(option => option.value === currency);

/** Network + currency selects shared by the header and the mobile menu. */
export const useNetworkSwitcher = () => {
  const { network, updateNetwork } = useNetwork();
  const { currency, updateCurrency } = useCurrency();

  // A stored currency can be invalid for the stored network (e.g. ADA on Arc).
  useEffect(() => {
    if (!isCurrencyAvailable(network, currency)) {
      updateCurrency(FALLBACK_CURRENCY[network]);
    }
  }, [network, currency, updateCurrency]);

  // Swap currency in the same tick as the network so the select never falls back
  // to "Select an option".
  const changeNetwork = useCallback(
    value => {
      updateNetwork(value);
      if (!isCurrencyAvailable(value, currency)) {
        updateCurrency(FALLBACK_CURRENCY[value]);
      }
    },
    [currency, updateNetwork, updateCurrency]
  );

  return {
    network,
    currency,
    networkOptions: NETWORK_OPTIONS,
    currencyOptions: CURRENCY_OPTIONS[network],
    changeNetwork,
    updateCurrency,
  };
};
