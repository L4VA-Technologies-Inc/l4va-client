export const Stats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
    <div className="bg-[#0A0D29] rounded-md p-6">
      <p className="text-dark-100 mb-2">TVL</p>
      <p className="text-2xl font-medium">12,003.0989 ADA</p>
    </div>
    <div className="bg-[#0A0D29] rounded-md p-6">
      <p className="text-dark-100 mb-2">Total Vaults</p>
      <p className="text-2xl font-medium">28</p>
    </div>
    <div className="bg-[#0A0D29] rounded-md p-6">
      <p className="text-dark-100 mb-2">Gains</p>
      <p className="text-2xl font-medium">+ 150.03%</p>
    </div>
  </div>
);
