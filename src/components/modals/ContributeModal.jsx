import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useWallet } from '@ada-anvil/weld/react';
import toast from 'react-hot-toast';

import { TapToolsApiProvider } from '@/services/api/taptools';

import { useTransaction } from '@/hooks/useTransaction';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import CheckmarkIcon from '@/icons/checkmark.svg?react';

const RECIPIENT_ADDRESS = 'addr_test1qpngt4n7vyg4uw2dyqhucjxs400hz92zf67l87plrnq9s4evsy3rlxfvscmu2y2c4m98rkkzc4c5txd7034u5a5uejksnnm4yr';

// Constants for calculations
const ASSET_VALUE_USD = 152; // Value per asset in USD
const TICKER_VAL_RATE = 1751.67; // TICKER VAL rate per asset
const VAULT_ALLOCATION_PERCENTAGE = 11; // Fixed allocation percentage

export const ContributeModal = ({
  isOpen,
  vaultName,
  vaultId,
  recipientAddress = RECIPIENT_ADDRESS,
  onClose,
}) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [nftData, setNftData] = useState([]);
  const wallet = useWallet('handler', 'isConnected', 'balanceAda', 'balanceDecoded');
  const { sendTransaction, status, error } = useTransaction();

  const contributionDetails = useMemo(() => {
    const totalAssets = selectedNFTs.length;
    const estimatedValue = totalAssets * ASSET_VALUE_USD;
    const estimatedTickerVal = totalAssets * TICKER_VAL_RATE;
    const vaultAllocation = totalAssets > 0 ? VAULT_ALLOCATION_PERCENTAGE : 0;

    return {
      totalAssets,
      vaultAllocation,
      estimatedValue,
      estimatedTickerVal,
    };
  }, [selectedNFTs]);

  useEffect(() => {
    const fetchWalletSummary = async () => {
      const changeAddress = await wallet.handler.getChangeAddressBech32();
      const { data } = await TapToolsApiProvider.getWalletSummary(changeAddress);
      if (data?.assets) {
        const nfts = data.assets.filter(asset => asset.isNft).map(asset => ({
          id: asset.tokenId,
          name: asset.displayName || asset.name,
          policyId: asset.metadata.policyId,
          image: asset.metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/') || '/placeholder.svg',
          description: asset.metadata.description,
          quantity: asset.quantity,
        }));
        setNftData(nfts);
      }
    };
    fetchWalletSummary();
  }, [wallet.handler]);

  const toggleNFT = (asset) => {
    if (selectedNFTs.some(nft => nft.id === asset.id)) {
      setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== asset.id));
    } else {
      setSelectedNFTs([...selectedNFTs, asset]);
    }
  };

  const removeNFT = (id) => setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== id));

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
                    <div className="relative w-6 h-6 flex items-center justify-center rounded-full border border-steel-750">
                      {selectedNFTs.some(selected => selected.id === nft.id) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full">
                          <CheckmarkIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative w-8 h-8 overflow-hidden rounded-full">
                        <img alt={nft.name} className="w-full h-full object-cover" src={nft.image} />
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
                  <p className="text-2xl font-medium">{contributionDetails.totalAssets}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Vault Allocation</p>
                  <p className="text-2xl font-medium">{contributionDetails.vaultAllocation}%</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Estimated Value</p>
                  <p className="text-2xl font-medium">${contributionDetails.estimatedValue.toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-dark-100 text-sm">Estimated TICKER VAL ($VAL)</p>
                  <p className="text-2xl font-medium">{contributionDetails.estimatedTickerVal.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{contributionDetails.totalAssets} Assets Contributed</h3>
                <div className="space-y-2 h-[300px] overflow-y-auto">
                  {selectedNFTs.length > 0 ? (
                    selectedNFTs.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 bg-dark-500 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 overflow-hidden rounded-full">
                            <img alt={nft.name} className="w-full h-full object-cover" src={nft.image} />
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
