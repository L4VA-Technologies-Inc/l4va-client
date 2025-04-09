import {useEffect, useState} from 'react';
import { Check, X } from 'lucide-react';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWallet } from "@ada-anvil/weld/react";
import { Lucid, Blockfrost } from "lucid-cardano";
import {ContributeApiProvider} from "@/services/api/contribute/index.js";

export const ContributeModal = ({ isOpen, onClose, vaultName, vaultId }) => {
  const [selectedNFTs, setSelectedNFTs] = useState([]);  // Now stores full NFT objects
  const [nftData, setNftData] = useState([]);
  const [isContributing, setIsContributing] = useState(false);
  const wallet = useWallet('handler')

  useEffect(() => {
    loadNftData()
  }, [])

  const loadNftData = async () => {
    const assetsBalance = await wallet.getBalanceAssets()
    const result = Object.entries(assetsBalance).flatMap(([policyId, assets]) =>
      Object.keys(assets).map(name => ({ name, policyId, id: name }))
    );
    const filtered = result.filter(value => value.name !== 'lovelace')
    setNftData(filtered)
  }

  const handleContribute = async () => {
    setIsContributing(true);
    try {
      // 1. Create transaction with created status on backend
      const {data} = await ContributeApiProvider.createContributionTx({
        vaultId: vaultId,
        assets: selectedNFTs.map(nft => ({
          policyId: nft.policyId,
          assetId: nft.name,
          quantity: '1' // Assuming quantity is 1 for each NFT, adjust if needed
        }))
      });
      console.log('Transaction created with ID:', data.txId);

      // 2. Create onchain transaction with assets and tx_id

      const metadata = {
        l4va: {
          txId: data.txId
        }
      };
      console.log("Metadata has created  ", metadata)

      // Prepare assets for transaction
      const assets = selectedNFTs.reduce((acc, nft) => {
        acc[`${nft.policyId}.${nft.name}`] = 1; // quantity is 1 for each NFT
        return acc;
      }, {});

      // Initialize Lucid with Blockfrost provider
      const lucid = await Lucid.new(
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", import.meta.env.VITE_BLOCKFROST_API_KEY),
        "Preprod"
      );

      // Set wallet provider using the existing wallet instance from useWallet hook
      lucid.selectWallet(wallet.getDefaultApi());

      console.log('lucid instance ', lucid)

      // Get UTXOs for the transaction
      const utxos = await lucid.wallet.getUtxos();
      const utxo = utxos[0];

      try {
        // Create and complete the transaction
        const tx = await lucid
          .newTx()
          .collectFrom([utxo])
          .payToAddress('addr_test1qpngt4n7vyg4uw2dyqhucjxs400hz92zf67l87plrnq9s4evsy3rlxfvscmu2y2c4m98rkkzc4c5txd7034u5a5uejksnnm4yr', assets)
          .attachMetadata(87, metadata)
          .complete();

        console.log('transaction built:', tx);

        // Sign the transaction
        const signedTx = await tx.sign().complete();
        console.log('transaction signed:', signedTx);

        // Submit the transaction
        const txHash = await signedTx.submit();
        console.log('transaction submitted:', txHash);

        // Wait for transaction confirmation
        const success = await lucid.awaitTx(txHash);
        console.log('transaction confirmed:', success);

        // 3. Update outchain transaction with blockchain tx hash
        await ContributeApiProvider.updateTransactionHash({
          txId: data.txId,
          txHash
        });

        onClose(); // Close modal after successful contribution
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsContributing(false);
    }
  }

  const toggleNFT = (nft) => {
    const isSelected = selectedNFTs.some((selected) => selected.id === nft.id);
    if (isSelected) {
      setSelectedNFTs(selectedNFTs.filter((selected) => selected.id !== nft.id));
    } else {
      setSelectedNFTs([...selectedNFTs, nft]);
    }
  };

  const removeNFT = (id) => {
    setSelectedNFTs(selectedNFTs.filter((nft) => nft.id !== id));
  };

  const selectedNFTsData = selectedNFTs;

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
                      {selectedNFTs.some((selected) => selected.id === nft.id) && (
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
                    <span className="text-dark-100 text-sm">{nft.policyId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="w-full md:w-1/2 space-y-6 flex flex-col p-6 bg-dark-700 rounded-[10px]"
          >
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
                    selectedNFTsData.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-2 bg-[#282b3f] rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 overflow-hidden rounded-full">
                            <img alt={nft.name} className="w-full h-full object-cover" src={nft.image || '/placeholder.svg'} />
                          </div>
                          <span>{nft.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-dark-100 text-sm">{nft.policyId}</span>
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
                disabled={selectedNFTs.length === 0 || isContributing}
                onClick={handleContribute}
              >
                {isContributing ? 'CONTRIBUTING...' : 'CONTRIBUTE'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
