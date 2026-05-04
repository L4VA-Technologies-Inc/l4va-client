import { useMemo, useState } from 'react';
import { Copy, ExternalLink, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

import { useTransactions } from '@/services/api/queries';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { formatDateTime, substringAddress } from '@/utils/core.utils.js';
import { LavaTabs } from '@/components/shared/LavaTabs.jsx';
import SecondaryButton from '@/components/shared/SecondaryButton.js';
import { useModalControls } from '@/lib/modals/modal.context';
import { TransactionsApiProvider } from '@/services/api/transactions/index.js';
import { LavaTable } from '@/components/shared/LavaTable';

const tabOptions = [
  { id: 'all', name: 'All', type: 'all' },
  { id: 'create-vault', name: 'Vault Creation', type: 'create-vault' },
  { id: 'contribute', name: 'Contribution', type: 'contribute' },
  { id: 'acquire', name: 'Acquire', type: 'acquire' },
  { id: 'burn', name: 'Burn', type: 'burn' },
];

const DEFAULT_TAB = 'all';

const TransactionCard = ({ transaction, onCopy, onNavigate }) => (
  <div className="bg-steel-850 border border-steel-750 rounded-xl p-4 space-y-3 text-white mb-4">
    <div className="flex items-center justify-between">
      <span className="text-steel-300 text-sm">Transaction ID</span>
      <button
        onClick={() => onCopy(transaction.id)}
        className="flex items-center gap-2 hover:text-orange-500 transition-colors text-sm"
      >
        {substringAddress(transaction.id)}
        <Copy size={14} />
      </button>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-steel-300 text-sm">Tx Hash</span>
      <button
        onClick={() => onCopy(transaction.tx_hash)}
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
          onClick={() => onNavigate(`/vaults/${transaction.vault.id}`)}
          className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors text-sm"
        >
          {transaction.vault.name}
          <ExternalLink size={14} />
        </button>
      ) : (
        <span className="text-steel-400 text-sm">—</span>
      )}
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pt-2 border-t border-steel-750">
        <span className="text-steel-300 text-sm">Type</span>
        <span className="capitalize font-medium">{transaction.type}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-steel-750">
        <span className="text-steel-300 text-sm">Status</span>
        <span className="capitalize font-medium">{transaction.status}</span>
      </div>
    </div>
  </div>
);

export const Transactions = () => {
  const tabParam = DEFAULT_TAB;
  const initialTab = tabOptions.find(tab => tab.id === tabParam) || tabOptions[0];
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
    setFilters(prevFilters => ({ ...prevFilters, page }));
  };

  const handleTabChange = tab => {
    const selectedTab = tabOptions.find(t => t.name === tab);
    if (selectedTab) {
      setActiveTab(selectedTab);
      setFilters(prevFilters => ({ ...prevFilters, page: 1, filter: selectedTab.type }));
    }
  };

  const handleCopy = value => {
    navigator.clipboard
      .writeText(value.toString())
      .then(() => toast.success('Transaction info copied to clipboard'))
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleOpenFilters = () => {
    openModal('TransactionFilterModal', {
      onApplyFilters: handleApplyFilters,
      initialFilters: filters,
    });
  };

  const handleApplyFilters = newFilters => {
    setFilters(prevFilters => ({
      page: 1,
      limit: 10,
      filter: prevFilters.filter || 'all',
      ...newFilters,
    }));
  };

  const handleDownloadCSV = async () => {
    try {
      toast.loading('Preparing CSV...', { id: 'download' });

      const allData = await TransactionsApiProvider.getUserTransactions({
        ...filters,
        page: 1,
        isExport: true,
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

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Transaction ID',
        render: transaction => (
          <button
            onClick={() => handleCopy(transaction.id)}
            className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
          >
            {substringAddress(transaction.id)}
            <Copy size={16} />
          </button>
        ),
        cellClassName: 'font-medium text-white',
      },
      {
        key: 'tx_hash',
        header: 'Tx Hash',
        render: transaction =>
          transaction.tx_hash ? (
            <button
              onClick={() => handleCopy(transaction.tx_hash)}
              className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
            >
              {substringAddress(transaction.tx_hash)}
              <Copy size={16} />
            </button>
          ) : (
            '-'
          ),
      },
      {
        key: 'vault',
        header: 'Vault',
        render: transaction =>
          transaction.vault ? (
            <button
              onClick={() => navigate({ to: `/vaults/${transaction.vault.id}` })}
              className="inline-flex items-center gap-2 hover:text-orange-500 transition-colors"
            >
              {transaction.vault.name}
              <ExternalLink size={16} />
            </button>
          ) : null,
        cellClassName: 'font-medium text-white capitalize',
      },
      {
        key: 'created_at',
        header: 'Date',
        render: transaction => formatDateTime(transaction.created_at),
        cellClassName: 'text-steel-300',
      },
      {
        key: 'type',
        header: 'Type',
        render: transaction => transaction.type,
        cellClassName: 'font-medium text-white capitalize',
      },
      {
        key: 'status',
        header: 'Status',
        render: transaction => transaction.status,
        cellClassName: 'font-medium text-white capitalize',
      },
    ],
    [navigate]
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);

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
        <div className="flex gap-4">
          <SecondaryButton className="w-full sm:w-auto" onClick={handleOpenFilters}>
            <Filter className="w-4 h-4" />
            Filter by
          </SecondaryButton>
          <SecondaryButton className="w-full sm:w-auto" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </SecondaryButton>
        </div>
      </div>

      <LavaTable
        columns={columns}
        data={transactions}
        rowKey="id"
        isLoading={isLoading}
        error={error ? `Error loading transactions: ${error.message}` : null}
        emptyMessage="No transactions found"
        emptyComponent={<NoDataPlaceholder message="No transactions found" />}
        mobileRender={transaction => (
          <TransactionCard transaction={transaction} onCopy={handleCopy} onNavigate={to => navigate({ to })} />
        )}
        pagination={
          transactions.length && totalPages > 1
            ? { currentPage, totalPages, onPageChange: handlePageChange }
            : undefined
        }
      />
    </div>
  );
};
