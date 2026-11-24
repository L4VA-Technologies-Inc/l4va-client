// L4VARewardsDistributor (vault-contract-solidity/src/L4VARewardsDistributor.sol).
// The distributor address, cumulative amount and proof come from
// GET /api/v1/rewards/me/claims/evm-distributor.
//
//   function claim(address account, uint256 cumulativeAmount, bytes32[] proof) returns (uint256 payout)
//
// Pays `cumulativeAmount - claimed[account]` to `account`, whoever sends the tx.
export const REWARDS_DISTRIBUTOR_ABI = [
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'cumulativeAmount', type: 'uint256' },
      { name: 'proof', type: 'bytes32[]' },
    ],
    outputs: [{ name: 'payout', type: 'uint256' }],
  },
  { type: 'error', name: 'InvalidProof', inputs: [] },
  { type: 'error', name: 'NothingToClaim', inputs: [] },
  { type: 'error', name: 'NoActiveRoot', inputs: [] },
  { type: 'error', name: 'EnforcedPause', inputs: [] },
] as const;
