import { isStepFullyComplete } from '@/utils/stepValidation';

/**
 * Updates the steps array to reflect the actual completion status based on vault data
 * @param {Array} steps - Current steps array
 * @param {Object} vaultData - Current vault data
 * @param {number} currentStep - Current active step
 * @returns {Array} Updated steps array with correct completion status
 */
export const updateStepsCompletionStatus = (steps, vaultData, currentStep) => {
  return steps.map(step => {
    const isComplete = isStepFullyComplete(step.id, vaultData);

    if (step.id === currentStep) {
      return {
        ...step,
        status: 'in progress',
        hasErrors: step.hasErrors, // Preserve existing error state
      };
    } else if (step.id < currentStep) {
      return {
        ...step,
        status: isComplete ? 'completed' : 'pending',
        hasErrors: step.hasErrors, // Preserve existing error state
      };
    } else {
      return {
        ...step,
        status: 'pending',
        hasErrors: step.hasErrors, // Preserve existing error state
      };
    }
  });
};

/**
 * Checks if a step can be navigated to based on completion status
 * @param {number} targetStepId - Step to navigate to
 * @param {number} currentStepId - Current step
 * @param {Object} vaultData - Current vault data
 * @returns {boolean} Whether navigation is allowed
 */
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

/**
 * Gets the next accessible step based on completion status
 * @param {number} currentStepId - Current step
 * @param {Object} vaultData - Current vault data
 * @returns {number} Next accessible step ID
 */
export const getNextAccessibleStep = (currentStepId, vaultData) => {
  const maxSteps = 5;

  for (let stepId = currentStepId + 1; stepId <= maxSteps; stepId++) {
    if (canNavigateToStep(stepId, currentStepId, vaultData)) {
      return stepId;
    }
  }

  return currentStepId; // No next step accessible
};

/**
 * Gets the previous accessible step
 * @param {number} currentStepId - Current step
 * @returns {number} Previous step ID
 */
export const getPreviousAccessibleStep = currentStepId => {
  return Math.max(1, currentStepId - 1);
};

/**
 * Updates step error indicators based on validation errors
 * @param {Array} steps - Current steps array
 * @param {Object} errors - Validation errors
 * @param {Object} stepFields - Mapping of step IDs to their field names
 * @returns {Array} Updated steps array with error indicators
 */
export const updateStepErrorIndicators = (steps, errors, stepFields) => {
  const errorFields = Object.keys(errors);

  return steps.map(step => ({
    ...step,
    hasErrors: errorFields.some(field => stepFields[step.id]?.includes(field)),
  }));
};
