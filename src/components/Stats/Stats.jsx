export const Stats = () => (
  <div className="container mx-auto bg-slate-900 p-8 rounded-lg">
    <h1 className="text-white text-4xl font-bold mb-12">QUICK STATS</h1>
    <div className="mb-16">
      <h2 className="text-red-500 text-3xl font-bold mb-16">Vault Status</h2>
      <div className="relative mb-2 h-12">
        <div className="absolute inset-0 flex">
          <div className="bg-red-900 w-[10%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Draft</p>
              <p className="text-white text-xl font-bold">10.00%</p>
            </div>
          </div>
          <div className="bg-red-800 w-[22%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Contribution</p>
              <p className="text-white text-xl font-bold">22.00%</p>
            </div>
          </div>
          <div className="bg-red-700 w-[16.33%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Investment</p>
              <p className="text-white text-xl font-bold">16.33%</p>
            </div>
          </div>
          <div className="bg-red-600 w-[18%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Locked</p>
              <p className="text-white text-xl font-bold">18.00%</p>
            </div>
          </div>
          <div className="bg-red-500 w-[33.67%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Terminated</p>
              <p className="text-white text-xl font-bold">33.67%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Vault Types Section */}
    <div className="mb-16">
      <h2 className="text-red-500 text-3xl font-bold mb-16">Vault Types</h2>
      <div className="relative mb-2 h-12">
        <div className="absolute inset-0 flex">
          <div className="bg-red-800 w-[30.33%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Private</p>
              <p className="text-white text-xl font-bold">30.33%</p>
            </div>
          </div>
          <div className="bg-red-600 w-[26%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Semi-Private</p>
              <p className="text-white text-xl font-bold">26.00%</p>
            </div>
          </div>
          <div className="bg-red-500 w-[43.67%]">
            <div className="absolute top-[-100%]">
              <p className="text-gray-300 text-sm">Public</p>
              <p className="text-white text-xl font-bold">43.67%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-4 gap-8">
      <div>
        <p className="text-red-500 text-5xl font-bold mb-2">158</p>
        <p className="text-white text-xl">Vaults</p>
      </div>
      <div>
        <p className="text-red-500 text-5xl font-bold mb-2">486</p>
        <p className="text-white text-xl">Assets</p>
      </div>
      <div>
        <p className="text-red-500 text-5xl font-bold mb-2">$9M+</p>
        <p className="text-white text-xl">Invested</p>
      </div>
      <div>
        <p className="text-red-500 text-5xl font-bold mb-2">$18M+</p>
        <p className="text-white text-xl">TVL All Vaults</p>
      </div>
    </div>
  </div>
);
