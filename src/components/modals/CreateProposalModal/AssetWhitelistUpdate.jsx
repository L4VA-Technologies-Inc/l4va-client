import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { LavaWhitelistWithCaps } from '@/components/shared/LavaWhitelistWithCaps';
import { assetWhitelistProposalItemSchema } from '@/components/vaults/constants/vaults.constants';
import { transformYupErrors } from '@/utils/core.utils';

const MAX_TOTAL_ASSETS = 30;

const formatAssetForProposal = asset => {
  const valuationMethod = asset.isLpToken ? 'lp_token_dynamic' : asset.valuationMethod || 'market';
  const payload = {
    policyId: asset.policyId,
    assetName: asset.assetName || undefined,
    name: asset.name || undefined,
    count: asset.count ?? 1,
    collectionName: asset.collectionName || undefined,
    policyName: asset.policyName || asset.name || undefined,
    valuationMethod,
    isVerified: Boolean(asset.isVerified),
  };

  if (valuationMethod === 'custom') {
    payload.customPriceAda = Number(asset.customPriceAda);
  }

  return payload;
};

const validateNewAssets = (newAssets, existingPolicyIds) => {
  const fieldErrors = {};
  const seenPolicyIds = new Set();
  let hasErrors = false;

  newAssets.forEach((asset, index) => {
    try {
      assetWhitelistProposalItemSchema.validateSync(asset, { abortEarly: false });
    } catch (validationError) {
      hasErrors = true;
      const schemaErrors = transformYupErrors(validationError);
      Object.entries(schemaErrors).forEach(([path, message]) => {
        fieldErrors[`assetsWhitelist[${index}].${path}`] = message;
      });
    }

    const normalizedPolicyId = asset.policyId?.toLowerCase();
    if (!normalizedPolicyId) {
      return;
    }

    if (existingPolicyIds.has(normalizedPolicyId)) {
      hasErrors = true;
      fieldErrors[`assetsWhitelist[${index}].policyId`] = 'This policy is already in the vault whitelist';
    }

    if (seenPolicyIds.has(normalizedPolicyId)) {
      hasErrors = true;
      fieldErrors[`assetsWhitelist[${index}].policyId`] = 'Duplicate policy ID in this proposal';
    }

    seenPolicyIds.add(normalizedPolicyId);
  });

  return { fieldErrors, hasErrors };
};

export default function AssetWhitelistUpdate({ onDataChange, error, vault }) {
  const [newAssets, setNewAssets] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const canExpandWhitelist = Boolean(vault?.isExpandableAssetWhitelist);

  const existingAssets = useMemo(
    () => (vault?.assetsWhitelist ?? []).filter(asset => asset?.policyId),
    [vault?.assetsWhitelist]
  );

  const existingPolicyIds = useMemo(
    () => new Set(existingAssets.map(asset => asset.policyId.toLowerCase())),
    [existingAssets]
  );

  const existingAssetCount = existingAssets.length;
  const maxNewAssets = Math.max(0, MAX_TOTAL_ASSETS - existingAssetCount);
  // Count unique policies only (one policy per collection, regardless of asset names)
  const uniqueNewPolicies = new Set(
    newAssets.filter(asset => asset?.policyId).map(asset => asset.policyId.toLowerCase())
  );
  const newAssetCount = uniqueNewPolicies.size;
  const totalAssetCount = existingAssetCount + newAssetCount;
  const remainingSlots = Math.max(0, MAX_TOTAL_ASSETS - totalAssetCount);

  useEffect(() => {
    if (!canExpandWhitelist) {
      setFieldErrors({});
      onDataChange?.({
        assetsWhitelist: [],
        isValid: false,
      });
      return;
    }

    const completedAssets = newAssets.filter(asset => asset?.policyId);
    const { fieldErrors: rawFieldErrors, hasErrors } = validateNewAssets(completedAssets, existingPolicyIds);
    const hasCapacity = totalAssetCount <= MAX_TOTAL_ASSETS;
    const isValid = completedAssets.length > 0 && !hasErrors && hasCapacity;

    // Remap errors to indices in `newAssets` so the UI shows them on the correct row
    const nextFieldErrors = {};
    Object.entries(rawFieldErrors).forEach(([key, message]) => {
      const match = key.match(/^assetsWhitelist\[(\d+)\]\.(.+)$/);
      if (!match) {
        nextFieldErrors[key] = message;
        return;
      }
      const completedIndex = Number(match[1]);
      const path = match[2];
      const asset = completedAssets[completedIndex];
      const originalIndex = newAssets.findIndex(a => a?.uniqueId === asset?.uniqueId);
      if (originalIndex >= 0) {
        nextFieldErrors[`assetsWhitelist[${originalIndex}].${path}`] = message;
      }
    });

    setFieldErrors(nextFieldErrors);

    onDataChange?.({
      assetsWhitelist: completedAssets.map(formatAssetForProposal),
      isValid,
    });
  }, [newAssets, existingPolicyIds, totalAssetCount, onDataChange, canExpandWhitelist]);

  if (!canExpandWhitelist) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h3 className="text-lg font-medium text-white">Update Asset Whitelist</h3>
        </header>

        <div className="flex gap-4 rounded-xl border border-orange-500/35 bg-orange-500/10 p-5 text-left" role="alert">
          <AlertCircle className="h-6 w-6 shrink-0 text-orange-400" aria-hidden />
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-white">Whitelist updates are not available for this vault</p>
            <p className="text-sm leading-relaxed text-gray-300">
              This vault does not allow expanding the asset whitelist. Only vaults marked as expandable can create asset
              whitelist update proposals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h3 className="text-lg font-medium text-white">Update Asset Whitelist</h3>
        <p className="text-sm text-gray-400">
          Propose additional verified collections for this vault&apos;s asset whitelist.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-white/10 bg-steel-700/50 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">Whitelist capacity</p>
          <p className="text-sm leading-relaxed text-gray-300">
            A vault can include up to {MAX_TOTAL_ASSETS} unique policy IDs (collections) in total. Each policy can only
            be added once, regardless of asset names. The limit includes collections already on the whitelist and any
            new policies added in this proposal.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-steel-850 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">On whitelist</p>
            <p className="mt-1 text-xl font-semibold text-white">{existingAssetCount}</p>
          </div>
          <div className="rounded-lg bg-steel-850 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Adding in proposal</p>
            <p className="mt-1 text-xl font-semibold text-white">{newAssetCount}</p>
          </div>
          <div className="rounded-lg bg-steel-850 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Total policies</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {totalAssetCount}
              <span className="text-sm font-normal text-gray-400"> / {MAX_TOTAL_ASSETS}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          {remainingSlots === 0
            ? 'No policy slots remaining before the vault reaches its whitelist limit.'
            : `${remainingSlots} policy slot${remainingSlots === 1 ? '' : 's'} remaining before the vault reaches its limit.`}
        </p>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-6">
        {maxNewAssets === 0 ? (
          <p className="text-sm text-orange-400">
            This vault already has the maximum of {MAX_TOTAL_ASSETS} whitelisted policies.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white">New collections</h4>
              <p className="text-xs leading-relaxed text-gray-400">
                Add at least one verified collection below. Each policy can only be added once. You can add up to{' '}
                {maxNewAssets} more in this proposal.
              </p>
            </div>

            <LavaWhitelistWithCaps
              required
              label="Collection"
              whitelist={newAssets}
              setWhitelist={setNewAssets}
              maxItems={maxNewAssets}
              errors={fieldErrors}
              reservedPolicyIds={existingAssets.map(asset => asset.policyId)}
              showCountCaps={false}
            />
          </>
        )}

        {error && newAssetCount === 0 && (
          <p className="text-sm text-red-500">Add at least one policy to update the whitelist.</p>
        )}
        {error && totalAssetCount > MAX_TOTAL_ASSETS && (
          <p className="text-sm text-red-500">
            The vault whitelist cannot exceed {MAX_TOTAL_ASSETS} unique policies in total.
          </p>
        )}
      </section>
    </div>
  );
}
