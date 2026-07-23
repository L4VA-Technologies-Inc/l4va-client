export const formatVaultData = (vaultData, isRobinHood = false) => {
  const formattedData = { ...vaultData };

  if (formattedData.socialLinks.length > 0) {
    // eslint-disable-next-line no-unused-vars
    formattedData.socialLinks = formattedData.socialLinks.map(({ id, ...rest }) => rest);
  }

  // Cardano sends minAcquireThreshold in lovelace; Robinhood (EVM) sends it in ETH as entered.
  if (formattedData.isAcquireOnly && formattedData.minAcquireThreshold != null) {
    formattedData.minAcquireThreshold = isRobinHood
      ? Number(formattedData.minAcquireThreshold)
      : Math.round(Number(formattedData.minAcquireThreshold) * 1000000);
  }

  return formattedData;
};
