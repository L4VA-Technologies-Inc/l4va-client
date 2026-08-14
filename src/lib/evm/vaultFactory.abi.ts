/**
 * Minimal V4 ABI for VaultFactory — only the createVault function.
 *
 * V4 VaultConfig adds archetype (bytes32), vaultDeployer (address),
 * creationApprover (address), and authority (address); the V3 `admin`
 * field is gone. Keep in sync with VaultTypes.sol in vault-contract-solidity.
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
          { name: 'archetype', type: 'bytes32' },
          { name: 'vaultDeployer', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'creationApprover', type: 'address' },
          { name: 'authority', type: 'address' },
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
