/**
 * Minimal ABI for VaultFactory — only the createVault function.
 * Full contract ABI is not needed on the frontend.
 *
 * Mirrors the Solidity signature:
 *   createVault(VaultConfig cfg, uint256 adminNonce, uint256 deadline, bytes adminSignature)
 *     returns (address vault, address vaultToken)
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
              {
                name: 'nativeRate',
                type: 'tuple',
                components: [
                  { name: 'vtPerAssetUnit', type: 'uint256' },
                  { name: 'assetDecimals', type: 'uint8' },
                  { name: 'version', type: 'uint32' },
                  { name: 'enabled', type: 'bool' },
                ],
              },
              {
                name: 'erc20Rates',
                type: 'tuple[]',
                components: [
                  { name: 'asset', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'vtPerAssetUnit', type: 'uint256' },
                      { name: 'assetDecimals', type: 'uint8' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'erc1155Rates',
                type: 'tuple[]',
                components: [
                  { name: 'asset', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'vtPerAssetUnit', type: 'uint256' },
                      { name: 'assetDecimals', type: 'uint8' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'nftCollectionRates',
                type: 'tuple[]',
                components: [
                  { name: 'collection', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'vtPerToken', type: 'uint256' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'nftTokenIdOverrides',
                type: 'tuple[]',
                components: [
                  { name: 'collection', type: 'address' },
                  { name: 'tokenId', type: 'uint256' },
                  { name: 'vtEntitlement', type: 'uint256' },
                ],
              },
              {
                name: 'erc20NativeRates',
                type: 'tuple[]',
                components: [
                  { name: 'asset', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'nativePerAssetUnit', type: 'uint256' },
                      { name: 'assetDecimals', type: 'uint8' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'erc1155NativeRates',
                type: 'tuple[]',
                components: [
                  { name: 'asset', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'nativePerAssetUnit', type: 'uint256' },
                      { name: 'assetDecimals', type: 'uint8' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'nftNativeCollectionRates',
                type: 'tuple[]',
                components: [
                  { name: 'collection', type: 'address' },
                  {
                    name: 'rate',
                    type: 'tuple',
                    components: [
                      { name: 'nativePerToken', type: 'uint256' },
                      { name: 'version', type: 'uint32' },
                      { name: 'enabled', type: 'bool' },
                    ],
                  },
                ],
              },
              {
                name: 'nftNativeTokenIdOverrides',
                type: 'tuple[]',
                components: [
                  { name: 'collection', type: 'address' },
                  { name: 'tokenId', type: 'uint256' },
                  { name: 'nativePayoutEntitlement', type: 'uint256' },
                ],
              },
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
