export const VoteButton = ({ voteType, icon: Icon, label, canVote, isSelected, onClick }) => {
  const getStyles = () => {
    return {
      background: canVote
        ? voteType === 'yes'
          ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.00) 0%, rgba(34, 197, 94, 0.20) 100%), #2D3049'
          : 'linear-gradient(90deg, rgba(239, 68, 68, 0.00) 0%, rgba(239, 68, 68, 0.20) 100%), #2D3049'
        : '#2D3049',
      color: canVote ? 'white' : '#4b7488',
      border: isSelected ? '1px solid green' : '1px solid #2D3049',
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
      <span className="text-white-500 text-2md flex items-center">{label}</span>
    </div>
  );
};
