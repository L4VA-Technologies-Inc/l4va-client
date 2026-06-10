export const formatVaultData = vaultData => {
  const formattedData = { ...vaultData };

  if (formattedData.socialLinks.length > 0) {
    // eslint-disable-next-line no-unused-vars
    formattedData.socialLinks = formattedData.socialLinks.map(({ id, ...rest }) => rest);
  }

  // Convert minAcquireThreshold from ADA to lovelace for the API
  if (formattedData.isAcquireOnly && formattedData.minAcquireThreshold != null) {
    formattedData.minAcquireThreshold = Math.round(Number(formattedData.minAcquireThreshold) * 1000000);
  }

  return formattedData;
};
