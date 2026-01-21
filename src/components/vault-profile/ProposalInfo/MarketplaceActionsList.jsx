import { ExternalLink } from 'lucide-react';

import { LazyImage } from '@/components/shared/LazyImage';
import { getIPFSUrl } from '@/utils/core.utils';

const ActionField = ({ label, value, children, className }) => (
  <div className="flex justify-between items-center">
    <div className="text-gray-400 text-sm">{label}</div>
    {children || <div className={`text-white text-sm ${className}`}>{value || 'N/A'}</div>}
  </div>
);

export const MarketplaceActionsList = ({ actions, type = 'marketplace' }) => {
  if (!Array.isArray(actions) || actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="text-gray-400">Actions</div>
        <div className="text-white">{actions.length} action(s)</div>
      </div>
      <div className="space-y-4 pl-4 border-l border-steel-750">
        {actions.map((action, index) => (
          <div key={action.assetId} className="space-y-2">
            <div className="text-sm text-gray-500">Action {index + 1}</div>
            <div className="space-y-2">
              {type === 'marketplace' ? (
                <>
                  <ActionField label="Exec" value={action.exec} />
                  <ActionField label="Market" value={action.market} />
                  {action.assetPrice && <ActionField label="Price" value={`₳${action.assetPrice}`} />}
                  {action.assetPrice && <ActionField label="Listing Price" value={`₳${action.listingPrice}`} />}
                  {action.newPrice && <ActionField label="New Price" value={`₳${action.newPrice}`} />}
                  {action.assetName && <ActionField label="Asset Name" value={action.assetName} />}
                  {action.assetImg && (
                    <ActionField label="Asset Image">
                      <LazyImage
                        src={getIPFSUrl(action.assetImg)}
                        alt={action.assetName || 'Asset image'}
                        className="rounded-full"
                        width={32}
                        height={32}
                        fallbackSrc="/assets/icons/ada.svg"
                      />
                    </ActionField>
                  )}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                  {action.wayupUrl && (
                    <ActionField label="Listing URL">
                      <a
                        href={action.wayupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                      >
                        <span>View on WayUp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </ActionField>
                  )}
                </>
              ) : (
                <>
                  {action.assetName && <ActionField label="Asset Name" value={action.assetName} />}
                  {action.exec && <ActionField label="Exec" value={action.exec} />}
                  {action.quantity && <ActionField label="Quantity" value={action.quantity} />}
                  {action.sellType && <ActionField label="Sell Type" value={action.sellType} />}
                  {action.method && <ActionField label="Method" value={action.method} />}
                  {action.market && <ActionField label="Market" value={action.market} />}
                  {action.assetPrice && <ActionField label="Price" value={`₳${action.assetPrice}`} />}
                  {action.assetStatus && (
                    <ActionField label="Status" className="uppercase" value={action.assetStatus} />
                  )}
                  {action.wayupUrl && (
                    <ActionField label="Listing URL">
                      <a
                        href={action.wayupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition-colors text-sm"
                      >
                        <span>View on WayUp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </ActionField>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
