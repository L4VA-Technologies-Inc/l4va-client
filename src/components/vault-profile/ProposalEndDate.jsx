import { useEffect, useState } from 'react';

import { formatProposalEndDate } from '@/utils/core.utils';

export const ProposalEndDate = ({ endDate, proposalStatus }) => {
  const [displayValue, setDisplayValue] = useState(null);

  const isEnded = proposalStatus === 'executed' || proposalStatus === 'rejected';

  useEffect(() => {
    if (!endDate) return;

    const updateDisplay = () => {
      const result = formatProposalEndDate(endDate);
      setDisplayValue(result);
      return result;
    };

    const initialResult = updateDisplay();

    if (initialResult?.type === 'countdown') {
      const interval = setInterval(updateDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [endDate]);

  if (!displayValue) return null;

  if (displayValue.type === 'ended' || isEnded) {
    return (
      <span>
        {proposalStatus === 'executed' ? 'Executed' : 'Failed'} {displayValue.value}
      </span>
    );
  }

  if (displayValue.type === 'countdown') {
    const { hours, minutes, seconds } = displayValue.value;
    return (
      <span>
        Ends in {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    );
  }

  return <span>Ends {displayValue.value}</span>;
};
