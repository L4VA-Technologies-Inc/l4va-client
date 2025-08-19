import L4vaIcon from '@/icons/l4va.svg';
import { ExternalLink } from 'lucide-react';
import { useAcquire } from '@/services/api/queries.js';

const Investments = () => {

  // const { data, isLoading, error } = useVaults('contribution');
  // const vaults = data?.data?.items || [];
  //
  // console.log(vaults);


  const { data } = useAcquire();
  const acquires = data?.data || [];

  const formatTimeLeft = (timeLeft) => {
    if (!timeLeft) return 'N/A';
    const now = new Date();
    const end = new Date(timeLeft);
    const diffMs = end - now;
    
    if (diffMs <= 0) return 'Ended';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };


  return (
    <div className="space-y-6">
      <h2 className="font-russo text-4xl uppercase text-white">Investments</h2>
      <div className="bg-steel-0">
        <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
  <thead>
    <tr className="text-steel-300 text-sm">
      <th className="px-4 py-3 text-left">VAULT</th>
      <th className="px-4 py-3 text-right">INVESTED (ADA)</th>
      <th className="px-4 py-3 text-right">VAL</th>
      <th className="px-4 py-3 text-right">ASSETS TVL (ADA)</th>
      <th className="px-4 py-3 text-right">TIME LEFT</th>
      <th className="px-4 py-3 text-center">ACCESS</th>
      <th className="px-4 py-3 text-center">STATUS</th>
    </tr>
  </thead>
  <tbody>
    {acquires.map((acquire, index) => (
      <tr
        key={index}
        className="text-steel-100 text-sm bg-steel-800/50 rounded-xl hover:bg-steel-800/70 transition-colors"
      >
        <td className="px-4 py-4 rounded-l-xl font-medium text-xl text-white bg-steel-950">{acquire.name}</td>
        <td className="px-4 py-4 text-right text-xl bg-steel-950">{Number(acquire.total_assets_cost_ada).toFixed(2)}</td>
        <td className="px-4 py-4 text-right text-xl bg-steel-950">-</td>
        <td className="px-4 py-4 text-right text-xl bg-steel-950">{Number(acquire.total_assets_cost_ada).toFixed(2)}</td>
        <td className="px-4 py-4 text-right text-xl bg-steel-950">{formatTimeLeft(acquire.timeLeft)}</td>
        <td className="px-4 py-4 text-center text-xl bg-steel-950">{acquire.privacy}</td>
        <td className="px-4 py-4 rounded-r-xl text-center text-xl bg-steel-950">{acquire.vault_status}</td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      </div>
    </div>
  );
};

export default Investments;
