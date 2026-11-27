/**
 * L4VAStaking (vault-contract-solidity/src/L4VAStaking.sol) — the user-facing
 * writes. The contract address and listed tokens come from GET /stake/evm/config.
 */
const positionIdsInput = [{ name: 'positionIds', type: 'uint256[]' }] as const;

export const L4VA_STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'positionId', type: 'uint256' }],
  },
  { name: 'unstake', type: 'function', stateMutability: 'nonpayable', inputs: positionIdsInput, outputs: [] },
  { name: 'harvest', type: 'function', stateMutability: 'nonpayable', inputs: positionIdsInput, outputs: [] },
  { name: 'compound', type: 'function', stateMutability: 'nonpayable', inputs: positionIdsInput, outputs: [] },
  { name: 'emergencyUnstake', type: 'function', stateMutability: 'nonpayable', inputs: positionIdsInput, outputs: [] },
  {
    name: 'InsufficientRewardReserve',
    type: 'error',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'needed', type: 'uint256' },
      { name: 'available', type: 'uint256' },
    ],
  },
  {
    name: 'BelowMinStake',
    type: 'error',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'minStake', type: 'uint256' },
    ],
  },
  { name: 'TokenNotEnabled', type: 'error', inputs: [{ name: 'token', type: 'address' }] },
  { name: 'EnforcedPause', type: 'error', inputs: [] },
  {
    name: 'WrongStakeFee',
    type: 'error',
    inputs: [
      { name: 'sent', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
] as const;
