import { useAuth } from '@/lib/auth/auth';
import { useCurrency } from '@/hooks/useCurrency';

export const Stats = () => {
  const { user } = useAuth();

  const { currency } = useCurrency();

  console.log(user) 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-input-bg rounded-md p-6">
        <p className="text-dark-100 mb-2">TVL</p>
        
        <p className="text-2xl font-medium">{ currency === 'ada' ? `₳${user?.totalValueAda}` : `$${user?.totalValueUsd}` }</p>
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
