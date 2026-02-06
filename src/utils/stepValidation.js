// Define mandatory fields for each step
import { VAULT_PRIVACY_TYPES } from '@/components/vaults/constants/vaults.constants.js';

export const mandatoryStepFields = {
  1: ['name', 'type', 'privacy', 'vaultImage'],
  2: ['valueMethod', 'contributionDuration', 'contributionOpenWindowType', 'assetsWhitelist'],
  3: [
    'acquireWindowDuration',
    'acquireOpenWindowType',
    'tokensForAcquires',
    'acquireReserve',
    'liquidityPoolContribution',
    'acquirerWhitelist',
  ],
  4: [
    'ftTokenSupply',
    'ftTokenImg',
    'terminationType',
    'creationThreshold',
    'cosigningThreshold',
    'executionThreshold',
  ],
  5: [],
};

// Function to validate if a step is complete based on mandatory fields
export const isStepComplete = (stepId, vaultData) => {
  const mandatoryFields = mandatoryStepFields[stepId];
  if (!mandatoryFields || mandatoryFields.length === 0) {
    return true; // Step 5 has no mandatory fields
  }

  return mandatoryFields.every(field => {
    if (field === 'assetsWhitelist') {
      if (vaultData.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE) {
        const hasContributorsWhitelist = vaultData.assetsWhitelist && vaultData.assetsWhitelist.length > 0;
        const hasAcquirersWhitelist = vaultData.acquirerWhitelist && vaultData.acquirerWhitelist.length > 0;
        return hasContributorsWhitelist || hasAcquirersWhitelist;
      }
    }
    if (field === 'acquirerWhitelist') {
      if (vaultData.privacy === VAULT_PRIVACY_TYPES.PUBLIC) {
        return true;
      }
      if (vaultData.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE) {
        const hasContributorsWhitelist = vaultData.assetsWhitelist && vaultData.assetsWhitelist.length > 0;
        const hasAcquirersWhitelist = vaultData.acquirerWhitelist && vaultData.acquirerWhitelist.length > 0;

        if (!hasContributorsWhitelist && !hasAcquirersWhitelist) {
          return false;
        }

        return true;
      }
    }

    const value = vaultData[field];

    // Handle different field types
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    if (typeof value === 'number') {
      return value !== null && value !== undefined;
    }

    return value !== null && value !== undefined && value !== '';
  });
};

// Function to validate conditional fields based on vault data
export const validateConditionalFields = (stepId, vaultData) => {
  switch (stepId) {
    case 2:
      // contributionOpenWindowTime is required when contributionOpenWindowType is 'custom'
      if (vaultData.contributionOpenWindowType === 'custom') {
        return vaultData.contributionOpenWindowTime !== null && vaultData.contributionOpenWindowTime !== undefined;
      }
      return true;

    case 4:
      // timeElapsedIsEqualToTime and vaultAppreciation are required when terminationType is 'programmed'
      if (vaultData.terminationType === 'programmed') {
        return (
          vaultData.timeElapsedIsEqualToTime !== null &&
          vaultData.timeElapsedIsEqualToTime !== undefined &&
          vaultData.vaultAppreciation !== null &&
          vaultData.vaultAppreciation !== undefined
        );
      }
      return true;

    default:
      return true;
  }
};

// Function to check if a step is fully complete (mandatory + conditional fields)
export const isStepFullyComplete = (stepId, vaultData) => {
  return isStepComplete(stepId, vaultData) && validateConditionalFields(stepId, vaultData);
};

// Function to check if a user can navigate to a specific step
export const canNavigateToStep = (targetStepId, currentStepId, vaultData) => {
  // Can always navigate to current step or previous steps
  if (targetStepId <= currentStepId) {
    return true;
  }

  // For future steps, check if all previous steps are complete
  for (let stepId = 1; stepId < targetStepId; stepId++) {
    if (!isStepFullyComplete(stepId, vaultData)) {
      return false;
    }
  }

  return true;
};

// Function to check if a step is accessible for navigation (more strict)
export const isStepAccessible = (stepId, currentStepId, vaultData) => {
  // Can always access current step
  if (stepId === currentStepId) {
    return true;
  }

  // Can always access previous steps
  if (stepId < currentStepId) {
    return true;
  }

  // For future steps, check if current step is complete
  if (stepId > currentStepId) {
    return isStepFullyComplete(currentStepId, vaultData);
  }

  return false;
};

// Function to get the next accessible step
export const getNextAccessibleStep = (currentStepId, vaultData) => {
  const maxSteps = 5;

  for (let stepId = currentStepId + 1; stepId <= maxSteps; stepId++) {
    if (canNavigateToStep(stepId, currentStepId, vaultData)) {
      return stepId;
    }
  }

  return currentStepId; // No next step accessible
};

// Function to get the previous accessible step
export const getPreviousAccessibleStep = currentStepId => {
  return Math.max(1, currentStepId - 1);
};
