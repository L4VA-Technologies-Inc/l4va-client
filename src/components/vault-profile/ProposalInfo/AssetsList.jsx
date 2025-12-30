import { LazyImage } from '@/components/shared/LazyImage';
import { getIPFSUrl } from '@/utils/core.utils';

const AssetField = ({ label, value, children }) => (
  <div className="flex justify-between items-center">
    <div className="text-gray-400 text-sm">{label}</div>
    {children || <div className="text-white text-sm">{value || 'N/A'}</div>}
  </div>
);

export const AssetsList = ({ assets, title = 'Assets' }) => {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="text-gray-400">{title}</div>
        <div className="text-white">{assets.length} asset(s)</div>
      </div>
      <div className="space-y-4 pl-4 border-l border-steel-750">
        {assets.map((asset, index) => (
          <div key={asset.id || index} className="space-y-2">
            <div className="text-sm text-gray-500">Asset {index + 1}</div>
            <div className="space-y-2">
              {asset.name && <AssetField label="Asset Name" value={asset.name} />}
              {asset.imageUrl && (
                <AssetField label="Asset Image">
                  <LazyImage
                    src={getIPFSUrl(asset.imageUrl)}
                    alt={asset.name || 'Asset image'}
                    className="rounded-full"
                    width={32}
                    height={32}
                    fallbackSrc="/assets/icons/ada.svg"
                  />
                </AssetField>
              )}
              {asset.quantity && <AssetField label="Quantity" value={asset.quantity} />}
              {asset.amount && <AssetField label="Amount" value={asset.amount} />}
              {asset.type && <AssetField label="Type" value={asset.type} />}
              {asset.assetId && (
                <AssetField
                  label="Asset ID"
                  value={`${asset.assetId.substring(0, 8)}...${asset.assetId.substring(asset.assetId.length - 6)}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
