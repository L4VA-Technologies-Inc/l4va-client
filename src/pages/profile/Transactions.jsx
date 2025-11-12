import { useState } from 'react';
import { Copy, ExternalLink, Filter, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

import { useTransactions } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { Pagination } from '@/components/shared/Pagination';
import { formatDateTime, substringAddress } from '@/utils/core.utils.js';
import { LavaTabs } from '@/components/shared/LavaTabs.jsx';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { useModalControls } from '@/lib/modals/modal.context';
import { TransactionsApiProvider } from '@/services/api/transactions/index.js';

const tabOptions = [
  { id: 'all', name: 'All', type: 'all' },
  { id: 'contribute', name: 'Contribution', type: 'contribute' },
  { id: 'acquire', name: 'Acquire', type: 'acquire' },
  { id: 'burn', name: 'Burn', type: 'burn' },
];

const DEFAULT_TAB = 'all';

export const Transactions = () => {
  const tabParam = DEFAULT_TAB;
  const initialTab = tabOptions.find(tab => tab.id === tabParam) || tabOptions.find(tab => tab.id === DEFAULT_TAB);
  const { openModal } = useModalControls();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    filter: initialTab.type,
  });

  const { data, isLoading, error } = useTransactions(filters);
  const transactions = data?.data?.items || [];
  const pagination = data?.data || { page: 1, total: 0, limit: 10 };

  const navigate = useNavigate();

  const handlePageChange = page => {
    setCurrentPage(page);
    setFilters(prevFilters => ({
      ...prevFilters,
      page: page,
    }));
  };

  const handleTabChange = tab => {
    const selectedTab = tabOptions.find(t => t.name === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      setFilters(prevFilters => ({
        ...prevFilters,
        page: 1,
        filter: selectedTab.type,
      }));
    }
  };

  const handleCopy = value => {
    navigator.clipboard
      .writeText(value.toString())
      .then(() => {
        toast.success(`Transaction info copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const TransactionCard = ({ transaction }) => (
    <div className="bg-steel-850 border border-steel-750 rounded-xl p-4 space-y-3 text-white mb-4">
      <div className="flex items-center justify-between">
        <span className="text-steel-300 text-sm">Transaction ID</span>
        <button
          onClick={() => handleCopy(transaction.id)}
          className="flex items-center gap-2 hover:text-orange-500 transition-colors text-sm"
        >
          {substringAddress(transaction.id)}
          <Copy size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-steel-300 text-sm">Tx Hash</span>
        <button
          onClick={() => handleCopy(transaction.tx_hash)}
          className="flex items-center gap-2 hover:text-orange-500 transition-colors text-sm"
        >
          {substringAddress(transaction.tx_hash)}
          <Copy size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-steel-300 text-sm">Vault</span>
        {transaction.vault ? (
          <button
            onClick={() => navigate({ to: `/vaults/${transaction.vault.id}` })}
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors text-sm"
          >
            {transaction.vault.name}
            <ExternalLink size={14} />
          </button>
        ) : (
          <span className="text-steel-400 text-sm">—</span>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-steel-700">
        <div className="flex items-center justify-between">
          <span className="text-steel-300 text-sm">Type</span>
          <span className="capitalize font-medium">{transaction.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-steel-300 text-sm">Status</span>
          <span className="capitalize font-medium">{transaction.status}</span>
        </div>
      </div>
    </div>
  );

  const handleOpenFilters = () => {
    openModal('TransactionFilterModal', {
      onApplyFilters: handleApplyFilters,
      initialFilters: filters,
    });
  };

  const handleApplyFilters = filters => {
    setFilters(prevFilters => ({
      page: 1,
      filter: prevFilters.filter || 'all',
      ...filters,
    }));
  };

  const handleDownloadCSV = async () => {
    try {
      toast.loading('Preparing CSV...', { id: 'download' });

      const allData = await TransactionsApiProvider.getUserTransactions({
        ...filters,
        page: 1,
        limit: 100,
      });

      const allTransactions = allData?.data?.items || [];

      if (!allTransactions.length) {
        toast.error('No transactions to export', { id: 'download' });
        return;
      }

      const headers = ['Transaction ID', 'Tx Hash', 'Vault Name', 'Type', 'Status', 'Date'];

      const rows = allTransactions.map(t => [
        t.id,
        t.tx_hash || '',
        t.vault?.name || '',
        t.type,
        t.status,
        formatDateTime(t.created_at),
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers, ...rows].map(row => row.map(value => `"${value}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `L4VA_transactions_${activeTab.type}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV downloaded successfully', { id: 'download' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV', { id: 'download' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-russo text-4xl uppercase text-white">My Transactions</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex-1 sm:w-auto">
          <LavaTabs
            className="overflow-x-auto text-sm md:text-base w-full"
            tabs={tabOptions.map(tab => tab.name)}
            activeTab={activeTab.name}
            onTabChange={handleTabChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SecondaryButton className="w-full sm:w-auto" onClick={handleOpenFilters}>
            <Filter className="w-4 h-4" />
            Filters
          </SecondaryButton>
          <SecondaryButton className="w-full sm:w-auto" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </SecondaryButton>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="ml-2 text-steel-300">Loading your transactions...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>Error loading transactions: {error.message}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-steel-750 hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-dark-100 text-sm border-b border-steel-750">
                  <th className="px-4 py-3 text-left">Transaction ID</th>
                  <th className="px-4 py-3 text-left">Tx Hash</th>
                  <th className="px-4 py-3 text-left">Vault</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr
                    key={transaction.id}
                    className="transition-all duration-300 cursor-pointer bg-steel-850 hover:bg-steel-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <button
                        onClick={() => handleCopy(transaction.id)}
                        className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
                      >
                        {substringAddress(transaction.id)}
                        <Copy size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.tx_hash ? (
                        <button
                          onClick={() => handleCopy(transaction.tx_hash)}
                          className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
                        >
                          {substringAddress(transaction.tx_hash)}
                          <Copy size={16} />
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white capitalize">
                      {transaction.vault ? (
                        <button
                          onClick={() => navigate({ to: `/vaults/${transaction.vault.id}` })}
                          className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
                        >
                          {transaction.vault.name}
                          <ExternalLink size={16} />
                        </button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-steel-300">{formatDateTime(transaction.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-white capitalize">{transaction.type}</td>
                    <td className="px-4 py-3 font-medium text-white capitalize">{transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="block md:hidden">
            {transactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {transactions.length && Math.ceil(pagination.total / pagination.limit) > 1 ? (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(pagination.total / pagination.limit)}
                onPageChange={handlePageChange}
                className="justify-center"
              />
            </div>
          ) : null}

          {transactions.length === 0 && <NoDataPlaceholder message="No transactions found" />}
        </>
      )}
    </div>
  );
};
