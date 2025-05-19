import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { VaultsApiProvider } from '@/services/api/vaults';
import { substringAddress } from '@/utils/core.utils';

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
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!assets.length) {
    return <div className="text-center p-8 text-dark-100">No assets found in this vault.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-dark-100 text-sm">
            <th className="w-[80px] px-4 py-2 text-left">Image</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Quantity</th>
            <th className="w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <>
              <tr
                key={asset.id}
                className={`cursor-pointer transition-all duration-300 ${
                  expandedAsset === index ? 'bg-steel-750' : 'bg-steel-850 hover:bg-steel-750'
                }`}
                onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
              >
                <td className="px-4 py-4">
                  <img alt={asset.assetId} className="w-12 h-12 rounded-lg" src="/assets/icons/ada.png" />
                </td>
                <td className="px-4 py-4 font-medium">{substringAddress(asset.assetId)}</td>
                <td className="px-4 py-4 capitalize">{asset.type}</td>
                <td className="px-4 py-4 capitalize">{asset.status}</td>
                <td className="px-4 py-4 text-right">{asset.quantity}</td>
                <td className="px-4 py-4">
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
                </td>
              </tr>
              {expandedAsset === index && (
                <tr className="bg-steel-750">
                  <td colSpan="6" className="px-4 py-2">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <p className="font-medium">Policy ID:</p>
                        <div className="flex items-center gap-2">
                          <p className="break-all">{substringAddress(asset.policyId)}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.policyId);
                              toast.success('Policy ID copied to clipboard');
                            }}
                            className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Asset ID:</p>
                        <div className="flex items-center gap-2">
                          <p className="break-all">{substringAddress(asset.assetId)}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.assetId);
                              toast.success('Asset ID copied to clipboard');
                            }}
                            className="p-1 hover:bg-steel-850 rounded-md transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
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
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
