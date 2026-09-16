import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { useNetwork } from '@/hooks/useNetwork';
import { ChainTypeLabels } from '@/utils/types';

export const useRewardsWalletConnection = () => {
  const { changeAddressBech32: cardanoWalletAddress, isConnected: isCardanoConnected } = useWallet();
  const { address: evmWalletAddress, isConnected: isEvmConnected } = useAccount();
  const { network, isRobinHood, isArc, isEvm } = useNetwork();

  const walletType = isEvm ? 'evm' : 'cardano';
  const isWalletConnected = isEvm ? isEvmConnected : isCardanoConnected;
  const walletAddress = isEvm ? evmWalletAddress : cardanoWalletAddress;
  // The rewards service keys wallets by address only, so on Arc it would return the same
  // address's Robinhood rewards. Arc has no rewards yet: its rewards pages stay empty.
  const rewardsWalletAddress = isArc ? null : walletAddress;

  return {
    walletType,
    walletAddress,
    rewardsWalletAddress,
    isWalletConnected,
    isCardanoConnected,
    isEvmConnected,
    isRobinHood,
    isArc,
    isEvm,
    chainLabel: ChainTypeLabels[network],
  };
};
