import { createFileRoute } from '@tanstack/react-router';

import { SwapComponent } from '@/components/swap/Swap';

export const SwapPage = () => {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center gap-3 px-4 py-12 xl:px-0">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center text-primary-text">Swap ADA/$VLRM</h1>

      <SwapComponent
        config={{
          defaultToken: import.meta.env.VITE_SWAP_VLRM_TOKEN_ID,
          supportedTokens: [import.meta.env.VITE_SWAP_VLRM_TOKEN_ID],
        }}
      />
    </div>
  );
};

export const Route = createFileRoute('/swap')({
  component: SwapPage,
});
