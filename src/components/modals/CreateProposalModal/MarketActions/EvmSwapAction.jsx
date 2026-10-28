import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, X, ArrowDown } from 'lucide-react';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useBalance, useReadContract } from 'wagmi';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { isIndexVault } from '@/components/vaults/index/indexVault.utils';
import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { useIndexSupportedAssets, useVaultIndex } from '@/services/api/queries';

const NATIVE = '0x0000000000000000000000000000000000000000';
const CUSTOM = 'custom';

const NATIVE_TOKEN = { address: NATIVE, symbol: 'ETH', name: 'Ether', decimals: 18 };

const isValidAddress = addr => /^0x[0-9a-fA-F]{40}$/.test(addr);
const shortAddr = addr => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/** Human amount → raw base units; '0' when unparsable. */
const toRaw = (human, decimals) => {
  try {
    const raw = parseUnits(String(human || '').trim(), decimals);
    return raw > 0n ? raw.toString() : '0';
  } catch {
    return '0';
  }
};

const formatBalance = (raw, decimals) => {
  const n = Number(formatUnits(raw, decimals));
  return n.toLocaleString(undefined, { maximumFractionDigits: n >= 1000 ? 2 : 6 });
};

/**
 * Tokens the proposer can pick: native ETH, what the vault already holds (index
 * vaults) and the index allow-list. Anything else goes through "Custom address".
 */
const useTokenOptions = vault => {
  const isIndex = isIndexVault(vault);
  const { data: index } = useVaultIndex(vault?.id, isIndex);
  const { data: supported } = useIndexSupportedAssets();

  return useMemo(() => {
    const byAddress = new Map([[NATIVE, NATIVE_TOKEN]]);
    const add = t => {
      const address = t.assetAddress?.toLowerCase();
      if (!isValidAddress(address || '') || byAddress.has(address)) return;
      byAddress.set(address, { address, symbol: t.symbol, name: t.name, decimals: Number(t.decimals ?? 18) });
    };
    (index?.portfolio?.assets || []).forEach(add);
    (index?.config?.targets || []).forEach(add);
    (supported?.assets || []).forEach(add);
    return [...byAddress.values()];
  }, [index, supported]);
};

/** Spendable balance of `token` held by the vault contract. */
const useVaultTokenBalance = (vaultAddress, token) => {
  const enabled = isValidAddress(vaultAddress || '') && !!token;
  const isNative = token?.address === NATIVE;
  const { data: native } = useBalance({
    address: vaultAddress,
    chainId: robinhoodChain.id,
    query: { enabled: enabled && isNative },
  });
  const { data: erc20 } = useReadContract({
    address: token?.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [vaultAddress],
    chainId: robinhoodChain.id,
    query: { enabled: enabled && !isNative },
  });
  return isNative ? native?.value : erc20;
};

/** Resolves symbol/decimals of a pasted ERC-20 address. */
const useCustomToken = address => {
  const valid = isValidAddress(address || '');
  const read = functionName => ({
    address,
    abi: erc20Abi,
    functionName,
    chainId: robinhoodChain.id,
    query: { enabled: valid },
  });
  const { data: decimals, isError } = useReadContract(read('decimals'));
  const { data: symbol } = useReadContract(read('symbol'));
  if (!valid) return { token: null, error: address ? 'Not a valid address' : null };
  if (isError) return { token: null, error: 'Not an ERC-20 token on Robinhood Chain' };
  if (decimals == null) return { token: null, error: null };
  return {
    token: { address: address.toLowerCase(), symbol: symbol || shortAddr(address), decimals: Number(decimals) },
  };
};

const TokenPicker = ({ label, options, selection, onChange, exclude }) => {
  const custom = useCustomToken(selection.custom);
  const selectOptions = [
    ...options.map(t => ({
      value: t.address,
      label: t.address === NATIVE ? 'ETH' : `${t.symbol} · ${shortAddr(t.address)}`,
      disabled: t.address === exclude,
    })),
    { value: CUSTOM, label: 'Custom address…' },
  ];

  const token = selection.value === CUSTOM ? custom.token : options.find(t => t.address === selection.value) || null;

  useEffect(() => {
    if (token?.address !== selection.token?.address || token?.decimals !== selection.token?.decimals) {
      onChange({ ...selection, token });
    }
  }, [token, selection, onChange]);

  return (
    <div className="space-y-2">
      <span className="text-sm text-white/60">{label}</span>
      <LavaSteelSelect
        options={selectOptions}
        value={selection.value}
        placeholder="Select token"
        onChange={value => onChange({ value, custom: '', token: null })}
      />
      {selection.value === CUSTOM && (
        <LavaSteelInput
          placeholder="0x… ERC-20 address"
          value={selection.custom}
          onChange={v => onChange({ ...selection, custom: v.trim() })}
          error={!!custom.error}
          helperText={custom.error || (custom.token && `${custom.token.symbol} · ${custom.token.decimals} decimals`)}
        />
      )}
    </div>
  );
};

const emptyAction = () => ({
  id: Date.now() + Math.random(),
  input: { value: NATIVE, custom: '', token: NATIVE_TOKEN },
  output: { value: '', custom: '', token: null },
  humanAmount: '',
});

const SwapRow = ({ action, index, options, vaultAddress, canRemove, showErrors, onUpdate, onRemove }) => {
  const { input, output, humanAmount } = action;
  const balance = useVaultTokenBalance(vaultAddress, input.token);
  const raw = input.token ? toRaw(humanAmount, input.token.decimals) : '0';
  const overBalance = balance != null && BigInt(raw) > balance;

  const problem = !input.token
    ? 'Select the token to sell'
    : !output.token
      ? 'Select the token to buy'
      : input.token.address === output.token.address
        ? 'Pick two different tokens'
        : raw === '0'
          ? 'Enter an amount'
          : overBalance
            ? 'Amount is more than the vault holds'
            : null;

  useEffect(() => {
    if (action.problem !== problem || action.amount !== raw) onUpdate(action.id, { problem, amount: raw });
  }, [action.id, action.problem, action.amount, problem, raw, onUpdate]);

  const setInput = useCallback(next => onUpdate(action.id, { input: next }), [action.id, onUpdate]);
  const setOutput = useCallback(next => onUpdate(action.id, { output: next }), [action.id, onUpdate]);

  return (
    <div className="bg-steel-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">
          Swap {index + 1}
          {showErrors && problem && <span className="text-red-500 ml-2">{problem}</span>}
        </span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(action.id)} className="text-red-400 hover:text-red-500 p-1">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <TokenPicker
        label="Sell"
        options={options}
        selection={input}
        onChange={setInput}
        exclude={output.token?.address}
      />

      <div>
        <LavaSteelInput
          placeholder="0.0"
          value={humanAmount}
          onChange={v => onUpdate(action.id, { humanAmount: v })}
          error={showErrors && (raw === '0' || overBalance)}
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>
            Vault balance:{' '}
            {balance != null && input.token
              ? `${formatBalance(balance, input.token.decimals)} ${input.token.symbol}`
              : '—'}
          </span>
          {balance != null && balance > 0n && input.token && (
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => onUpdate(action.id, { humanAmount: formatUnits(balance, input.token.decimals) })}
            >
              Max
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="h-5 w-5 text-white/40" />
      </div>

      <TokenPicker
        label="Buy"
        options={options}
        selection={output}
        onChange={setOutput}
        exclude={input.token?.address}
      />
    </div>
  );
};

const EvmSwapAction = ({ vault, onDataChange, error }) => {
  const [actions, setActions] = useState([emptyAction()]);
  const options = useTokenOptions(vault);

  const updateAction = useCallback(
    (id, patch) => setActions(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a))),
    []
  );

  useEffect(() => {
    onDataChange({
      marketActionType: 'evm_swap',
      evmSwapActions: actions.map(a => ({
        id: a.id,
        inputAsset: a.input.token?.address ?? '',
        outputAsset: a.output.token?.address ?? '',
        humanAmount: a.humanAmount,
        decimals: a.input.token?.decimals ?? 18,
        amount: a.amount ?? '0',
      })),
      isValid: actions.length > 0 && actions.every(a => a.problem === null),
    });
  }, [actions, onDataChange]);

  const add = () => setActions(prev => [...prev, emptyAction()]);
  const remove = id => setActions(prev => prev.filter(a => a.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Swaps</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors border border-steel-750"
        >
          Add Swap <Plus className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-white/40">
        If the proposal passes, the vault trades on Uniswap (v3 or v4, whichever pool gives the better price) on
        Robinhood Chain. The price is quoted at execution with a 0.5% slippage limit.
      </p>

      {actions.map((action, index) => (
        <SwapRow
          key={action.id}
          action={action}
          index={index}
          options={options}
          vaultAddress={vault?.contractAddress}
          canRemove={actions.length > 1}
          showErrors={!!error}
          onUpdate={updateAction}
          onRemove={remove}
        />
      ))}
    </div>
  );
};

export default EvmSwapAction;
