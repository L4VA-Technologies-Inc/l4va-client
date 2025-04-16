import { useState } from 'react';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { CurrencyDropdown } from '@/components/CurrencyDropdown';
import { formatNum, formatCompactNumber } from '@/utils/core.utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const InvestModal = ({ isOpen, onClose, vaultName }) => {
  const [investAmount, setInvestAmount] = useState('130.25');
  const [selectedCurrency, setSelectedCurrency] = useState('ADA');

  // These would come from props or context in a real app
  const walletBalance = 4556;
  const totalInvested = 13025.00;
  const assetsOffered = 50;
  const currentVaultTVL = 16050.00;
  const estimatedValue = investAmount ? parseFloat(investAmount) * 3.5 : 0;
  const estimatedTickerVal = investAmount ? parseFloat(investAmount) * 40.35 : 0;
  const vaultAllocation = investAmount ? '1%' : '0%';

  const handleInvest = () => {
    // Handle investment logic
    console.log('Investing:', investAmount, selectedCurrency);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 bg-steel-950 text-white border-none">
        <DialogHeader className="py-2 bg-white/5 rounded-t-lg">
          <DialogTitle className="text-2xl text-center font-medium">Invest in {vaultName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col p-6 space-y-6 md:space-y-0 md:flex-row">
          <div className="md:w-1/2 pr-0 md:pr-6 space-y-6">
            <div className="flex justify-between items-center">
              <span>ADA in wallet</span>
              <span className="font-bold">{formatNum(walletBalance)} ADA</span>
            </div>

            <div className="bg-[#202233] p-4 rounded-lg">
              <h3 className="font-bold mb-2">Invest</h3>
              <div className="flex items-center gap-4">
                <input
                  className="bg-transparent text-4xl w-full outline-none font-bold"
                  type="text"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                />
                <CurrencyDropdown
                  value={selectedCurrency}
                  onSelect={setSelectedCurrency}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-[#2f324c] pt-6">
              <div className="text-center">
                <p className="text-dark-100 text-sm">Total ADA Invested</p>
                <p className="text-xl font-medium">{formatNum(totalInvested)}</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm">% Assets Offered</p>
                <p className="text-xl font-medium">{assetsOffered}%</p>
              </div>
              <div className="text-center">
                <p className="text-dark-100 text-sm">Current Vault TVL</p>
                <p className="text-xl font-medium">{formatCompactNumber(currentVaultTVL)}</p>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 md:pl-6 md:border-l border-[#2f324c]">
            <div className="bg-dark-700 p-6 rounded-[10px]">
              <h2 className="text-xl text-center font-medium mb-8">Investment</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Total {selectedCurrency} Invested</p>
                  <p className="text-2xl font-medium">{formatNum(investAmount) || '0'}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Vault Allocation</p>
                  <p className="text-2xl font-medium">{vaultAllocation}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Estimated Value</p>
                  <p className="text-2xl font-medium">${formatNum(estimatedValue)}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-dark-100 text-sm">Estimated TICKER VAL ($VLRM)</p>
                  <p className="text-2xl font-medium">{formatNum(estimatedTickerVal)}</p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <PrimaryButton
                  className="uppercase"
                  disabled={!investAmount || parseFloat(investAmount) <= 0}
                  onClick={handleInvest}
                >
                  Invest
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
