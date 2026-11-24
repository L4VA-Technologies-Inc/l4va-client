import { SwapComponent } from '@/components/swap/Swap';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

// Quick-buy modal for the Cardano tokens list (DexHunter widget, same as the token detail page).
export const CardanoTokenSwapModal = ({ token, onClose }) => {
  const tokenId = token?.swap?.kind === 'dexhunter' ? token.swap.token : undefined;
  const symbol = token?.symbol || 'TOKEN';

  return (
    <Dialog open={Boolean(tokenId)} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-4 bg-steel-950 border-none">
        <DialogTitle className="sr-only">Buy {symbol}</DialogTitle>
        <DialogDescription className="sr-only">Swap ADA for {symbol}</DialogDescription>
        {tokenId && <SwapComponent key={tokenId} config={{ defaultTokenOut: tokenId, style: { width: '100%' } }} />}
      </DialogContent>
    </Dialog>
  );
};
