import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';

import { LavaSteelInput } from '@/components/shared/LavaInput';

const ERC20_DECIMALS_ABI = [
  { type: 'function', stateMutability: 'view', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }] },
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const isValidAddress = addr => /^0x[0-9a-fA-F]{40}$/.test(addr);

const toRaw = (human, decimals) => {
  const n = parseFloat(human);
  if (!human || isNaN(n) || n <= 0) return '0';
  return String(BigInt(Math.round(n * 10 ** decimals)));
};

const isValid = action =>
  Number(action.positionId) > 0 &&
  isValidAddress(action.positionAsset) &&
  isValidAddress(action.underlyingAsset) &&
  parseFloat(action.humanAmount) > 0;

const EvmClosePositionAction = ({ onDataChange, error }) => {
  const [action, setAction] = useState({
    positionId: '',
    positionAsset: '',
    underlyingAsset: '',
    humanAmount: '',
  });
  const [decimals, setDecimals] = useState(18);

  const update = (field, value) => setAction(prev => ({ ...prev, [field]: value }));
  const validPositionAsset = isValidAddress(action.positionAsset);

  // Fetch decimals from the position asset contract.
  const { data: resolvedDecimals } = useReadContract({
    address: validPositionAsset ? action.positionAsset : ZERO_ADDRESS,
    abi: ERC20_DECIMALS_ABI,
    functionName: 'decimals',
    query: { enabled: validPositionAsset },
  });

  useEffect(() => {
    if (resolvedDecimals != null) setDecimals(Number(resolvedDecimals));
  }, [resolvedDecimals]);

  useEffect(() => {
    onDataChange({
      marketActionType: 'evm_close_position',
      evmClosePositionAction: { ...action, positionAmount: toRaw(action.humanAmount, decimals) },
      isValid: isValid(action, decimals),
    });
  }, [action, decimals, onDataChange]);

  const invalid = error && !isValid(action, decimals);
  const rawPreview = isValid(action, decimals) ? toRaw(action.humanAmount, decimals) : null;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium">Close Position</h3>
      <p className="text-sm text-white/40">
        Unwinds an open Uniswap adapter position by swapping the held token back to the underlying asset. The backend
        computes the minimum return automatically.
      </p>

      <div className="bg-steel-800 rounded-lg p-4 space-y-4">
        <LavaSteelInput
          label="Position ID (on-chain)"
          placeholder="e.g. 3"
          value={action.positionId}
          onChange={v => update('positionId', v)}
          error={invalid && !(Number(action.positionId) > 0)}
          helperText="The numeric position ID emitted by the PositionOpened event"
        />
        <LavaSteelInput
          label="Position asset (token currently held)"
          placeholder="0x..."
          value={action.positionAsset}
          onChange={v => update('positionAsset', v)}
          error={invalid && !isValidAddress(action.positionAsset)}
          helperText={isValidAddress(action.positionAsset) ? `Decimals: ${decimals}` : undefined}
        />
        <LavaSteelInput
          label="Underlying asset (swap back to)"
          placeholder="0x..."
          value={action.underlyingAsset}
          onChange={v => update('underlyingAsset', v)}
          error={invalid && !isValidAddress(action.underlyingAsset)}
        />
        <LavaSteelInput
          label={`Amount${decimals !== 18 ? ` (token has ${decimals} decimals)` : ''}`}
          placeholder="e.g. 1.5"
          value={action.humanAmount}
          onChange={v => update('humanAmount', v)}
          error={invalid && !(parseFloat(action.humanAmount) > 0)}
          helperText={rawPreview && `Raw on-chain: ${rawPreview}`}
        />
      </div>

      {invalid && <p className="text-red-500 text-sm">Please fill in all fields with valid values.</p>}
    </div>
  );
};

export default EvmClosePositionAction;
