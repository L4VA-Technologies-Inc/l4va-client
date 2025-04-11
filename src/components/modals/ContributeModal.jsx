import { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';
import { parseBalance } from '@ada-anvil/weld';
import toast from 'react-hot-toast';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { useTransaction } from '@/hooks/useTransaction';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const ContributeModal = ({
  isOpen, onClose, vaultName, vaultId, recipientAddress,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [nftData, setNftData] = useState([]);
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');
  const { sendTransaction, status, error } = useTransaction();

  // Parse wallet assets
  const assetBalances = useMemo(() => {
    if (!wallet.balanceDecoded) {
      return { fullBalance: {}, lovelaceBalance: 0, assets: [] };
    }

    const fullBalance = parseBalance(wallet.balanceDecoded);
    const lovelaceBalance = parseBalance(wallet.balanceDecoded, 'lovelace');

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
            name: assetName, // For display purposes
            image: '/assets/vault-token-image.png', // You might want to update this with real NFT images
          })),
      );

    return { fullBalance, lovelaceBalance, assets };
  }, [wallet.balanceDecoded]);

  useEffect(() => {
    if (wallet.isConnected) {
      setNftData(assetBalances.assets);
    }
  }, [wallet.isConnected, assetBalances.assets]);

  const toggleNFT = (asset) => {
    if (selectedNFTs.some(nft => nft.id === asset.id)) {
      setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== asset.id));
    } else {
      setSelectedNFTs([...selectedNFTs, asset]);
    }
  };

  const removeNFT = (id) => {
    setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== id));
  };

  const handleContribute = async () => {
    try {
      const hash = await sendTransaction({
        vaultId,
        selectedNFTs,
        recipient: recipientAddress,
      });

      if (hash) {
        toast.success(`Contribution successful! Hash: ${hash}`);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || error || 'Contribution failed');
    }
  };

  const estimatedValue = selectedNFTs.length * 152;
  const estimatedTickerVal = selectedNFTs.length * 1751.67;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl p-0 bg-[#181a2a] text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Contribute to {vaultName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-xl font-medium">Available Assets</h2>
            <div className="space-y-1 h-full flex flex-col">
              <div className="flex justify-between text-dark-100 text-sm px-2">
                <span>Asset</span>
                <span>Policy ID</span>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {nftData.map((nft) => (
                  <div
                    key={nft.id}
                    className="flex items-center gap-3 p-2 hover:bg-[#202233] rounded-md cursor-pointer"
                    onClick={() => toggleNFT(nft)}
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center rounded-full border border-[#2f324c]">
                      {selectedNFTs.some(selected => selected.id === nft.id) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#ff8a00]">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-8 h-8 overflow-hidden rounded-full">
                        <img alt={nft.name} className="w-full h-full object-cover" src={nft.image || '/placeholder.svg'} />
                      </div>
                      <span>{nft.name}</span>
                    </div>
                    <span className="text-dark-100 text-sm">{nft.policyId.substring(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6 flex flex-col p-6 bg-dark-700 rounded-[10px]">
            <div className="flex-1 space-y-6">
              <h2 className="text-xl text-center font-medium">Contribution Details</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Total Assets Selected</p>
                  <p className="text-2xl font-medium">{selectedNFTs.length}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Vault Allocation</p>
                  <p className="text-2xl font-medium">{selectedNFTs.length > 0 ? '11%' : '0%'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Estimated Value</p>
                  <p className="text-2xl font-medium">${estimatedValue}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Estimated TICKER VAL ($VAL)</p>
                  <p className="text-2xl font-medium">{estimatedTickerVal.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{selectedNFTs.length} Assets Contributed</h3>
                <div className="space-y-2 h-[300px] overflow-y-auto">
                  {selectedNFTs.length > 0 ? (
                    selectedNFTs.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 bg-[#282b3f] rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 overflow-hidden rounded-full">
                            <img alt={nft.name} className="w-full h-full object-cover" src={nft.image || '/placeholder.svg'} />
                          </div>
                          <span>{nft.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-dark-100 text-sm">{nft.policyId.substring(0, 8)}...</span>
                          <button
                            className="text-dark-100 hover:text-white"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNFT(nft.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-dark-100">
                      No assets contributed
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <PrimaryButton
                disabled={selectedNFTs.length === 0 || status !== 'idle'}
                onClick={handleContribute}
              >
                {status === 'idle' ? 'CONTRIBUTE' : status.toUpperCase()}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
