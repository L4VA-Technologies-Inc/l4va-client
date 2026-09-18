// Minimal V3 Vault ABI: only the contribute* entry points used by the
// EVM contribution flow. The vault address is returned per-tx by the backend
// (evm-vault-contribution.service#prepareContribution).
//
// Solidity signatures (see vault-contract-solidity):
//   struct ContributionAuthorization {
//     uint256 cycleId;
//     address contributor;
//     uint8   kind;       // 0=Native, 1=ERC20, 2=ERC721, 3=ERC1155
//     address asset;
//     uint256 tokenId;
//     uint256 amount;
//     uint256 nonce;
//     uint256 deadline;
//   }
export const CONTRIBUTION_AUTHORIZATION_COMPONENTS = [
  { name: 'cycleId', type: 'uint256' },
  { name: 'contributor', type: 'address' },
  { name: 'kind', type: 'uint8' },
  { name: 'asset', type: 'address' },
  { name: 'tokenId', type: 'uint256' },
  { name: 'amount', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

export const VAULT_CONTRIBUTION_ABI = [
  {
    type: 'function',
    name: 'contributeNative',
    stateMutability: 'payable',
    inputs: [
      { name: 'auth', type: 'tuple', components: CONTRIBUTION_AUTHORIZATION_COMPONENTS },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'contributeERC20',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'auth', type: 'tuple', components: CONTRIBUTION_AUTHORIZATION_COMPONENTS },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'contributeERC721',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'auth', type: 'tuple', components: CONTRIBUTION_AUTHORIZATION_COMPONENTS },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'contributeERC1155',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'auth', type: 'tuple', components: CONTRIBUTION_AUTHORIZATION_COMPONENTS },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
];

// Termination / redemption entry points (V6 vault).
//
// After a TERMINATION proposal executes, the vault commits a fixed redemption
// rate per distributable asset and opens redemption. A VT holder calls
// `redeem(recipient)` which burns their ENTIRE VT balance and pays their
// pro-rata share of every committed asset in one transaction. `previewRedeem`
// is a view helper for "what would I get for asset X right now".
export const VAULT_TERMINATION_ABI = [
  {
    type: 'function',
    name: 'redeem',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: [{ name: 'burned', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'terminationAssets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'terminationDeadline',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'terminationOutstanding',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'previewRedeem',
    stateMutability: 'view',
    inputs: [
      { name: 'holder', type: 'address' },
      { name: 'asset', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
];

// ERC20 approve(spender, amount)
export const ERC20_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
];

// ERC721 approve(to, tokenId)
export const ERC721_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
];

// ERC1155 setApprovalForAll(operator, approved)
export const ERC1155_APPROVAL_ABI = [
  {
    type: 'function',
    name: 'setApprovalForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
];

/**
 * Distributions. A passed Distribution proposal reserves a pot inside the vault
 * contract; holders then pull their pro-rata share themselves — the backend only
 * opens the distribution, it never pushes funds out. VT is NOT burned by a claim.
 */
export const VAULT_DISTRIBUTION_ABI = [
  {
    type: 'function',
    name: 'totalDistributions',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getDistribution',
    stateMutability: 'view',
    inputs: [{ name: 'distributionId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'asset', type: 'address' },
          { name: 'timepoint', type: 'uint48' },
          { name: 'netPot', type: 'uint256' },
          { name: 'supply', type: 'uint256' },
          { name: 'paid', type: 'uint256' },
          { name: 'released', type: 'uint256' },
          { name: 'openedAt', type: 'uint64' },
          { name: 'deadline', type: 'uint64' },
          { name: 'swept', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'distributionClaimable',
    stateMutability: 'view',
    inputs: [
      { name: 'distributionId', type: 'uint256' },
      { name: 'holder', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'isDistributionClaimed',
    stateMutability: 'view',
    inputs: [
      { name: 'distributionId', type: 'uint256' },
      { name: 'holder', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'claimDistribution',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
];
