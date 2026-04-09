export const ClaimTransactionStatus = ({ status, transactionHash = null }) => {
  const configs = {
    available: {
      border: 'border-green-500/30',
      text: 'text-green-400',
      dot: 'bg-green-500',
      label: 'Available',
      animate: false,
    },
    pending: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      dot: 'bg-yellow-500',
      label: 'Pending',
      animate: true,
    },
    confirmed: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      dot: 'bg-green-500',
      label: 'Confirmed',
      animate: false,
    },
    failed: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-500',
      label: 'Failed',
      animate: false,
    },
  };

  const config = configs[status] || {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
    label: status,
    animate: false,
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot} ${config.animate ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
      {transactionHash && (
        <a
          href={`https://cardanoscan.io/transaction/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          View TX
        </a>
      )}
    </div>
  );
};
