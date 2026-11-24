import { useCurrency } from '@/hooks/useCurrency';
import { formatNum } from '@/utils/core.utils.js';

export const Stats = ({ user }) => {
  const { currencySymbol, pickByCurrency } = useCurrency();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-input-bg rounded-md p-6">
        <p className="text-dark-100 mb-2">TVL</p>
        <p className="text-2xl font-medium">
          {`${currencySymbol}${formatNum(pickByCurrency({ ada: user?.totalValueAda, usd: user?.totalValueUsd, eth: user?.totalValueEth })) || 0}`}
        </p>
      </div>
      <div className="bg-input-bg rounded-md p-6">
        <p className="text-dark-100 mb-2">Total Vaults</p>
        <p className="text-2xl font-medium">{user.totalVaults || '0'}</p>
      </div>
      <div className="bg-input-bg rounded-md p-6">
        <p className="text-dark-100 mb-2">Gains</p>
        <p className="text-2xl font-medium">
          {+user?.gains > 0 ? '+' : ''} {user?.gains || '0.00'}%
        </p>
      </div>
    </div>
  );
};
