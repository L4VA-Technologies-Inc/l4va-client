export const VaultProfile = ({ vault }) => (
  <div className="min-h-screen">
    <div className="flex justify-center py-8">
      <span className="font-russo text-[40px] uppercase">
        {vault.name}
      </span>
    </div>
    <div className="container mx-auto">
      <div className="bg-dark-600 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Vault Details</h2>
            <p className="text-dark-100 mb-2">Status: {vault.vaultStatus}</p>
            <p className="text-dark-100 mb-2">Type: {vault.type}</p>
            <p className="text-dark-100 mb-2">Privacy: {vault.privacy}</p>
            <p className="text-dark-100">{vault.description}</p>
          </div>
          {vault.vaultImage && (
            <div>
              <img
                alt={vault.name}
                className="w-full h-48 object-cover rounded-lg"
                src={vault.vaultImage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
