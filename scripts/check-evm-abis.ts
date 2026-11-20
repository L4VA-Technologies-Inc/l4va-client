/**
 * Checks the hand-written EVM ABI fragments in src/lib/evm against the Foundry build of
 * vault-contract-solidity, so the frontend cannot drift from the contracts unnoticed.
 *
 * Every function / error / event the app declares must exist in the contract artifacts with the
 * same signature (name + parameter types, tuples expanded) and, for functions, the same
 * mutability and outputs. Parameter names are not compared: they do not affect encoding.
 *
 *   yarn check:abis [path/to/vault-contract-solidity]   (default: ../vault-contract-solidity)
 *
 * Run `forge build` in the contracts repo first. Exits 1 on any mismatch.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import type { Abi, AbiFunction } from 'viem';
import { formatAbiItem } from 'viem/utils';

import { REWARDS_DISTRIBUTOR_ABI } from '../src/lib/evm/rewardsDistributor.abi';
import {
  ERC1155_APPROVAL_ABI,
  ERC20_APPROVE_ABI,
  ERC721_APPROVE_ABI,
  VAULT_CONTRIBUTION_ABI,
  VAULT_TERMINATION_ABI,
} from '../src/lib/evm/vault.abi';
import { VAULT_FACTORY_ABI, VAULT_FACTORY_ABI_V13 } from '../src/lib/evm/vaultFactory.abi';

const repo = resolve(process.argv[2] ?? '../vault-contract-solidity');
const out = resolve(repo, 'out');
if (!existsSync(out)) {
  console.error(`No Foundry build at ${out}. Run \`forge build\` in vault-contract-solidity first.`);
  process.exit(2);
}

const artifact = (file: string, contract: string): Abi =>
  JSON.parse(readFileSync(resolve(out, file, `${contract}.json`), 'utf8')).abi as Abi;

/** Every ABI item reachable from a vault address (diamond-style facets share one address). */
const vaultAbi: Abi = [...artifact('IVault.sol', 'IVault'), ...artifact('VaultErrors.sol', 'VaultErrors')];

const checks: Array<{ label: string; local: Abi; onchain: Abi }> = [
  { label: 'VAULT_CONTRIBUTION_ABI', local: VAULT_CONTRIBUTION_ABI as Abi, onchain: vaultAbi },
  { label: 'VAULT_TERMINATION_ABI', local: VAULT_TERMINATION_ABI as Abi, onchain: vaultAbi },
  // The current factory is V13. VAULT_FACTORY_ABI (pre-V13 config) is kept for vaults signed
  // against older factories and has no artifact in the current build.
  {
    label: 'VAULT_FACTORY_ABI_V13',
    local: VAULT_FACTORY_ABI_V13 as Abi,
    onchain: artifact('VaultFactory.sol', 'VaultFactory'),
  },
  {
    label: 'REWARDS_DISTRIBUTOR_ABI',
    local: REWARDS_DISTRIBUTOR_ABI as Abi,
    onchain: artifact('L4VARewardsDistributor.sol', 'L4VARewardsDistributor'),
  },
];
// Standard token ABIs are fixed by the ERCs; nothing to compare against.
void [ERC20_APPROVE_ABI, ERC721_APPROVE_ABI, ERC1155_APPROVAL_ABI, VAULT_FACTORY_ABI];

type Param = { type: string; components?: readonly Param[] };
const typeOf = (p: Param): string =>
  p.type.startsWith('tuple') ? `(${(p.components ?? []).map(typeOf).join(',')})${p.type.slice(5)}` : p.type;
const outputsOf = (item: AbiFunction): string => item.outputs.map(typeOf).join(',');

let failures = 0;
for (const { label, local, onchain } of checks) {
  for (const item of local) {
    if (!('name' in item)) continue;
    const sig = formatAbiItem(item);
    const match = onchain.find(o => o.type === item.type && 'name' in o && formatAbiItem(o) === sig);
    if (!match) {
      const sameName = onchain.filter(o => o.type === item.type && 'name' in o && o.name === item.name);
      console.error(`✗ ${label}: ${sig}`);
      for (const o of sameName) console.error(`    contract has: ${formatAbiItem(o)}`);
      if (sameName.length === 0) console.error('    contract has no item with this name');
      failures++;
      continue;
    }
    if (item.type === 'function' && match.type === 'function') {
      if (item.stateMutability !== match.stateMutability) {
        console.error(`✗ ${label}: ${item.name} mutability ${item.stateMutability} ≠ ${match.stateMutability}`);
        failures++;
      } else if (outputsOf(item) !== outputsOf(match)) {
        console.error(`✗ ${label}: ${item.name} outputs (${outputsOf(item)}) ≠ (${outputsOf(match)})`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} ABI mismatch(es) against ${repo}`);
  process.exit(1);
}
console.log(`All EVM ABI fragments match ${repo}`);
