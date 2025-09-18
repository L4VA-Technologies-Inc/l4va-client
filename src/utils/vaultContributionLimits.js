export const areAllAssetsAtMaxCapacity = (assetsWhitelist = [], contributedAssets = []) => {
  if (!assetsWhitelist.length) return false;

  const contributionsByPolicyId = contributedAssets.reduce((acc, asset) => {
    const policyId = asset.policyId;
    if (!acc[policyId]) {
      acc[policyId] = 0;
    }
    acc[policyId] += Number(asset.quantity) || 1;
    return acc;
  }, {});

  return assetsWhitelist.every(whitelistItem => {
    const currentContributions = contributionsByPolicyId[whitelistItem.policyId] || 0;
    return currentContributions >= whitelistItem.countCapMax;
  });
};

export const getContributionStatus = (assetsWhitelist = [], contributedAssets = []) => {
  const contributionsByPolicyId = contributedAssets.reduce((acc, asset) => {
    const policyId = asset.policyId;
    if (!acc[policyId]) {
      acc[policyId] = 0;
    }
    acc[policyId] += Number(asset.quantity) || 1;
    return acc;
  }, {});

  return assetsWhitelist.map(whitelistItem => {
    const currentContributions = contributionsByPolicyId[whitelistItem.policyId] || 0;
    const isAtMaxCapacity = currentContributions >= whitelistItem.countCapMax;
    const remainingCapacity = Math.max(0, whitelistItem.countCapMax - currentContributions);

    return {
      policyId: whitelistItem.policyId,
      countCapMax: whitelistItem.countCapMax,
      countCapMin: whitelistItem.countCapMin,
      currentContributions,
      isAtMaxCapacity,
      remainingCapacity,
      progressPercentage: Math.min(100, (currentContributions / whitelistItem.countCapMax) * 100),
    };
  });
};
