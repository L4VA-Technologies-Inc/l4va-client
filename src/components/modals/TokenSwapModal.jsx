import { useReadContract } from 'wagmi';

import { UniswapSwapPanel } from '@/components/swap/UniswapSwapPanel';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const VAULT_TOKEN_ABI = [
  { type: 'function', stateMutability: 'view', name: 'vaultToken', inputs: [], outputs: [{ type: 'address' }] },
];

// Quick-buy modal for the Robinhood tokens list. Prefer an explicit token address from the row.
// A vault row's `contract_address` may be the vault (resolve via `vaultToken()`) or already the
// VT itself — then `vaultToken()` reverts and the address is used as is.
export const TokenSwapModal = ({ token, onClose }) => {
  const isVault = token?.source === 'vault';
  const directAddress = token?.swap?.token || token?.token_address || (isVault ? undefined : token?.address);
  const vaultContract = isVault && !directAddress ? token?.contract_address : undefined;

  const {
    data: vaultTokenAddress,
    isLoading,
    isError,
  } = useReadContract({
    address: vaultContract,
    abi: VAULT_TOKEN_ABI,
    functionName: 'vaultToken',
    // A revert means "this is already the token" — retrying only delays the fallback.
    query: { enabled: Boolean(vaultContract), retry: false },
  });

  const tokenAddress = directAddress || vaultTokenAddress || (isError ? vaultContract : undefined);
  const symbol = token?.symbol || 'TOKEN';

  return (
    <Dialog open={Boolean(token)} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-4 bg-steel-950 border-none">
        <DialogTitle className="sr-only">Buy {symbol}</DialogTitle>
        <DialogDescription className="sr-only">Swap ETH for {symbol}</DialogDescription>
        <UniswapSwapPanel
          tokenAddress={tokenAddress}
          tokenSymbol={symbol}
          tokenImage={token?.image}
          loading={!tokenAddress && isLoading}
          disabledReason={!tokenAddress && !isLoading ? `${symbol} can't be swapped right now.` : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};
