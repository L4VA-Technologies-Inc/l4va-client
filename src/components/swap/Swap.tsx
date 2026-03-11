import { CSSProperties, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Swap from '@dexhunterio/swaps';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

import { SwapErrorBoundary } from './SwapErrorBoundary';

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
  useEffect(() => {
    ensureSwapStyles();
    if (overrideDisplay) ensureSwapOverrideStyles();
    return () => {
      if (overrideDisplay) document.getElementById(SWAP_OVERRIDE_STYLES_ID)?.remove();
    };
  }, [overrideDisplay]);

  const partnerCode = useMemo(() => import.meta.env.VITE_DEXHUNTER_PARTNER_CODE || 'l4va_test', []);

  // Add safe event handlers to prevent crashes
  const safeConfig = {
    ...config,
    onSwapSuccess: (data: any) => {
      // Show user-friendly toast notification
      if (data?.data?.length > 0) {
        toast.success('Swap transaction submitted successfully! Your transaction is being processed.', {
          duration: 5000,
        });
      }
      config?.onSwapSuccess?.(data);
    },
    onSwapError: (err: any) => {
      // Don't log cancellation errors
      if (!err?.message?.toLowerCase().includes('cancel')) {
        console.error('Swap error:', err);
        toast.error('Swap failed. Please try again.', {
          duration: 4000,
        });
      }
      config?.onSwapError?.(err);
    },
    onSwapWarning: (warn: any) => {
      // Don't log cancellation warnings
      if (!warn?.message?.toLowerCase().includes('cancel')) {
        console.warn('Swap warning:', warn);
      }
      config?.onSwapWarning?.(warn);
    },
  };

  return (
    <SwapErrorBoundary>
      <Swap partnerName="l4va" partnerCode={partnerCode} colors={DEFAULT_COLORS} {...safeConfig} />
    </SwapErrorBoundary>
  );
};
