import { useReadContract } from 'wagmi';

import { UniswapSwapPanel } from '@/components/swap/UniswapSwapPanel';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const VAULT_TOKEN_ABI = [
  { type: 'function', stateMutability: 'view', name: 'vaultToken', inputs: [], outputs: [{ type: 'address' }] },
];

// Quick-buy modal for the Robinhood tokens list. Vault rows carry the vault contract,
// so the VT address is read from `vaultToken()`; market rows carry the token address directly.
export const TokenSwapModal = ({ token, onClose }) => {
  const isVault = token?.source === 'vault';
  const vaultContract = isVault ? token?.contract_address : undefined;

  const { data: vaultTokenAddress, isLoading } = useReadContract({
    address: vaultContract,
    abi: VAULT_TOKEN_ABI,
    functionName: 'vaultToken',
    query: { enabled: Boolean(vaultContract) },
  });

  const tokenAddress = isVault ? vaultTokenAddress : token?.swap?.token || token?.address;
  const symbol = token?.symbol || 'TOKEN';

  return (
    <Dialog open={Boolean(token)} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-4 bg-steel-950 border-none">
        <DialogTitle className="sr-only">Buy {symbol}</DialogTitle>
        <DialogDescription className="sr-only">Swap ETH for {symbol}</DialogDescription>
        {tokenAddress ? (
          <UniswapSwapPanel tokenAddress={tokenAddress} tokenSymbol={symbol} tokenImage={token?.image} />
        ) : (
          <p className="py-8 text-center text-sm text-white/60">
            {isLoading ? 'Loading…' : `${symbol} can't be swapped right now.`}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
