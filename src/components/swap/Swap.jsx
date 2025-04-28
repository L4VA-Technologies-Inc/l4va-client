import Swap from '@dexhunterio/swaps';
import '@dexhunterio/swaps/lib/assets/style.css';

export const SwapComponent = () => {
  return (
    <Swap
      colors={{
        mainText: 'var(--color-text-primary)',
        subText: 'var(--color-dark-100)',
        background: 'var(--color-steel-950)',
        containers: 'var(--color-steel-850)',
        buttonText: 'var(--color-text-primary)',
        accent: 'var(--color-orange-500)',
      }}
    />
  );
};
