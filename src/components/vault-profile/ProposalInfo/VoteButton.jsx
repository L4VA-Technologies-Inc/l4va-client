export const VoteButton = ({ voteType, icon: Icon, label, canVote, isSelected, onClick }) => {
  const getStyles = () => {
    const getBackground = () => {
      if (!canVote) return '#2D3049';
      if (voteType === 'yes') {
        return 'linear-gradient(90deg, rgba(34, 197, 94, 0.00) 0%, rgba(34, 197, 94, 0.20) 100%), #2D3049';
      }
      if (voteType === 'no') {
        return 'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049';
      }
      return 'linear-gradient(90deg, rgba(148, 163, 184, 0.00) 0%, rgba(148, 163, 184, 0.15) 100%), #2D3049';
    };

    const getBorderColor = () => {
      if (!isSelected) return '#2D3049';
      if (voteType === 'yes') return '#22c55e';
      if (voteType === 'no') return '#ef4444';
      return '#94a3b8';
    };

    return {
      background: getBackground(),
      color: canVote ? 'white' : '#4b7488',
      border: `1px solid ${getBorderColor()}`,
    };
  };

  const getIconColor = () => {
    if (voteType === 'yes') return 'text-green-500';
    if (voteType === 'no') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div
      className="w-full rounded-lg flex items-center px-3 py-2 gap-2 cursor-pointer"
      style={getStyles()}
      onClick={() => (canVote ? onClick() : null)}
    >
      <Icon className={`${getIconColor()} w-4 h-4 mr-1`} />
      <span className="text-white text-2md flex items-center">{label}</span>
    </div>
  );
};
