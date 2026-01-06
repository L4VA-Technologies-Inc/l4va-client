import { CSSProperties, useEffect } from 'react';
import Swap from '@dexhunterio/swaps';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

const SWAP_STYLES_ID = 'dexhunter-swap-styles';
const SWAP_OVERRIDE_STYLES_ID = 'dexhunter-swap-override-styles';

const ensureSwapStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(SWAP_STYLES_ID)) {
    return;
  }

  const link = document.createElement('link');
  link.id = SWAP_STYLES_ID;
  link.rel = 'stylesheet';
  link.href = '/css/swap-custom.css';
  link.media = 'all';
  document.head.appendChild(link);
};

const ensureSwapOverrideStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(SWAP_OVERRIDE_STYLES_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = SWAP_OVERRIDE_STYLES_ID;
  style.textContent = `
    #dexhunter-container {
      display: block !important;
      width: 100% !important;
    }
    #dexhunter-root {
      width: 100% !important;
      max-width: 100% !important;
    }
  `;
  document.head.appendChild(style);
};

const removeSwapOverrideStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const existingStyle = document.getElementById(SWAP_OVERRIDE_STYLES_ID);
  if (existingStyle) {
    existingStyle.remove();
  }
};

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

export const SwapComponent = ({ overrideDisplay = false, config }: SwapProps) => {
  useEffect(() => {
    ensureSwapStyles();

    if (overrideDisplay) {
      ensureSwapOverrideStyles();
    }

    return () => {
      if (overrideDisplay) {
        removeSwapOverrideStyles();
      }
    };
  }, [overrideDisplay]);

  return (
    <Swap
      partnerName="l4va"
      partnerCode={import.meta.env.VITE_DEXHUNTER_PARTNER_CODE || 'l4va_test'}
      colors={{
        mainText: 'var(--color-text-primary)' as `#${string}`,
        subText: 'var(--color-dark-100)' as `#${string}`,
        background: 'var(--color-steel-950)' as `#${string}`,
        containers: 'var(--color-steel-850)' as `#${string}`,
        buttonText: 'var(--color-text-primary)' as `#${string}`,
        accent: 'var(--color-orange-500)' as `#${string}`,
      }}
      {...config}
    />
  );
};
