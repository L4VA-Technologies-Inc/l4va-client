import React from 'react';
import {
  formatAmount,
  formatDeadline,
  getButtonText,
  capitalizeFirst,
} from '@/utils/core.utils.js';

export const InvestmentsTable = () => {
  const investments = [
    {
      id: '1',
      vaultName: 'GOLDEN EAGLE',
      vaultLogoUrl: '/assets/vault-logo.png',
      investedAmount: 10000,
      investedCurrency: 'ADA',
      totalValueLocked: 8000,
      tvlCurrency: 'ADA',
      deadline: '2025-03-25T12:00:00Z',
      accessType: 'public',
      currentStatus: 'active',
    },
    {
      id: '2',
      vaultName: 'OTHER WORLD',
      vaultLogoUrl: '/assets/vault-logo.png',
      investedAmount: 12000,
      investedCurrency: 'ADA',
      totalValueLocked: 16000,
      tvlCurrency: 'ADA',
      deadline: '2025-03-25T12:00:00Z',
      accessType: 'private',
      currentStatus: 'pending',
    },
    {
      id: '3',
      vaultName: 'SPACEMAN',
      vaultLogoUrl: '/assets/vault-logo.png',
      investedAmount: 60000000,
      investedCurrency: 'ADA',
      totalValueLocked: 95000000,
      tvlCurrency: 'ADA',
      deadline: '2025-03-25T12:00:00Z',
      accessType: 'public',
      currentStatus: 'pending',
    },
  ];

  return (
    <div className="container mx-auto py-12 sm:py-16">
      <h1 className="font-russo font-bold text-[40px] mb-8">
        INVESTMENTS
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left font-bold">
              <th className="py-4">VAULT</th>
              <th className="py-4">INVESTED</th>
              <th className="py-4">VAL</th>
              <th className="py-4">ASSET TVL</th>
              <th className="py-4">TIME LEFT</th>
              <th className="py-4">ACCESS</th>
              <th className="py-4">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => (
              <React.Fragment key={investment.id}>
                <tr className="bg-gray-800">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt={`${investment.vaultName} logo`}
                        className="w-8 h-8"
                        src={investment.vaultLogoUrl}
                      />
                      <span className="font-medium">
                        {investment.vaultName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-dark-100">
                    {formatAmount(investment.investedAmount)} {investment.investedCurrency}
                  </td>
                  <td className="py-4 text-dark-100">
                    <span className="bg-green-900/20 text-green-500 py-2 px-6 rounded-full inline-block text-center">
                      +10.00%
                    </span>
                  </td>
                  <td className="py-4 text-dark-100">
                    {formatAmount(investment.totalValueLocked)} {investment.tvlCurrency}
                  </td>
                  <td className="py-4 text-dark-100">
                    {formatDeadline(investment.deadline)}
                  </td>
                  <td className="py-4 text-dark-100">
                    {capitalizeFirst(investment.accessType)}
                  </td>
                  <td className="py-4 pr-4 text-dark-100">
                    {getButtonText(investment.currentStatus)}
                  </td>
                </tr>
                <tr className="h-4 bg-transparent">
                  <td colSpan={7}></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
