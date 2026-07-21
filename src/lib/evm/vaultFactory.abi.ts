/**
 * Minimal V3 ABI for VaultFactory — only the createVault function.
 * Full contract ABI is not needed on the frontend.
 *
 * Mirrors the Solidity V3 signature:
 *   createVault(VaultConfig cfg, uint256 adminNonce, uint256 deadline, bytes adminSignature)
 *     returns (address vault, address vaultToken)
 *
 * V3 removes all rate tables from CycleConfig — final VT / native
 * allocations are committed off-chain and published on-chain as a Merkle
 * root at Vault.closeCycle(...). If the contract is ever upgraded, this
 * ABI must be kept in sync with `src/libraries/VaultTypes.sol` in the
 * `vault-contract-solidity` repo.
 */
export const VAULT_FACTORY_ABI = [
  {
    type: 'function',
    name: 'createVault',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'cfg',
        type: 'tuple',
        components: [
          { name: 'vaultId', type: 'bytes32' },
          { name: 'creator', type: 'address' },
          { name: 'admin', type: 'address' },
          { name: 'mintingKey', type: 'address' },
          { name: 'treasury', type: 'address' },
          { name: 'vtName', type: 'string' },
          { name: 'vtSymbol', type: 'string' },
          { name: 'vtDecimals', type: 'uint8' },
          {
            name: 'initialCycle',
            type: 'tuple',
            components: [
              {
                name: 'assetWindow',
                type: 'tuple',
                components: [
                  { name: 'start', type: 'uint64' },
                  { name: 'end', type: 'uint64' },
                ],
              },
              {
                name: 'acquireWindow',
                type: 'tuple',
                components: [
                  { name: 'start', type: 'uint64' },
                  { name: 'end', type: 'uint64' },
                ],
              },
              { name: 'minAcquireThreshold', type: 'uint256' },
              { name: 'adaPairVtPerNativeUnit', type: 'uint256' },
              { name: 'assetWhitelist', type: 'address[]' },
              { name: 'contributorWhitelist', type: 'address[]' },
            ],
          },
        ],
      },
      { name: 'adminNonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'adminSignature', type: 'bytes' },
    ],
    outputs: [
      { name: 'vault', type: 'address' },
      { name: 'vaultToken', type: 'address' },
    ],
  },
] as const;
