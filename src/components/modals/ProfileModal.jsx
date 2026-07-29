import { useState } from 'react';
import { LogOut, User, FolderOpen, ArrowLeftRight, RefreshCwIcon, Gift } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useWallet, useExtensions } from '@ada-anvil/weld/react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';

import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { UserAvatar } from '@/components/shared/UserAvatar';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { formatNum } from '@/utils/core.utils';
import { useVlrmBalance } from '@/hooks/useVlrmBalance';
import { useNetwork } from '@/hooks/useNetwork';
import { useCurrency } from '@/hooks/useCurrency';

export const ProfileModal = () => {
  const { closeModal } = useModalControls();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isRobinHood } = useNetwork();
  const { currencyLabel } = useCurrency();

  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded', 'disconnect');
  const updateWalletStore = useExtensions('update');

  const { vlrmBalance, isLoading, refreshBalance } = useVlrmBalance();
  const [isWalletRefreshing, setIsWalletRefreshing] = useState(false);

  const { address: evmAddress } = useAccount();
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: evmAddress,
    chainId: robinhoodChain.id,
    query: { enabled: isRobinHood && Boolean(evmAddress) },
  });

  // wagmi v3 dropped `data.formatted`; format the raw bigint `value` ourselves.
  const ethBalanceFormatted = ethBalance ? formatUnits(ethBalance.value, ethBalance.decimals) : '0';

  const handleDisconnect = () => {
    wallet.disconnect();
    logout();
    closeModal();
  };

  const handleNavigation = path => {
    if (path === '/vaults') {
      navigate({
        to: '/profile',
        search: { tab: 'all' },
      });
    } else {
      navigate({ to: path });
    }
    closeModal();
  };

  const handleRefreshAllBalances = async () => {
    try {
      setIsWalletRefreshing(true);
      if (isRobinHood) {
        await refetchEthBalance();
      } else {
        await refreshBalance();
        await updateWalletStore();
      }
      toast.success('Balances updated');
    } catch {
      toast.error('Failed to update balances');
    } finally {
      setIsWalletRefreshing(false);
    }
  };

  const isAnyRefreshing = isLoading || isWalletRefreshing;

  return (
    <ModalWrapper isOpen title="Profile" onClose={closeModal} size="md">
      <UserAvatar user={user} />

      <div className="mt-6 mb-2">
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Balances</span>
          </div>

          <button
            onClick={handleRefreshAllBalances}
            disabled={isAnyRefreshing}
            className="p-1.5 hover:bg-steel-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh all balances"
            aria-label="Refresh all balances"
          >
            <RefreshCwIcon
              className={`text-dark-100 hover:text-white transition ${isAnyRefreshing ? 'animate-spin text-white' : ''}`}
              size={18}
            />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {isRobinHood ? (
            <div className="flex justify-between items-center p-3 bg-steel-850 rounded-lg">
              <span className="text-dark-100">ETH</span>
              <span className="font-bold">{formatNum(ethBalanceFormatted, 4)} ETH</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-3 bg-steel-850 rounded-lg">
                <span className="text-dark-100">$VLRM</span>
                <span className="font-bold">{formatNum(vlrmBalance, 4)} VLRM</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-steel-850 rounded-lg">
                <span className="text-dark-100">{currencyLabel}</span>
                <span className="font-bold">
                  {formatNum(wallet.balanceAda)} {currencyLabel}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4 mt-6">
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/profile')}>
          <User size={20} />
          My profile
        </SecondaryButton>
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/vaults')}>
          <FolderOpen size={20} />
          My vaults
        </SecondaryButton>
        <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/rewards')}>
          <Gift size={20} />
          My rewards
        </SecondaryButton>
        {!isRobinHood && (
          <SecondaryButton className="w-full justify-start gap-3 text-left" onClick={() => handleNavigation('/swap')}>
            <ArrowLeftRight size={20} />
            Swap {currencyLabel}/$VLRM
          </SecondaryButton>
        )}

        <div className="border-t border-white/10 my-4" />

        <SecondaryButton
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
          onClick={handleDisconnect}
        >
          <LogOut size={20} />
          Disconnect wallet
        </SecondaryButton>
      </div>
    </ModalWrapper>
  );
};
