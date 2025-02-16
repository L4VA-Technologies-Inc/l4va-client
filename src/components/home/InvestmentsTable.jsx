export const InvestmentsTable = () => {
  const investments = [
    {
      vault: 'GOLDEN EAGLE',
      invested: '10,000 ADA',
      tvl: '8,000 ADA',
      timeLeft: '05D 06H 11M',
      access: 'Public',
      status: 'Contribute',
    },
    {
      vault: 'GOLDEN EAGLE',
      invested: '5,000 ADA',
      tvl: '9,500 ADA',
      timeLeft: '05D 06H 11M',
      access: 'Public',
      status: 'Contribute',
    },
    {
      vault: 'OTHER WORLD',
      invested: '12,000 ADA',
      tvl: '16,000 ADA',
      timeLeft: '05D 06H 11M',
      access: 'Private',
      status: 'Invest',
    },
    {
      vault: 'CARDADA',
      invested: '25,000 ADA',
      tvl: '28,749 ADA',
      timeLeft: '05D 06H 11M',
      access: 'Private',
      status: 'Govern',
    },
    {
      vault: 'SPACEMAN',
      invested: '60,000,000 ADA',
      tvl: '95,000,000 ADA',
      timeLeft: '05D 06H 11M',
      access: 'Public',
      status: 'Invest',
    },
  ];

  return (
    <div className="container mx-auto p-6 bg-slate-900">
      <h1 className="text-4xl font-bold text-white mb-8">INVESTMENTS</h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="py-4 text-white font-bold">VAULT</th>
              <th className="py-4 text-white font-bold">INVESTED</th>
              <th className="py-4 text-white font-bold">TVL</th>
              <th className="py-4 text-white font-bold">TIME LEFT</th>
              <th className="py-4 text-white font-bold">ACCESS</th>
              <th className="py-4 text-white font-bold">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment, index) => (
              <tr
                key={index}
                className="bg-slate-800/50 rounded-lg"
              >
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <img alt="investment" className="w-8 h-8" src="/assets/vault-logo.png" />
                    <span className="text-white font-medium">{investment.vault}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-400">{investment.invested}</td>
                <td className="py-4 text-slate-400">{investment.tvl}</td>
                <td className="py-4 text-slate-400">{investment.timeLeft}</td>
                <td className="py-4 text-slate-400">{investment.access}</td>
                <td className="py-4 pr-4">
                  <button
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 text-sm transition-colors"
                  >
                    {investment.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
