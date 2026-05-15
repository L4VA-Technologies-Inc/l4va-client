export const RewardSourceBadge = ({ source }) => {
  const configs = {
    creator: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      label: 'Creator',
      icon: '👑',
    },
    participant: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Participant',
      icon: '🤝',
    },
    lp: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      label: 'LP Provider',
      icon: '💧',
    },
    governance: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      label: 'Governance',
      icon: '🗳️',
    },
    acquire: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      label: 'Acquire',
      icon: '📥',
    },
    contribution: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      label: 'Contribution',
      icon: '➕',
    },
    expansion: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: 'Expansion',
      icon: '📈',
    },
  };

  const config = configs[source?.toLowerCase()] || {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    label: source || 'Unknown',
    icon: '•',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.border}`}>
      <span>{config.icon}</span>
      <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
};
