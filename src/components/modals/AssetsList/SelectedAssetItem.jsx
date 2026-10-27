import { X } from 'lucide-react';

import { TokenImage } from '@/components/shared/TokenImage';
import { formatNum, formatPolicyId } from '@/utils/core.utils';
import { getPolicyUrl } from '@/utils/explorer.utils';

export const SelectedAssetItem = ({ asset, chainType, onRemove }) => (
  <div className="flex items-center gap-3">
    <div className="flex flex-1 items-center justify-between px-4 py-2 rounded-md gap-3 bg-steel-800 overflow-hidden">
      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
        <TokenImage
          asset={asset}
          alt={asset.name}
          chainType={chainType || asset.chainType}
          className="rounded-full shrink-0"
          width={32}
          height={32}
        />
        <span className="font-medium truncate">
          {!asset.isNft && asset.amount
            ? `${formatNum(asset.amount)} ${asset?.ticker || asset?.displayName || asset?.name}`
            : asset.name}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {asset.metadata?.policyId && (
          <a
            href={getPolicyUrl(asset.metadata.policyId, chainType || asset.chainType)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-dark-100 hover:text-white hover:underline text-sm whitespace-nowrap transition-colors"
            title={asset.metadata.policyId}
          >
            {formatPolicyId(asset.metadata.policyId)}
          </a>
        )}
        <button
          className="text-dark-100 hover:text-white p-1 rounded-full hover:bg-steel-700 transition-colors"
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove(asset.id);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
