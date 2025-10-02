import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import SearchInput from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { useVaultAssets } from '@/services/api/queries';
import { substringAddress } from '@/utils/core.utils';
import { useCurrency } from '@/hooks/useCurrency';

export const VaultContributedAssetsList = ({ vault }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error } = useVaultAssets(vault?.id, debouncedSearchValue, currentPage, limit);
  const assets = data?.data?.items || [];
  const pagination = data?.data
    ? {
        page: data.data.page,
        totalPages: data.data.totalPages,
        limit: data.data.limit,
      }
    : null;
  const { currency } = useCurrency();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchChange = value => {
    setSearchValue(value);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    setExpandedAsset(null);
  };

  if (error) {
    return <div className="text-center p-8 text-red-500">{error.message}</div>;
  }

  if (!assets.length && debouncedSearchValue !== '' && !isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <SearchInput className="w-full" onChange={handleSearchChange} />
        </div>
        <div className="text-center p-8 text-dark-100">No assets found for &quot;{debouncedSearchValue}&quot;.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <SearchInput className="w-full" onChange={handleSearchChange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !assets.length ? (
        <div className="text-center p-8 text-dark-100">No assets found in this vault.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-steel-750">
          <table className="w-full">
            <thead>
              <tr className="text-dark-100 text-sm border-b border-steel-750">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                {/* <th className="px-4 py-3 text-left">Value</th> */}
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                {/* <th className="px-4 py-3 text-left">Contribute</th> */}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <React.Fragment key={asset.id}>
                  <tr
                    className={`cursor-pointer transition-all duration-300 ${
                      expandedAsset === index ? 'bg-steel-750' : 'bg-steel-850 hover:bg-steel-750'
                    }`}
                    onClick={() => setExpandedAsset(expandedAsset === index ? null : index)}
                  >
                    <td className="px-4 py-3">
                      <img
                        alt={asset.metadata?.onchainMetadata?.name || 'NFT'}
                        className="w-12 h-12 rounded-lg object-cover"
                        src={
                          asset.metadata?.image
                            ? asset.metadata?.image?.replace('ipfs://', 'https://ipfs.io/ipfs/')
                            : '/assets/icons/ada.png'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {asset.metadata?.onchainMetadata?.name ||
                        (asset.assetId === 'lovelace' ? 'ADA' : substringAddress(asset.assetId))}
                    </td>
                    <td className="px-4 py-3 capitalize">{asset.type}</td>
                    {/* <td className="px-4 py-3">{currency}</td> */}
                    <td className="px-4 py-3 capitalize">{asset.status}</td>
                    <td className="px-4 py-3">{asset.quantity}</td>
                    {/* <td className="px-4 py-3">{currency}</td> */}
                    <td className="px-4 py-3 text-center">
                      <button
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        type="button"
                      >
                        {expandedAsset === index ? (
                          <ChevronUp className="transition-transform duration-200" size={24} />
                        ) : (
                          <ChevronDown className="transition-transform duration-200" size={24} />
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
                                onClick={e => {
                                  e.stopPropagation();
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
                                onClick={e => {
                                  e.stopPropagation();
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
                          {asset.metadata?.onchainMetadata?.description && (
                            <div className="col-span-2">
                              <p className="font-medium">Description:</p>
                              <p>{asset.metadata.onchainMetadata.description}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page || currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};
