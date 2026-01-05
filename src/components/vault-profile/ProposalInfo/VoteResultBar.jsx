import { CheckCircle, XCircle, Ellipsis } from 'lucide-react';

const VoteBar = ({ label, percentage, textColor, bgColor, barColor, icon: Icon }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className={`${textColor} text-sm flex items-center`}>
        <Icon className="w-4 h-4 mr-1" />
        {label}
      </span>
      <span className={`${textColor} text-sm`}>{percentage}%</span>
    </div>
    <div className={`w-full ${bgColor} rounded-full h-2 overflow-hidden`}>
      <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

export const VoteResultBar = ({ votes, hasAbstain }) => {
  if (!votes) {
    return <div className="text-gray-400 text-sm">No votes data yet</div>;
  }

  return (
    <div className="space-y-3 mb-6">
      <VoteBar
        label="Yes, pass this Proposal"
        percentage={votes.yes ?? 0}
        textColor="text-green-500"
        bgColor="bg-green-900"
        barColor="bg-green-500"
        icon={CheckCircle}
      />
      <VoteBar
        label="No, do not pass this Proposal"
        percentage={votes.no ?? 0}
        textColor="text-red-600"
        bgColor="bg-red-900"
        barColor="bg-red-600"
        icon={XCircle}
      />
      {hasAbstain && (
        <VoteBar
          label="Do nothing"
          percentage={votes.abstain ?? 0}
          textColor="text-gray-600"
          bgColor="bg-gray-900"
          barColor="bg-gray-600"
          icon={Ellipsis}
        />
      )}
    </div>
  );
};
