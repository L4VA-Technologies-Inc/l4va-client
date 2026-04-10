import Swap from '@dexhunterio/swaps';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import React, { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import dexhunterStyles from '@dexhunterio/swaps/lib/assets/style.css?inline';

import { SwapErrorBoundary } from '@/components/swap/SwapErrorBoundary.tsx';

export interface SwapComponentProps {
  config?: {
    defaultToken?: string;
    width?: string;
    height?: string;
    theme?: 'light' | 'dark';
    className?: string;
    style?: React.CSSProperties;
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

const DEFAULT_COLORS = {
  mainText: 'var(--color-text-primary)' as `#${string}`,
  subText: 'var(--color-dark-100)' as `#${string}`,
  background: 'var(--color-steel-950)' as `#${string}`,
  containers: 'var(--color-steel-850)' as `#${string}`,
  buttonText: 'var(--color-text-primary)' as `#${string}`,
  accent: 'var(--color-orange-500)' as `#${string}`,
};

const SCOPED_DEXHUNTER_STYLES = dexhunterStyles
  .split('#dexhunter-container')
  .join('.dexhunter-scope')
  .split('*,:before,:after')
  .join('.dexhunter-scope *, .dexhunter-scope :before, .dexhunter-scope :after')
  .split('::backdrop')
  .join('.dexhunter-scope ::backdrop');

const RESPONSIVE_OVERRIDE = `
  .dexhunter-wrapper {
    width: 100%;
    min-width: 0;
    display: block;
  }

  .dexhunter-wrapper #dexhunter-container {
    display: flex !important; 
    width: 100% !important;
    min-width: 0 !important;
  }

  .dexhunter-wrapper #dexhunter-root {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .dexhunter-wrapper #swap-main,
  .dexhunter-wrapper #dexhunter-swap-container,
  .dexhunter-wrapper #dexhunter-swap-form {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  
  .dexhunter-wrapper * {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
  }
`;

const SCOPED_DEXHUNTER_STYLES_ID = 'dexhunter-scoped-styles';
const RESPONSIVE_OVERRIDE_ID = 'dexhunter-responsive-override';

let swapStyleMountCount = 0;

const ensureSharedStyleElement = (id: string, cssText: string) => {
  if (typeof document === 'undefined') {
    return;
  }
  let styleElement = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
  } else if (styleElement.textContent !== cssText) {
    styleElement.textContent = cssText;
  }
};

const mountSharedSwapStyles = () => {
  swapStyleMountCount += 1;
  ensureSharedStyleElement(SCOPED_DEXHUNTER_STYLES_ID, SCOPED_DEXHUNTER_STYLES);
  ensureSharedStyleElement(RESPONSIVE_OVERRIDE_ID, RESPONSIVE_OVERRIDE);
};

const unmountSharedSwapStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }
  swapStyleMountCount = Math.max(0, swapStyleMountCount - 1);
  if (swapStyleMountCount > 0) {
    return;
  }
  document.getElementById(SCOPED_DEXHUNTER_STYLES_ID)?.remove();
  document.getElementById(RESPONSIVE_OVERRIDE_ID)?.remove();
};

export const SwapComponent: React.FC<SwapComponentProps> = ({ config }) => {
  const partnerCode = useMemo(() => import.meta.env.VITE_DEXHUNTER_PARTNER_CODE || 'l4va_test', []);

  useEffect(() => {
    mountSharedSwapStyles();
    return () => {
      unmountSharedSwapStyles();
    };
  }, []);

  const safeConfig = {
    theme: 'dark' as const,
    displayType: 'DEFAULT' as const,
    width: '100%',
    ...config,
    onSwapSuccess: (data: any) => {
      if (data?.data?.length > 0) {
        toast.success('Swap transaction submitted successfully! Your transaction is being processed.', {
          duration: 5000,
        });
      }
      config?.onSwapSuccess?.(data);
    },
    onSwapError: (err: any) => {
      if (!err?.message?.toLowerCase().includes('cancel')) {
        console.error('Swap error:', err);
        toast.error('Swap failed. Please try again.', { duration: 4000 });
      }
      config?.onSwapError?.(err);
    },
  };

  return (
    <div className="dexhunter-wrapper">
      <div className="dexhunter-scope w-full">
        <SwapErrorBoundary>
          <Swap partnerName="l4va" partnerCode={partnerCode} colors={DEFAULT_COLORS} {...safeConfig} />
        </SwapErrorBoundary>
      </div>
    </div>
  );
};
