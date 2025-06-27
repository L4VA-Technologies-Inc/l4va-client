import Swap from '@dexhunterio/swaps';
import { orderTypesProps } from '@dexhunterio/swaps/lib/store/createSwapSlice';
import { supportedTokensType } from '@dexhunterio/swaps/lib/swap/components/tokens';
import { defaultSettingsProps } from '@dexhunterio/swaps/lib/swap/page';
import { SelectedWallet } from '@dexhunterio/swaps/lib/typescript/cardano-api';

interface SwapProps {
  config?: {
    defaultToken?: string;
    width?: string;
    height?: string;
    theme?: 'light' | 'dark';
    className?: string;
    style?: object;
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

export const SwapComponent = ({ config }: SwapProps) => {
  return (
    <Swap
      partnerName="L4VA"
      partnerCode="l4va"
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
