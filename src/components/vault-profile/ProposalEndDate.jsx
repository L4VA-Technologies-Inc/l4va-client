import { useEffect, useState } from 'react';

import { formatProposalEndDate } from '@/utils/core.utils';

export const ProposalEndDate = ({ startDate, endDate, proposalStatus }) => {
  const [displayValue, setDisplayValue] = useState(null);

  const isEnded = proposalStatus === 'executed' || proposalStatus === 'rejected';
  const isUpcoming = proposalStatus === 'upcoming';

  useEffect(() => {
    const dateToUse = isUpcoming ? startDate : endDate;
    if (!dateToUse) return;

    const updateDisplay = () => {
      const result = formatProposalEndDate(dateToUse);
      setDisplayValue(result);
      return result;
    };

    const initialResult = updateDisplay();

    if (initialResult?.type === 'countdown') {
      const interval = setInterval(updateDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [startDate, endDate, isUpcoming]);

  if (!displayValue) return null;

  if (displayValue.type === 'ended' || isEnded) {
    let status = 'Started';
    if (proposalStatus === 'executed') {
      status = 'Executed';
    } else if (proposalStatus === 'rejected') {
      status = 'Failed';
    }
    return (
      <span>
        {status} {displayValue.value}
      </span>
    );
  }

  if (displayValue.type === 'countdown') {
    const { hours, minutes, seconds } = displayValue.value;
    const prefix = isUpcoming ? 'Starts in' : 'Ends in';
    return (
      <span>
        {prefix} {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    );
  }

  const prefix = isUpcoming ? 'Starts' : 'Ends';
  return (
    <span>
      {prefix} {displayValue.value}
    </span>
  );
};
