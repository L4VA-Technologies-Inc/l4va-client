import { hasNoAcquirePhase } from '@/components/vaults/constants/vaults.constants';

export const formatVaultData = (vaultData, isEvm = false) => {
  const formattedData = { ...vaultData };

  if (formattedData.socialLinks.length > 0) {
    // eslint-disable-next-line no-unused-vars
    formattedData.socialLinks = formattedData.socialLinks.map(({ id, ...rest }) => rest);
  }

  if (formattedData.isAcquireOnly) {
    formattedData.assetsWhitelist = [];
    formattedData.contributionDuration = null;
    formattedData.contributionOpenWindowType = null;
    formattedData.contributionOpenWindowTime = null;
    formattedData.contributorWhitelist = [];
  }

  // Cardano sends minAcquireThreshold in lovelace; Robinhood (EVM) sends it in ETH as entered.
  if (formattedData.isAcquireOnly && formattedData.minAcquireThreshold != null) {
    formattedData.minAcquireThreshold = isEvm
      ? Number(formattedData.minAcquireThreshold)
      : Math.round(Number(formattedData.minAcquireThreshold) * 1000000);
  }

  if (hasNoAcquirePhase(formattedData.tokensForAcquires)) {
    formattedData.tokensForAcquires = 0;
    formattedData.acquireWindowDuration = null;
    formattedData.acquireOpenWindowTime = null;
  }

  return formattedData;
};
