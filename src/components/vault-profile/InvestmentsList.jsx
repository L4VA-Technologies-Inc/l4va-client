import { formatNum } from '@/utils/core.utils';

export const InvestmentsList = ({ investments = [] }) => {
  const totalValuePercentage = '5%';

  return (
    <div>
      <div
        className="relative flex items-center justify-between p-4 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, #2D3049 0%, rgba(45, 48, 73, 0.95) 70%, rgba(45, 48, 73, 0.9) 100%), linear-gradient(90deg, rgba(34, 197, 94, 0) 70%, rgba(34, 197, 94, 0.3) 100%)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="text-dark-100 text-2xl">
          Investment / Assets Value (%)
        </div>
        <div className="text-2xl font-semibold">
          {totalValuePercentage}
        </div>
      </div>
      <div className="grid grid-cols-4 px-6 py-4 text-sm text-dark-100">
        <div>Name</div>
        <div>Public key</div>
        <div>% Alloc.</div>
        <div className="text-right">Invested</div>
      </div>
      <div className="space-y-2">
        {investments.map((investment, index) => (
          <div
            key={index}
            className="grid grid-cols-4 px-6 py-3 hover:bg-[#2D3049] transition-colors"
          >
            <div className="font-medium">{investment.name}</div>
            <div className="font-medium text-dark-100">{investment.publicKey}</div>
            <div>{investment.allocation}%</div>
            <div className="text-right">${formatNum(investment.invested)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
