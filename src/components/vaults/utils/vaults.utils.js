export const formatVaultData = (vaultData) => {
  const formattedData = { ...vaultData };

  // Format numeric fields
  const numericFields = [
    'contributionDuration',
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
    } else {
      formattedData[field] = 0;
    }
  });

  return formattedData;
};
