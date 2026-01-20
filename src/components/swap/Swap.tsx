import { CSSProperties, useEffect, useMemo } from 'react';
import Swap from '@dexhunterio/swaps';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

const suppressedKeywords = [
  'RECONNECTING',
  'default token',
  'fetching token',
  'settings new token',
  'usdPrice',
  'dexhunter',
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

  return <Swap partnerName="l4va" partnerCode={partnerCode} colors={DEFAULT_COLORS} {...config} />;
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
