import { useWallet } from '@ada-anvil/weld/react';
import { parseBalance } from '@ada-anvil/weld';
import toast from 'react-hot-toast';
import { useEffect, useState, useMemo } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { useTransaction } from '@/hooks/useTransaction';

const RECIPIENT_ADDRESS = 'addr_test1qpngt4n7vyg4uw2dyqhucjxs400hz92zf67l87plrnq9s4evsy3rlxfvscmu2y2c4m98rkkzc4c5txd7034u5a5uejksnnm4yr';

export const Sandbox = () => {
  const [nftData, setNftData] = useState([]);
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');
  const { sendTransaction, status, error } = useTransaction();

  // Use useMemo to parse the balance only when balanceDecoded changes
  const assetBalances = useMemo(() => {
    if (!wallet.balanceDecoded) {
      return { fullBalance: {}, lovelaceBalance: 0, assets: [] };
    }

    const fullBalance = parseBalance(wallet.balanceDecoded);
    const lovelaceBalance = parseBalance(wallet.balanceDecoded, 'lovelace');

    // Extract assets from the full balance
    const assets = Object.entries(fullBalance)
      .filter(([key]) => key !== 'lovelace')
      .flatMap(([policyId, assetData]) =>
        Object.entries(assetData)
          .filter(([assetName]) => !assetName.toLowerCase().includes('lovelace'))
          .map(([assetName, quantity]) => ({
            policyId,
            assetName,
            quantity,
            id: `${policyId}${assetName}`,
          })),
      );

    return { fullBalance, lovelaceBalance, assets };
  }, [wallet.balanceDecoded]);

  useEffect(() => {
    if (wallet.isConnected) {
      setNftData(assetBalances.assets);
    }
  }, [wallet.isConnected, assetBalances.assets]);

  const handleSendTransaction = async () => {
    try {
      const hash = await sendTransaction({
        vaultId: '8b22f572-6c2a-4ce0-a124-848d60c9f201',
        selectedNFTs: nftData,
        recipient: RECIPIENT_ADDRESS,
        ada: 0.1,
      });

      if (hash) {
        toast.success(`Transaction sent! Hash: ${hash}`);
      }
    } catch {
      toast.error(error || 'Transaction failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-lg shadow-md p-6 bg-[#181A2A] text-white w-full max-w-md">
        {!wallet.isConnected ? (
          <ConnectButton />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm font-medium">ADA Balance:</span>
              <span className="text-lg font-bold text-main-orange">
                {wallet.balanceAda?.toFixed(6) || '0'} ADA
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3 text-white">Your Assets</h3>
              {nftData.length > 0 ? (
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-white/10">
                    {nftData.map(asset => (
                      <li key={asset.id} className="p-3 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-white">{asset.assetName}</div>
                            <div className="text-xs text-dark-100">
                              Policy: {asset.policyId.substring(0, 8)}...
                            </div>
                          </div>
                          <div className="bg-main-orange/20 text-main-orange px-3 py-1 rounded-full text-sm font-medium">
                            {asset.quantity}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-dark-100">No assets found</p>
                </div>
              )}
            </div>

            <PrimaryButton
              className="w-full"
              disabled={status !== 'idle'}
              onClick={handleSendTransaction}
            >
              {status === 'idle' ? 'Send 0.1 ADA' : status}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
