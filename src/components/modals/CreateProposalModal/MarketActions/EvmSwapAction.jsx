import { useCallback, useEffect, useMemo, useState } from 'react';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { useBalance, useReadContracts } from 'wagmi';

import { LavaSteelInput } from '@/components/shared/LavaInput';
import { LavaSteelSelect } from '@/components/shared/LavaSelect.jsx';
import { ProposalOutcome } from '@/components/modals/CreateProposalModal/ProposalOutcome.jsx';
import { toRouteView } from '@/components/vaults/index/IndexBasketEditor';
import { isIndexVault } from '@/components/vaults/index/indexVault.utils';
import { robinhoodChain } from '@/lib/evm/wagmi.config';
import { indexAssetRoutesQuery, useIndexSupportedAssets, useVaultIndex } from '@/services/api/queries';

const NATIVE = '0x0000000000000000000000000000000000000000';
const NATIVE_TOKEN = { address: NATIVE, symbol: 'ETH', name: 'Ether', decimals: 18 };
const CUSTOM_AMOUNT = 'custom';
const PERCENTS = ['25', '50', '75', '100'];

const isValidAddress = addr => /^0x[0-9a-fA-F]{40}$/.test(addr);

/** Human amount → raw base units; '0' when unparsable. */
const toRaw = (human, decimals) => {
  try {
    const raw = parseUnits(String(human || '').trim(), decimals);
    return raw > 0n ? raw.toString() : '0';
  } catch {
    return '0';
  }
};

const formatAmount = (raw, decimals) => {
  const n = Number(formatUnits(raw, decimals));
  return n.toLocaleString(undefined, { maximumSignificantDigits: n >= 1 ? undefined : 4, maximumFractionDigits: 4 });
};

/**
 * Tokens a swap may touch: ETH, what the vault already holds / targets (index vaults) and the
 * whitelist of supported assets. Nothing outside that list can be bought.
 */
const useTokenOptions = vault => {
  const isIndex = isIndexVault(vault);
  const { data: index, isLoading: indexLoading } = useVaultIndex(vault?.id, isIndex);
  const { data: supported, isLoading: supportedLoading } = useIndexSupportedAssets();

  const tokens = useMemo(() => {
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
  return { tokens, loading: (isIndex && indexLoading) || supportedLoading };
};

/** Vault balance of every option, keyed by address (undefined while loading). */
const useVaultBalances = (vaultAddress, tokens) => {
  const enabled = isValidAddress(vaultAddress || '');
  const erc20s = tokens.filter(t => t.address !== NATIVE);
  const { data: native, isLoading: nativeLoading } = useBalance({
    address: vaultAddress,
    chainId: robinhoodChain.id,
    query: { enabled },
  });
  const { data: results, isLoading: erc20Loading } = useReadContracts({
    contracts: erc20s.map(t => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [vaultAddress],
      chainId: robinhoodChain.id,
    })),
    query: { enabled: enabled && erc20s.length > 0 },
  });

  const balances = useMemo(() => {
    const map = new Map();
    if (native) map.set(NATIVE, native.value);
    erc20s.forEach((t, i) => {
      const r = results?.[i];
      if (r?.status === 'success') map.set(t.address, r.result);
    });
    return map;
    // erc20s is derived from tokens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, results, tokens]);
  return { balances, loading: nativeLoading || erc20Loading };
};

/** One plain-text line about the Uniswap route of the non-ETH side of the swap. */
const RouteNote = ({ address, vaultId }) => {
  const q = useQuery(indexAssetRoutesQuery(address, vaultId));
  const route = toRouteView(q);
  if (route.status === 'checking') return <span>Checking route…</span>;
  if (route.status === 'ok') {
    const loss = route.lossBps != null ? ` ${(route.lossBps / 100).toFixed(2)}%` : '';
    return <span title={`Buy: ${route.buyRoute || '—'}\nSell: ${route.sellRoute || '—'}`}>Uniswap{loss}</span>;
  }
  return <span className="text-red-400">{route.reason || 'No Uniswap route'}</span>;
};

const newAction = (input = '', output = NATIVE, percent = '100') => ({
  id: Date.now() + Math.random(),
  input,
  output,
  percent,
  customAmount: '',
});

const SwapRow = ({ action, tokens, balances, vaultId, canRemove, showErrors, onUpdate, onRemove }) => {
  const input = tokens.find(t => t.address === action.input) || null;
  const output = tokens.find(t => t.address === action.output) || null;
  const balance = input ? balances.get(input.address) : undefined;

  const raw =
    !input || balance == null
      ? '0'
      : action.percent === CUSTOM_AMOUNT
        ? toRaw(action.customAmount, input.decimals)
        : ((balance * BigInt(action.percent)) / 100n).toString();
  const overBalance = balance != null && BigInt(raw) > balance;

  const problem = !input
    ? 'Select the token to sell'
    : !output
      ? 'Select the token to buy'
      : input.address === output.address
        ? 'Pick two different tokens'
        : raw === '0'
          ? 'Enter an amount'
          : overBalance
            ? 'More than the vault holds'
            : null;

  const humanAmount = input ? formatUnits(BigInt(raw), input.decimals) : '';
  useEffect(() => {
    if (action.problem !== problem || action.amount !== raw || action.humanAmount !== humanAmount) {
      onUpdate(action.id, { problem, amount: raw, humanAmount, decimals: input?.decimals ?? 18 });
    }
  }, [action, problem, raw, humanAmount, input, onUpdate]);

  const sellOptions = tokens
    .filter(t => (balances.get(t.address) ?? 0n) > 0n || t.address === action.input)
    .map(t => ({
      value: t.address,
      label: `${t.symbol} · ${formatAmount(balances.get(t.address) ?? 0n, t.decimals)}`,
      disabled: t.address === action.output,
    }));
  const buyOptions = tokens.map(t => ({ value: t.address, label: t.symbol, disabled: t.address === action.input }));
  const amountOptions = [
    ...PERCENTS.map(p => ({ value: p, label: p === '100' ? 'All' : `${p}%` })),
    { value: CUSTOM_AMOUNT, label: 'Custom…' },
  ];

  const routeToken = [output, input].find(t => t && t.address !== NATIVE);

  return (
    <div className="py-3 space-y-2 border-b border-steel-750 last:border-b-0">
      <div className="grid grid-cols-[1fr_auto_1fr_7rem] items-center gap-2">
        <LavaSteelSelect
          options={sellOptions}
          value={action.input}
          placeholder="Sell"
          onChange={value => onUpdate(action.id, { input: value })}
        />
        <span className="text-white/40">→</span>
        <LavaSteelSelect
          options={buyOptions}
          value={action.output}
          placeholder="Buy"
          onChange={value => onUpdate(action.id, { output: value })}
        />
        <LavaSteelSelect
          options={amountOptions}
          value={action.percent}
          onChange={value => onUpdate(action.id, { percent: value })}
        />
      </div>

      {action.percent === CUSTOM_AMOUNT && (
        <LavaSteelInput
          placeholder={input ? `Amount of ${input.symbol}` : 'Amount'}
          value={action.customAmount}
          onChange={v => onUpdate(action.id, { customAmount: v })}
          error={showErrors && (raw === '0' || overBalance)}
        />
      )}

      <div className="flex items-center justify-between gap-3 text-xs text-white/40">
        <span className="min-w-0 truncate">
          {input && raw !== '0' && `${formatAmount(BigInt(raw), input.decimals)} ${input.symbol}`}
          {input && raw !== '0' && routeToken && ' · '}
          {routeToken && <RouteNote address={routeToken.address} vaultId={vaultId} />}
          {showErrors && problem && <span className="text-red-400"> · {problem}</span>}
        </span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(action.id)} className="shrink-0 hover:text-white/70">
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

const EvmSwapAction = ({ vault, onDataChange, error }) => {
  const { tokens, loading: tokensLoading } = useTokenOptions(vault);
  const { balances, loading: balancesLoading } = useVaultBalances(vault?.contractAddress, tokens);
  // Tokens and balances arrive in stages; render the rows only once all of them are in, so the
  // list doesn't jump from an ETH-only picker to the full one.
  const loading = tokensLoading || balancesLoading;
  const [actions, setActions] = useState([newAction()]);

  const updateAction = useCallback(
    (id, patch) => setActions(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a))),
    []
  );

  useEffect(() => {
    onDataChange({
      marketActionType: 'evm_swap',
      evmSwapActions: actions.map(a => ({
        id: a.id,
        inputAsset: a.input,
        outputAsset: a.output,
        humanAmount: a.humanAmount ?? '',
        decimals: a.decimals ?? 18,
        amount: a.amount ?? '0',
      })),
      isValid: actions.length > 0 && actions.every(a => a.problem === null),
    });
  }, [actions, onDataChange]);

  const held = tokens.filter(t => t.address !== NATIVE && (balances.get(t.address) ?? 0n) > 0n);
  const sellAll = () => setActions(held.map(t => newAction(t.address, NATIVE, '100')));
  const add = () => setActions(prev => [...prev, newAction()]);
  const remove = id => setActions(prev => prev.filter(a => a.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Swaps</h3>
        <div className="flex gap-4 text-sm">
          {!loading && held.length > 0 && (
            <button type="button" onClick={sellAll} className="text-white/60 hover:text-white">
              Sell all → ETH
            </button>
          )}
          <button type="button" onClick={add} className="text-white/60 hover:text-white">
            + Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-3 space-y-2">
          <div className="h-10 rounded-lg bg-steel-850 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-steel-850 animate-pulse" />
        </div>
      ) : (
        <div>
          {actions.map(action => (
            <SwapRow
              key={action.id}
              action={action}
              tokens={tokens}
              balances={balances}
              vaultId={vault?.id}
              canRemove={actions.length > 1}
              showErrors={!!error}
              onUpdate={updateAction}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      <ProposalOutcome
        storageKey="swap"
        summary="Amounts fixed, prices not · 0.5% slippage · a failed swap stops the rest · bought tokens stay in the vault."
        steps={[
          {
            title: 'Amounts are fixed now, prices are not.',
            detail:
              'A percentage is turned into a fixed amount from the vault balance at creation; how much the vault ' +
              'receives depends on the Uniswap price when the vote passes.',
          },
          {
            title: 'Swaps run in order on Uniswap.',
            detail:
              'Each one trades through whichever v3 or v4 pool gives the better price, with a 0.5% slippage ' +
              'limit — if the price moved more than that, the swap fails instead of filling badly.',
          },
          {
            title: 'A failed swap stops the rest.',
            detail:
              'Swaps already made stay made; later ones do not run. A swap also fails if the vault holds less ' +
              'than its amount by then (e.g. other proposals spent it).',
          },
          {
            title: 'Only whitelisted tokens.',
            detail: 'The vault can buy ETH or tokens from the supported list; bought tokens stay in the vault.',
          },
        ]}
      />
    </div>
  );
};

export default EvmSwapAction;
