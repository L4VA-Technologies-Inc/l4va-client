import Swap from '@dexhunterio/swaps';
import React, { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import dexhunterStyles from '@dexhunterio/swaps/lib/assets/style.css?inline';
import { useWallet } from '@ada-anvil/weld/react';
import type { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

import { SwapErrorBoundary } from '@/components/swap/SwapErrorBoundary.tsx';
import { RewardsApiProvider } from '@/services/api/rewards';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

export interface SwapComponentProps {
  config?: Omit<
    React.ComponentProps<typeof Swap>,
    'partnerName' | 'partnerCode' | 'colors' | 'onSwapSuccess' | 'onSwapError'
  > & {
    onSwapSuccess?: (data: unknown) => void;
    onSwapError?: (err: unknown) => void;
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
    /* Prevent 300ms tap delay on mobile without breaking scroll */
    touch-action: manipulation;
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

  /*
   * Ensure #dexhunter-swap-container is always the nearest positioned ancestor
   * for the token-search Sheet portal (which uses position:absolute inset-0).
   * overflow:visible prevents any ancestor overflow:hidden from clipping the
   * portal content or its slide-in animation.
   */
  .dexhunter-wrapper #dexhunter-swap-container {
    position: relative !important;
    overflow: visible !important;
  }

  /*
   * Virtuoso manages inline padding-top/padding-bottom for virtualization.
   * Do not override those paddings/margins; add a virtual spacer instead so
   * the last token row is fully visible without scroll jitter.
   */
  .dexhunter-wrapper #dexhunter-container [data-testid="virtuoso-item-list"] {
    position: relative;
  }

  .dexhunter-wrapper #dexhunter-container [data-testid="virtuoso-item-list"]::after {
    content: "";
    display: block;
    height: calc(36px + env(safe-area-inset-bottom, 0px));
    pointer-events: none;
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
  const { isAuthenticated } = useAuth();
  const { key: walletKey, isConnected } = useWallet('key', 'isConnected');
  const { openModal } = useModalControls();

  const partnerCode = useMemo(() => import.meta.env.VITE_DEXHUNTER_PARTNER_CODE || 'l4va_test', []);

  useEffect(() => {
    mountSharedSwapStyles();
    return () => {
      unmountSharedSwapStyles();
    };
  }, []);

  return (
    <div className="dexhunter-wrapper">
      <div className="dexhunter-scope w-full">
        <SwapErrorBoundary>
          <Swap
            key={walletKey || 'no-wallet'}
            partnerName="l4va"
            partnerCode={partnerCode}
            colors={DEFAULT_COLORS}
            onClickWalletConnect={() => {
              // Block if not authenticated

              console.log('here');

              if (!isAuthenticated) {
                toast.error('Please connect and sign in with your wallet first.', { duration: 4000 });
                openModal('LoginModal');
                return;
              }
            }}
            selectedWallet={isConnected && walletKey && isAuthenticated ? (walletKey as SelectedWallet) : undefined}
            onSwapError={err => {
              console.log(err);
            }}
            onSwapSuccess={data => {
              toast.success('Swap transaction submitted successfully! Your transaction is being processed.', {
                duration: 5000,
              });

              try {
                RewardsApiProvider.trackWidgetSwap(data);
              } catch (error) {
                console.error('Failed to track widget swap:', error);
              }
            }}
            theme="dark"
            displayType="DEFAULT"
            width="100%"
            {...config}
          />
        </SwapErrorBoundary>
      </div>
    </div>
  );
};
