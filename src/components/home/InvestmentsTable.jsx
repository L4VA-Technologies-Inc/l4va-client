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

  const renderMobileCard = (investment) => (
    <div key={investment.id} className="bg-gray-800 p-4 rounded-lg mb-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          alt={`${investment.vaultName} logo`}
          className="w-8 h-8"
          src={investment.vaultLogoUrl}
        />
        <span className="font-medium">{investment.vaultName}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Invested</span>
          <span>{formatAmount(investment.investedAmount)} {investment.investedCurrency}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Value</span>
          <span className="bg-green-900/20 text-green-500 py-1 px-4 rounded-full">
            +10.00%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Asset TVL</span>
          <span>{formatAmount(investment.totalValueLocked)} {investment.tvlCurrency}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Time Left</span>
          <span>{formatDeadline(investment.deadline)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Access</span>
          <span>{capitalizeFirst(investment.accessType)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span>{getButtonText(investment.currentStatus)}</span>
        </div>
      </div>
    </div>
  );

  // For larger screens, we'll show the table layout
  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-left font-bold bg-gray-900">
            <th className="py-4 px-4">VAULT</th>
            <th className="py-4 px-4">INVESTED</th>
            <th className="py-4 px-4">VAL</th>
            <th className="py-4 px-4">ASSET TVL</th>
            <th className="py-4 px-4">TIME LEFT</th>
            <th className="py-4 px-4">ACCESS</th>
            <th className="py-4 px-4">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => (
            <React.Fragment key={investment.id}>
              <tr className="bg-gray-800">
                <td className="py-4 px-4">
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
                <td className="py-4 px-4 text-dark-100">
                  {formatAmount(investment.investedAmount)} {investment.investedCurrency}
                </td>
                <td className="py-4 px-4 text-dark-100">
                  <span className="bg-green-900/20 text-green-500 py-2 px-6 rounded-full inline-block text-center">
                    +10.00%
                  </span>
                </td>
                <td className="py-4 px-4 text-dark-100">
                  {formatAmount(investment.totalValueLocked)} {investment.tvlCurrency}
                </td>
                <td className="py-4 px-4 text-dark-100">
                  {formatDeadline(investment.deadline)}
                </td>
                <td className="py-4 px-4 text-dark-100">
                  {capitalizeFirst(investment.accessType)}
                </td>
                <td className="py-4 px-4 text-dark-100">
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
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:py-16">
      <h1 className="font-russo font-bold text-4xl mb-8">
        INVESTMENTS
      </h1>

      <div className="md:hidden">
        {investments.map(renderMobileCard)}
      </div>

      <div className="hidden md:block">
        {renderTable()}
      </div>
    </div>
  );
};
