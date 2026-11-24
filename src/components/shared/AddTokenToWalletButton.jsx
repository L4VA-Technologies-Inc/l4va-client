import { useRef, useState } from 'react';
import { useReadContracts, useWalletClient } from 'wagmi';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const erc20MetaAbi = [
  { type: 'function', stateMutability: 'view', name: 'symbol', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', stateMutability: 'view', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }] },
];

const getInjectedProvider = () => (typeof window !== 'undefined' ? window.ethereum : undefined);

const walletName = () => {
  const eth = getInjectedProvider();
  if (eth?.isRabby) return 'Rabby';
  if (eth?.isMetaMask) return 'MetaMask';
  return 'wallet';
};

/**
 * Asks the connected EVM wallet (Rabby, MetaMask, ...) to track an ERC-20 via EIP-747 wallet_watchAsset.
 * Symbol/decimals are read on-chain: wallets reject the request when they don't match the contract.
 */
export const AddTokenToWalletButton = ({ address, image, className = '' }) => {
  const { data: walletClient } = useWalletClient();
  const { data } = useReadContracts({
    contracts: erc20MetaAbi.map(fn => ({ address, abi: erc20MetaAbi, functionName: fn.name })),
    query: { enabled: !!address },
  });

  const symbol = data?.[0]?.result;
  const decimals = data?.[1]?.result;
  const label = `Add token to ${walletName()}`;
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    // One wallet_watchAsset at a time: a second request queues a duplicate prompt and a second toast.
    if (inFlight.current) return;
    if (symbol === undefined || decimals === undefined) {
      toast.error('Token metadata is still loading');
      return;
    }
    const options = { address, symbol: symbol.slice(0, 11), decimals: Number(decimals) };
    if (image && /^https?:\/\//.test(image)) options.image = image;

    inFlight.current = true;
    setPending(true);
    try {
      let added;
      if (walletClient) {
        added = await walletClient.watchAsset({ type: 'ERC20', options });
      } else {
        const eth = getInjectedProvider();
        if (!eth) {
          toast.error('No EVM wallet found');
          return;
        }
        added = await eth.request({ method: 'wallet_watchAsset', params: { type: 'ERC20', options } });
      }
      if (added) toast.success(`${options.symbol} added to ${walletName()}`);
    } catch (err) {
      if (err?.code === 4001 || /reject|denied/i.test(err?.message ?? '')) return;
      console.error('wallet_watchAsset failed:', err);
      toast.error('Failed to add token to wallet');
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return (
    <button
      aria-label={label}
      title={label}
      type="button"
      className={`text-gray-500 hover:text-gray-300 disabled:opacity-40 ${className}`}
      disabled={!address || symbol === undefined || pending}
      onClick={handleClick}
    >
      <Wallet className="h-5 w-5" />
    </button>
  );
};
