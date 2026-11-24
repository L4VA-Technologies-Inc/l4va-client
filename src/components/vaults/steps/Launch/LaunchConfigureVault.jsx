import { Edit } from 'lucide-react';

import { LavaSocialLinksPreview } from '@/components/shared/LavaSocialLinks';
import {
  VAULT_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
  PRIVACY_HINT,
} from '@/components/vaults/constants/vaults.constants';
import { HoverHelp } from '@/components/shared/HoverHelp';
import { formatNum, substringAddress } from '@/utils/core.utils.js';
import { useCurrency } from '@/hooks/useCurrency';
import { useNetwork } from '@/hooks/useNetwork';
import { TokenImage } from '@/components/shared/TokenImage';
import { VAULT_ARCHETYPES } from '@/components/vaults/index/indexVault.utils';

export const LaunchConfigureVault = ({ data, setCurrentStep }) => {
  const { currencyLabel } = useCurrency();
  const { isRobinHood } = useNetwork();
  // An index vault's whitelist is a technical mirror of its basket (shown in its own section),
  // with caps and valuation the creator never set — so it is not part of this summary.
  const isIndexVault = isRobinHood && data.vaultArchetype === VAULT_ARCHETYPES.INDEX_WEIGHTED;

  return (
    <section className="min-w-0 overflow-x-hidden">
      <div className="rounded-t-lg py-4 px-4 md:px-8 flex justify-between bg-white/5 gap-4 min-w-0">
        <p className="font-bold text-xl md:text-2xl break-words min-w-0 flex-shrink">Configure Vault</p>
        <button
          className="flex items-center gap-2 text-dark-100 self-start md:self-auto hover:text-orange-500 flex-shrink-0"
          type="button"
          onClick={() => setCurrentStep(1)}
        >
          <Edit size={20} className="w-6 h-6" />
          Edit
        </button>
      </div>
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-16 rounded-b-[10px] bg-input-bg min-w-0">
        <div className="space-y-12 min-w-0">
          <div>
            <p className="uppercase font-semibold text-dark-100">Vault name</p>
            <p className="break-words">{data.name || 'No name'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vault type</p>
              <HoverHelp hint="Type of assets that can be contributed to the Vault." />
            </div>
            <p className="break-words">
              {isRobinHood && data.type === 'cnt'
                ? 'Any Token'
                : VAULT_TYPE_OPTIONS.find(option => option.name === data.type)?.label}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vault privacy</p>
              <HoverHelp hint={PRIVACY_HINT} />
            </div>
            <p className="break-words">{VAULT_PRIVACY_OPTIONS.find(option => option.name === data.privacy)?.label}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vault Token Ticker</p>
              <HoverHelp hint="This is the ticker that the Governance Token will have when minted." />
            </div>
            <p className="break-words">{data.vaultTokenTicker || 'Not set'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vault Token description</p>
              <HoverHelp hint="This is the Vault Token description used when registering Vault metadata." />
            </div>
            <p className="break-words">{data.tokenDescription || 'No token description'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Vault description</p>
            <p className="break-words">{data.description || 'No description'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Allow Acquire Expansion</p>
            <p>{data.allowAcquireExpansion ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Tags</p>
            {data.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-steel-850 px-3 py-1 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p>No tags</p>
            )}
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Social links</p>
            <LavaSocialLinksPreview socialLinks={data.socialLinks} />
          </div>
          {!isIndexVault && (
            <>
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Expandable whitelist</p>
                  <HoverHelp hint="Allows the vault whitelist to be expanded after creation." />
                </div>
                <p>{data.isExpandableAssetWhitelist ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="uppercase font-semibold text-dark-100">Asset whitelist</p>
                {data.assetsWhitelist?.length ? (
                  <div className="mt-2 space-y-2">
                    {data.assetsWhitelist.slice(0, 5).map((asset, index) => {
                      // Unresolved tokens come back as "N/A"; the address is the better label then.
                      const name = asset.policyName && asset.policyName !== 'N/A' ? asset.policyName : null;
                      const valuation =
                        asset.valuationMethod === 'custom'
                          ? 'Custom Price'
                          : asset.valuationMethod === 'lp_token_dynamic'
                            ? 'LP Token Dynamic'
                            : isRobinHood
                              ? 'Market Price'
                              : 'Market / Floor';
                      return (
                        <div
                          key={asset.policyId || index}
                          className="rounded-xl border border-steel-750 bg-steel-850 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <TokenImage
                              asset={asset}
                              alt={name || asset.policyId}
                              chainType={isRobinHood ? 'robinhood' : 'cardano'}
                              className="h-7 w-7 shrink-0 rounded-full"
                              width={28}
                              height={28}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{name || substringAddress(asset.policyId)}</p>
                              {name && <p className="text-xs text-dark-100">{substringAddress(asset.policyId)}</p>}
                            </div>
                          </div>
                          <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div className="min-w-0">
                              <dt className="text-xs uppercase text-dark-100">Min cap</dt>
                              <dd>{formatNum(asset.countCapMin)}</dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs uppercase text-dark-100">Max cap</dt>
                              <dd>{formatNum(asset.countCapMax)}</dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-xs uppercase text-dark-100">Valuation</dt>
                              <dd className="break-words">
                                {valuation}
                                {asset.valuationMethod === 'custom' && asset.customPriceAda
                                  ? ` · ${formatNum(asset.customPriceAda)} ${currencyLabel}`
                                  : ''}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                    {data.assetsWhitelist.length > 5 && (
                      <p className="text-dark-100 mt-2">+{formatNum(data.assetsWhitelist.length - 5)} more assets</p>
                    )}
                  </div>
                ) : (
                  <span>Not set</span>
                )}
              </div>
            </>
          )}
          {data.privacy !== 'public' && (
            <div>
              <p className="uppercase font-semibold text-dark-100">Acquirer whitelist</p>
              <div className="space-y-2">
                {data.acquirerWhitelist?.length ? (
                  <>
                    {data.acquirerWhitelist.slice(0, 5).map((acquirer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="max-w-[300px] truncate">{acquirer.walletAddress || 'Not set'}</span>
                      </div>
                    ))}
                    {data.acquirerWhitelist.length > 5 && (
                      <p className="text-dark-100 mt-2">
                        +{formatNum(data.acquirerWhitelist.length - 5)} more acquirers
                      </p>
                    )}
                  </>
                ) : (
                  <span>Not set</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-12 min-w-0">
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="uppercase font-semibold text-dark-100 break-words min-w-0">Vault image</p>
              <HoverHelp hint="This is the image that will live on the Vault Profile page." />
            </div>
            {data.vaultImage ? (
              <div className="mt-2 relative w-full md:w-64 overflow-hidden">
                <img
                  alt="Vault Image"
                  className="object-cover w-full max-w-[320px] h-auto aspect-square rounded-lg"
                  src={data.vaultImage}
                />
              </div>
            ) : (
              <p>No image</p>
            )}
          </div>
          <div>
            <p className="uppercase font-semibold text-dark-100">Vault Token image</p>
            {data.ftTokenImg ? (
              <div className="mt-2 relative w-full overflow-hidden">
                <img
                  alt="Vault Token Image"
                  className="object-cover w-full max-w-[240px] h-auto aspect-square rounded-lg"
                  src={data.ftTokenImg}
                />
              </div>
            ) : (
              <p>No image</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
