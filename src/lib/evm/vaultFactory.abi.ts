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

const CREATE_VAULT = VAULT_FACTORY_ABI[0];
const CFG = CREATE_VAULT.inputs[0];
const INITIAL_CYCLE = CFG.components[11];

/**
 * V13 factory: `CycleConfig` gains `nativeVtPrice`, `assetVtPrices`, `vtCap`, and `VaultConfig` gains
 * `economics` (the vault's supply, acquirer and LP share, LP mode and expansion cap, fixed for its life).
 * The API says which one a creation payload is for (`evmConfigVersion: 13`).
 */
export const VAULT_FACTORY_ABI_V13 = [
  {
    ...CREATE_VAULT,
    inputs: [
      {
        ...CFG,
        components: [
          ...CFG.components.slice(0, 11),
          {
            ...INITIAL_CYCLE,
            components: [
              ...INITIAL_CYCLE.components,
              { name: 'nativeVtPrice', type: 'uint256' },
              { name: 'assetVtPrices', type: 'uint256[]' },
              { name: 'vtCap', type: 'uint256' },
            ],
          },
          {
            name: 'economics',
            type: 'tuple',
            components: [
              { name: 'vtSupply', type: 'uint256' },
              { name: 'acquirerBps', type: 'uint16' },
              { name: 'lpBps', type: 'uint16' },
              { name: 'lpMode', type: 'uint8' },
              { name: 'lpVtPerNative', type: 'uint256' },
              { name: 'maxExpansionBps', type: 'uint16' },
            ],
          },
        ],
      },
      ...CREATE_VAULT.inputs.slice(1),
    ],
  },
] as const;

/** The factory ABI a creation payload was signed for. */
export const vaultFactoryAbiFor = (configVersion?: number) =>
  configVersion && configVersion >= 13 ? VAULT_FACTORY_ABI_V13 : VAULT_FACTORY_ABI;
