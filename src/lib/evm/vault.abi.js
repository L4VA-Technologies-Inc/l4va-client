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
