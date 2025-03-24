import { useState } from 'react';
import { PrimaryButton } from '@/components/shared/PrimaryButton';

export const VaultSwap = ({
  ftTokenTicker = 'SMT',
  valuationCurrency = 'ADA',
}) => {
  const [amount, setAmount] = useState('0.0');

  return (
    <div className="bg-[#181A2A] rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium">Swap</h2>
        <button className="text-sm text-dark-100 hover:text-white transition-colors">
          ↓
        </button>
      </div>
      {/* You pay */}
      <div className="bg-dark-700 rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-dark-100">You pay</span>
          <span className="text-sm text-dark-100">Balance: 0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-2xl font-medium w-full focus:outline-none"
            placeholder="0.0"
          />
          <button className="flex items-center gap-2 bg-dark-800 hover:bg-dark-900 rounded-lg px-3 py-2 transition-colors">
            <img src="/icons/ada.svg" alt={valuationCurrency} className="w-5 h-5" />
            <span>{valuationCurrency}</span>
          </button>
        </div>
      </div>

      {/* You receive */}
      <div className="bg-dark-700 rounded-xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-dark-100">You receive</span>
          <span className="text-sm text-dark-100">Balance: 0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value="0.0"
            disabled
            className="bg-transparent text-2xl font-medium w-full"
            placeholder="0.0"
          />
          <button className="flex items-center gap-2 bg-dark-800 hover:bg-dark-900 rounded-lg px-3 py-2 transition-colors">
            <img src="/icons/token.svg" alt={ftTokenTicker} className="w-5 h-5" />
            <span>${ftTokenTicker}</span>
          </button>
        </div>
      </div>

      <PrimaryButton className="w-full">
        BUY ${ftTokenTicker}
      </PrimaryButton>

      <p className="text-center text-sm text-dark-100 mt-4">
        Swaps will go live upon successful Vault Lock
      </p>
    </div>
  );
}; 