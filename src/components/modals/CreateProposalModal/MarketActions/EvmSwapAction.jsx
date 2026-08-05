import { useEffect, useState } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useReadContract } from 'wagmi';

import { LavaSteelInput } from '@/components/shared/LavaInput';

const ERC20_DECIMALS_ABI = [
  { type: 'function', stateMutability: 'view', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }] },
];

const isValidAddress = addr => /^0x[0-9a-fA-F]{40}$/.test(addr);

/** Fetches ERC-20 decimals for a given address and notifies the parent. */
const DecimalsResolver = ({ address, onResolved }) => {
  const { data } = useReadContract({
    address,
    abi: ERC20_DECIMALS_ABI,
    functionName: 'decimals',
    query: { enabled: isValidAddress(address) },
  });

  useEffect(() => {
    if (data != null) onResolved(Number(data));
  }, [data, onResolved]);

  return null;
};

/** Convert human-readable amount to raw bigint string using token decimals. */
const toRaw = (human, decimals) => {
  const n = parseFloat(human);
  if (!human || isNaN(n) || n <= 0) return '0';
  const factor = 10 ** decimals;
  return String(BigInt(Math.round(n * factor)));
};

const emptyAction = () => ({
  id: Date.now() + Math.random(),
  inputAsset: '',
  outputAsset: '',
  humanAmount: '',
  decimals: 18, // default; updated by DecimalsResolver when address resolves
});

const isValidAction = action =>
  isValidAddress(action.inputAsset) &&
  isValidAddress(action.outputAsset) &&
  action.inputAsset.toLowerCase() !== action.outputAsset.toLowerCase() &&
  parseFloat(action.humanAmount) > 0;

const EvmSwapAction = ({ onDataChange, error }) => {
  const [actions, setActions] = useState([emptyAction()]);

  useEffect(() => {
    onDataChange({
      marketActionType: 'evm_swap',
      evmSwapActions: actions.map(a => ({ ...a, amount: toRaw(a.humanAmount, a.decimals) })),
      isValid: actions.length > 0 && actions.every(isValidAction),
    });
  }, [actions, onDataChange]);

  const update = (id, field, value) => setActions(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));

  const add = () => setActions(prev => [...prev, emptyAction()]);
  const remove = id => setActions(prev => prev.filter(a => a.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">EVM Swap Actions</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 bg-steel-850 hover:bg-steel-850/70 text-white/60 px-4 py-2 rounded-lg transition-colors border border-steel-750"
        >
          Add Swap <Plus className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-white/40">
        Each swap calls UniswapV3 on Robinhood Chain via the vault adapter. Token decimals are fetched automatically
        once you enter a valid ERC-20 address.
      </p>

      {actions.map((action, index) => {
        const invalid = error && !isValidAction(action);
        const rawPreview = isValidAction(action) ? toRaw(action.humanAmount, action.decimals) : null;

        return (
          <div key={action.id} className="bg-steel-800 rounded-lg p-4 space-y-4">
            {/* resolve decimals silently when the input address is valid */}
            <DecimalsResolver address={action.inputAsset} onResolved={d => update(action.id, 'decimals', d)} />

            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">
                Swap {index + 1}
                {invalid && <span className="text-red-500 ml-2">Fill in valid addresses and amount</span>}
              </span>
              {actions.length > 1 && (
                <button type="button" onClick={() => remove(action.id)} className="text-red-400 hover:text-red-500 p-1">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <LavaSteelInput
                label="Input token (ERC-20 address)"
                placeholder="0x..."
                value={action.inputAsset}
                onChange={v => update(action.id, 'inputAsset', v)}
                error={invalid && !isValidAddress(action.inputAsset)}
              />
              <div className="flex items-center justify-center pb-2">
                <ArrowRight className="h-5 w-5 text-white/40" />
              </div>
              <LavaSteelInput
                label="Output token (ERC-20 address)"
                placeholder="0x..."
                value={action.outputAsset}
                onChange={v => update(action.id, 'outputAsset', v)}
                error={invalid && !isValidAddress(action.outputAsset)}
              />
            </div>

            <LavaSteelInput
              label={`Amount${action.decimals !== 18 ? ` (token has ${action.decimals} decimals)` : ''}`}
              placeholder="e.g. 1.5"
              value={action.humanAmount}
              onChange={v => update(action.id, 'humanAmount', v)}
              error={invalid && !(parseFloat(action.humanAmount) > 0)}
              helperText={rawPreview && `Raw on-chain: ${rawPreview}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EvmSwapAction;
