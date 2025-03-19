export const formatVaultData = (vaultData) => {
  const formattedData = { ...vaultData };

  if (formattedData.contributionOpenWindowTime) {
    formattedData.contributionOpenWindowTime = new Date(formattedData.contributionOpenWindowTime).getTime();
  }

  if (formattedData.investmentOpenWindowTime) {
    formattedData.investmentOpenWindowTime = new Date(formattedData.investmentOpenWindowTime).getTime();
  }

  return formattedData;
};
