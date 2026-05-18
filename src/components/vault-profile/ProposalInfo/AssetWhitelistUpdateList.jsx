import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { formatAdaPrice, formatNum, formatPolicyId } from '@/utils/core.utils';

const collectionDisplayName = asset =>
  asset.collectionName?.trim() || asset.name?.trim() || asset.policyName?.trim() || null;

const pricingMethodLabel = valuationMethod => {
  if (valuationMethod === 'custom') return 'Custom';
  if (valuationMethod === 'lp_token_dynamic') return 'LP Token Dynamic';
  return 'Market / Floor';
};

const handleCopy = value => {
  navigator.clipboard
    .writeText(value.toString())
    .then(() => {
      toast.success('Asset Policy ID copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
};

export const AssetWhitelistUpdateList = ({ assets = [], label = 'Assets to add', showCountCaps = false }) => {
  const whitelistedAssets = assets.filter(asset => asset?.policyId);

  if (!whitelistedAssets.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">{label}</h3>
        <span className="text-dark-100 text-sm">No assets in whitelist update</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-400">{label}</h3>
        <span className="text-sm text-white">
          {whitelistedAssets.length} asset{whitelistedAssets.length === 1 ? '' : 's'}
        </span>
      </div>
      <Accordion type="multiple" className="w-full min-w-0 rounded-lg bg-steel-900 p-4 text-left">
        {whitelistedAssets.map((asset, index) => {
          const isFirst = index === 0;
          const name = collectionDisplayName(asset);
          const itemValue = `proposal-asset-whitelist-${asset.policyId}-${index}`;
          const shortPolicy = formatPolicyId(asset.policyId);
          const method = pricingMethodLabel(asset.valuationMethod);
          const isCustom = asset.valuationMethod === 'custom';
          const hasCustomPrice =
            asset.customPriceAda != null &&
            asset.customPriceAda !== '' &&
            !Number.isNaN(Number(asset.customPriceAda)) &&
            Number(asset.customPriceAda) > 0;

          return (
            <AccordionItem
              key={itemValue}
              value={itemValue}
              className="w-full min-w-0 border-b border-white/10 last:border-0"
            >
              <AccordionTrigger
                className={cn(
                  'w-full min-w-0 text-left text-sm font-medium hover:no-underline pr-1 data-[state=open]:pb-2 [&[data-state=open]>svg]:text-stone-300',
                  isFirst ? 'pt-0 pb-3' : 'py-3'
                )}
              >
                <span className="min-w-0 flex-1 break-words pr-2 text-white">{name || 'Unnamed collection'}</span>
              </AccordionTrigger>
              <AccordionContent className="w-full min-w-0 space-y-2 pb-3 pt-0 text-dark-100">
                <div className="text-sm">
                  <span className="text-dark-100">Pricing method</span>
                  <span className="mx-2 text-dark-100">·</span>
                  <span>{method}</span>
                </div>
                {isCustom && hasCustomPrice && (
                  <div className="text-sm">
                    <span className="text-dark-100">Custom price</span>
                    <span className="mx-2 text-dark-100">·</span>
                    <span>₳{formatAdaPrice(asset.customPriceAda)}</span>
                  </div>
                )}
                {isCustom && !hasCustomPrice && <div className="text-sm text-dark-100">Custom price not set</div>}
                {showCountCaps && (asset.countCapMin != null || asset.countCapMax != null) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {asset.countCapMin != null && (
                      <div>
                        <span className="text-dark-100">Min asset cap</span>
                        <span className="mx-2 text-dark-100">·</span>
                        <span>{formatNum(asset.countCapMin)}</span>
                      </div>
                    )}
                    {asset.countCapMax != null && (
                      <div>
                        <span className="text-dark-100">Max asset cap</span>
                        <span className="mx-2 text-dark-100">·</span>
                        <span>{formatNum(asset.countCapMax)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-dark-100">
                  <span className="font-mono">{shortPolicy}</span>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopy(asset.policyId);
                    }}
                    aria-label="Copy policy ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
