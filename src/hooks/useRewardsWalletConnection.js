import { useWallet } from '@ada-anvil/weld/react';
import { useAccount } from 'wagmi';

import { useNetwork } from '@/hooks/useNetwork';

export const useRewardsWalletConnection = () => {
  const { changeAddressBech32: cardanoWalletAddress, isConnected: isCardanoConnected } = useWallet();
  const { address: evmWalletAddress, isConnected: isEvmConnected } = useAccount();
  const { isRobinHood } = useNetwork();

  const walletType = isRobinHood ? 'evm' : 'cardano';
  const isWalletConnected = isRobinHood ? isEvmConnected : isCardanoConnected;
  const walletAddress = isRobinHood ? evmWalletAddress : cardanoWalletAddress;

  return {
    walletType,
    walletAddress,
    isWalletConnected,
    isCardanoConnected,
    isEvmConnected,
    isRobinHood,
  };
};
