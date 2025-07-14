export const formatVaultData = vaultData => {
  const formattedData = { ...vaultData };

  if (formattedData.socialLinks.length > 0) {
    // eslint-disable-next-line no-unused-vars
    formattedData.socialLinks = formattedData.socialLinks.map(({ id, ...rest }) => rest);
  }

  return formattedData;
};
