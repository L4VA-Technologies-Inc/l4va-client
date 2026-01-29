/**
 * Messages for proposal execution status
 */

export const PROPOSAL_EXECUTION_MESSAGES = {
  // In Progress messages
  inProgress: {
    burning: 'Burning transaction is being prepared and executed...',
    distribution: 'Distribution transaction is being prepared and executed...',
    marketplace_action: 'Marketplace transactions are being prepared and executed...',
    buy_sell: 'Marketplace transactions are being prepared and executed...',
    staking: 'Staking transaction is being prepared and executed...',
    termination: 'Termination process is being prepared and executed...',
    default: 'Proposal actions are being prepared and executed...',
  },

  // Successfully executed messages
  success: {
    burning: 'Assets have been successfully burned and removed from the vault.',
    distribution: 'ADA has been successfully distributed to all eligible VT holders.',
    staking: 'Assets have been successfully staked according to the proposal.',
    termination: {
      default: 'Vault termination has been successfully completed.',
      dao: 'Vault has been successfully terminated by governance vote.',
    },
    default: 'Proposal has been successfully executed.',
  },

  // Helper messages
  helper: {
    inProgress:
      'This proposal has been approved and is currently being executed on the blockchain. Please check back shortly for the final status.',
  },
};

/**
 * Termination status messages for progress tracking
 */
export const TERMINATION_STATUS_MESSAGES = {
  initiated: 'Termination initiated - Preparing to process vault assets...',
  nft_burning: 'Burning NFTs - Sending NFTs to burn wallet...',
  nft_burned: 'NFTs burned successfully - Proceeding to liquidity removal...',
  lp_removal_pending: 'Removing liquidity - Sending LP tokens to VyFi...',
  lp_removal_awaiting: 'Awaiting liquidity return - Waiting for VyFi to return VT and ADA...',
  lp_return_received: 'Liquidity returned - VT and ADA received from VyFi...',
  vt_burned: 'VT tokens burned - Preparing treasury distribution...',
  ada_in_treasury: 'ADA transferred to treasury - Creating claims for VT holders...',
  claims_created: 'Claims created - VT holders can now claim their share...',
  claims_processing: 'Claims in progress - VT holders are claiming their distributions...',
  claims_complete: 'All claims processed - Finalizing vault termination...',
  vault_burned: 'Vault NFT burned - Cleaning up treasury wallet...',
  treasury_cleaned: 'Treasury cleaned - Termination complete!',
  default: 'Termination process is being prepared and executed...',
};

/**
 * Get in-progress message for proposal type
 */
export const getInProgressMessage = proposalType => {
  return PROPOSAL_EXECUTION_MESSAGES.inProgress[proposalType] || PROPOSAL_EXECUTION_MESSAGES.inProgress.default;
};

/**
 * Get success message for proposal type
 */
export const getSuccessMessage = (proposalType, vault = null) => {
  if (proposalType === 'termination') {
    if (!vault) return PROPOSAL_EXECUTION_MESSAGES.success.termination.default;
    if (vault.termination_type === 'dao') {
      return PROPOSAL_EXECUTION_MESSAGES.success.termination.dao;
    }
    return PROPOSAL_EXECUTION_MESSAGES.success.termination.default;
  }

  return PROPOSAL_EXECUTION_MESSAGES.success[proposalType] || PROPOSAL_EXECUTION_MESSAGES.success.default;
};

/**
 * Get termination status message
 */
export const getTerminationStatusMessage = status => {
  return TERMINATION_STATUS_MESSAGES[status] || TERMINATION_STATUS_MESSAGES.default;
};
