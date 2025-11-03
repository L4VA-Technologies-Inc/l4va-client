import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';
import { ASSET_WHITE_LIST } from '@/components/vaults/constants/vaults.constants.js';

export const NftModal = ({ assets }) => {
  const { closeModal } = useModalControls();

  const renderNFTs = (assets = []) => {
    if (!Array.isArray(assets) || assets.length === 0) {
      return <span className="text-gray-400 text-sm">Нет полученных NFT</span>;
    }

    return (
      <div className="flex flex-col w-full gap-3">
        {assets.map((asset, index) => {
          if (!asset?.policyId) return null;

          const assetData = ASSET_WHITE_LIST[asset.policyId];
          const key = `${asset.policyId}-${index}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between w-full bg-steel-950 hover:bg-steel-750 transition-colors rounded-xl px-5 py-3 shadow-md border border-steel-750"
            >
              <div className="flex items-center gap-4">
                {assetData?.imgUrl ? (
                  <img
                    src={assetData.imgUrl}
                    alt={assetData.assetName || 'NFT'}
                    className="w-12 h-12 rounded-full object-cover border border-[#3A3A3A]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#3A3A3A] flex items-center justify-center text-gray-400 text-xs">
                    NFT
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">{assetData?.assetName || 'Unknown NFT'}</span>
                  <span className="text-xs text-gray-400 break-all">
                    {asset.policyId.slice(0, 8)}...{asset.policyId.slice(-6)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-yellow-500 text-base font-semibold">+{asset.quantity}</span>
                <span className="text-xs text-gray-500">Asset ID: {asset.assetId}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ModalWrapper isOpen title="Received NFTs" onClose={closeModal} size="lg">
      <div className="flex flex-col gap-4 w-full px-1">{renderNFTs(assets)}</div>
    </ModalWrapper>
  );
};
