import { CSSProperties, useEffect } from 'react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';
import Swap from '@dexhunterio/swaps';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

import { SwapErrorBoundary } from './SwapErrorBoundary';

import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useTrackWidgetSwap } from '@/services/api/queries';

interface SwapProps {
  overrideDisplay?: boolean;
  config?: {
    defaultToken?: string;
    width?: string;
    height?: string;
    theme?: 'light' | 'dark';
    className?: string;
    style?: CSSProperties;
    orderTypes?: orderTypesProps;
    supportedTokens?: supportedTokensType;
    onSwapSuccess?: (data: any) => void;
    onSwapError?: (err: any) => void;
    onSwapWarning?: (err: any) => void;
    selectedWallet?: SelectedWallet;
    inputs?: string[];
    onWalletConnect?: (data: any) => void;
    onClickWalletConnect?: () => void;
    onViewOrder?: (data: any) => void;
    displayType?: 'BUTTON' | 'DEFAULT' | 'WIDGET';
    buttonText?: string;
    orderTypeOnButtonClick?: 'SWAP' | 'LIMIT' | 'DCA';
    buttonStyle?: object;
    buttonClassName?: string;
    widgetButtonClass?: object;
    defaultSettings?: defaultSettingsProps;
    autoFocus?: boolean;
  };
}

interface SuccessResponse {
  data: {
    amount_in: number;
    expected_output: number;
    expected_output_without_slippage: number;
    fee: number;
    dex: string;
    price_impact: number;
    initial_price: number;
    final_price: number;
    pool_id: string;
    batcher_fee: number;
    deposits: number;
    price_distortion: number;
    pool_fee: number;
    tx_hash: string;
    status: 'SUBMITTED';
    token_id_in: string;
    token_id_out: string;
    expected_out_amount: number;
    submission_time: string;
    user_address: string;
    upcoming: boolean;
    type: 'SELL';
    is_dexhunter: boolean;
  }[];
}

const suppressedKeywords = [
  'RECONNECTING',
  'default token',
  'fetching token',
  'settings new token',
  'usdPrice',
  'dexhunter',
  'canceled',
  'CanceledError',
  'DialogContent',
  'DialogTitle',
];

const originalConsole = { ...console };

const createFilter =
  (originalFn: any) =>
  (...args: any[]) => {
    const msg = args.join(' ');
    if (suppressedKeywords.some(k => msg.includes(k))) return;
    originalFn(...args);
  };

console.log = createFilter(originalConsole.log);
console.warn = createFilter(originalConsole.warn);
console.info = createFilter(originalConsole.info);
console.debug = createFilter(originalConsole.debug);

const SWAP_STYLES_ID = 'dexhunter-swap-styles';
const SWAP_OVERRIDE_STYLES_ID = 'dexhunter-swap-override-styles';

const DEFAULT_COLORS = {
  mainText: 'var(--color-text-primary)' as `#${string}`,
  subText: 'var(--color-dark-100)' as `#${string}`,
  background: 'var(--color-steel-950)' as `#${string}`,
  containers: 'var(--color-steel-850)' as `#${string}`,
  buttonText: 'var(--color-text-primary)' as `#${string}`,
  accent: 'var(--color-orange-500)' as `#${string}`,
};

const ensureSwapStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(SWAP_STYLES_ID)) return;
  const link = document.createElement('link');
  link.id = SWAP_STYLES_ID;
  link.rel = 'stylesheet';
  link.href = '/css/swap-custom.css';
  link.media = 'all';
  document.head.appendChild(link);
};

const ensureSwapOverrideStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(SWAP_OVERRIDE_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = SWAP_OVERRIDE_STYLES_ID;
  style.textContent = `
    #dexhunter-container { display: block !important; width: 100% !important; }
    #dexhunter-root { width: 100% !important; max-width: 100% !important; }
  `;
  document.head.appendChild(style);
};

export const SwapComponent = ({ overrideDisplay = false, config }: SwapProps) => {
  const { mutate: trackWidgetSwap } = useTrackWidgetSwap();
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useModalControls();
  const wallet = useWallet('isConnected', 'changeAddressBech32');

  useEffect(() => {
    ensureSwapStyles();
    if (overrideDisplay) ensureSwapOverrideStyles();
    return () => {
      if (overrideDisplay) document.getElementById(SWAP_OVERRIDE_STYLES_ID)?.remove();
    };
  }, [overrideDisplay]);

  const authenticatedAddress = (user as { address?: string } | null)?.address;
  const normalizeAddress = (address?: string) => (address ? address.trim().toLowerCase() : '');
  const isWalletMismatch =
    !!isAuthenticated &&
    !!wallet.isConnected &&
    !!authenticatedAddress &&
    !!wallet.changeAddressBech32 &&
    normalizeAddress(authenticatedAddress) !== normalizeAddress(wallet.changeAddressBech32);
  const canUseSwap = !!isAuthenticated && !isWalletMismatch;

  // Add safe event handlers to prevent crashes
  const safeConfig = {
    ...config,
    // onClickWalletConnect: () => {
    //   if (!isAuthenticated) {
    //     toast.error('Please connect and sign in with your wallet first.');
    //     openModal('LoginModal');
    //     return;
    //   }
    //   if (isWalletMismatch) {
    //     toast.error('Connected wallet does not match your authenticated account.');
    //     return;
    //   }
    //   config?.onClickWalletConnect?.();
    //   // SHOULD add click real
    // },
    onSwapSuccess: (data: SuccessResponse) => {
      if (!canUseSwap) {
        toast.error('Swap is allowed only for the wallet authenticated in your account.');
        return;
      }

      // Show user-friendly toast notification
      const swapData = (data as { data?: unknown[] })?.data;
      const hasSwapData = Array.isArray(swapData) && swapData.length > 0;
      if (hasSwapData) {
        trackWidgetSwap(data, {
          onError: error => {
            console.warn('Failed to track widget swap reward event:', error);
          },
        });

        toast.success('Swap transaction submitted successfully! Your transaction is being processed.', {
          duration: 5000,
        });
      }
      config?.onSwapSuccess?.(data);
    },
    onSwapError: (err: unknown) => {
      // Don't log cancellation errors
      const message = (err as { message?: string })?.message?.toLowerCase?.() ?? '';
      if (!message.includes('cancel')) {
        console.error('Swap error:', err);
        toast.error('Swap failed. Please try again.', {
          duration: 4000,
        });
      }
      config?.onSwapError?.(err);
    },
    onSwapWarning: (warn: unknown) => {
      // Don't log cancellation warnings
      const message = (warn as { message?: string })?.message?.toLowerCase?.() ?? '';
      if (!message.includes('cancel')) {
        console.warn('Swap warning:', warn);
      }
      config?.onSwapWarning?.(warn);
    },
  };

  return (
    <SwapErrorBoundary>
      <Swap
        partnerName="l4va"
        partnerCode={import.meta.env.VITE_DEXHUNTER_PARTNER_CODE || 'l4va_test'}
        colors={DEFAULT_COLORS}
        {...safeConfig}
      />
    </SwapErrorBoundary>
  );
};
