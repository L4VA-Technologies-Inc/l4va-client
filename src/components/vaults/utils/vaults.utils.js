export const formatVaultData = (vaultData) => {
  const formattedData = { ...vaultData };

  // Format numeric fields
  const numericFields = [
    'ftTokenSupply',
    'ftTokenDecimals',
    'creationThreshold',
    'startThreshold',
    'voteThreshold',
    'executionThreshold',
    'cosigningThreshold',
    'vaultAppreciation',
    'offAssetsOffered',
    'ftInvestmentReserve',
    'liquidityPoolContribution',
  ];

  numericFields.forEach(field => {
    if (formattedData[field] != null && formattedData[field] !== '') {
      if (field === 'ftTokenSupply' || field === 'ftTokenDecimals') {
        formattedData[field] = parseInt(formattedData[field], 10);
      } else {
        formattedData[field] = parseFloat(formattedData[field]);
      }
    }
  });

  // Format dates to timestamps
  if (formattedData.contributionOpenWindowTime) {
    formattedData.contributionOpenWindowTime = new Date(formattedData.contributionOpenWindowTime).getTime();
  }

  if (formattedData.investmentOpenWindowTime) {
    formattedData.investmentOpenWindowTime = new Date(formattedData.investmentOpenWindowTime).getTime();
  }

  // Remove empty optional fields
  Object.keys(formattedData).forEach(key => {
    if (formattedData[key] === '' || formattedData[key] === null) {
      delete formattedData[key];
    }
  });

  return formattedData;
};
