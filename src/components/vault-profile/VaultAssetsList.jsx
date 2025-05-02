import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { VaultsApiProvider } from '@/services/api/vaults';

export const VaultAssetsList = ({ vault }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaultAssets = async () => {
      if (!vault?.id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await VaultsApiProvider.getVaultAssets(vault.id);
        setAssets(response.data.items || []);
      } catch (err) {
        console.error('Error fetching vault assets:', err);
        setError('Failed to load vault assets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVaultAssets();
  }, [vault?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="text-center p-8 text-dark-100">
        No assets found in this vault.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] mb-4 text-dark-100 text-sm px-4">
        <div>Image</div>
        <div>Name</div>
        <div>Type</div>
        <div>Status</div>
        <div className="text-right">Quantity</div>
      </div>
      <div className="space-y-2">
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className={`rounded-lg transition-all duration-300 ${
              expandedAsset === index ? 'bg-steel-750' : 'bg-steel-850 hover:bg-steel-750'
            }`}
            onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
          >
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] items-center p-4 cursor-pointer">
              <div>
                <img
                  alt={asset.assetId}
                  className="w-12 h-12 rounded-lg"
                  src="/assets/icons/ada.png"
                />
              </div>
              <div className="font-medium">{asset.assetId}</div>
              <div className="capitalize">{asset.type}</div>
              <div className="capitalize">{asset.status}</div>
              <div className="flex items-center justify-end gap-6">
                <span>{asset.quantity}</span>
                <button
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  type="button"
                >
                  {expandedAsset === index ? (
                    <ChevronUp className="transition-transform duration-200" size={20} />
                  ) : (
                    <ChevronDown className="transition-transform duration-200" size={20} />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedAsset === index ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="py-2 px-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <p className="font-medium">Policy ID:</p>
                    <p className="break-all">{asset.policyId}</p>
                  </div>
                  <div>
                    <p className="font-medium">Asset ID:</p>
                    <p className="break-all">{asset.assetId}</p>
                  </div>
                  <div>
                    <p className="font-medium">Added At:</p>
                    <p>{new Date(asset.addedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Updated At:</p>
                    <p>{new Date(asset.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
