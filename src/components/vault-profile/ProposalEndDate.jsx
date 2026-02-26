import { useEffect, useState } from 'react';

import { formatProposalEndDate, formatDateWithTime } from '@/utils/core.utils';

export const ProposalEndDate = ({ startDate, endDate, proposalStatus }) => {
  const [displayValue, setDisplayValue] = useState(null);

  const isEnded = proposalStatus === 'executed' || proposalStatus === 'rejected';
  const isUpcoming = proposalStatus === 'upcoming';

  useEffect(() => {
    const dateToUse = isUpcoming ? startDate : endDate;
    if (!dateToUse) return;

    const updateDisplay = () => {
      const result = formatProposalEndDate(dateToUse);

      // If proposal is ended (rejected/executed), force the display to show formatted date
      if (isEnded && result?.type === 'countdown') {
        setDisplayValue({
          type: 'ended',
          value: formatDateWithTime(new Date(dateToUse)),
        });
        return { type: 'ended' };
      }

      setDisplayValue(result);
      return result;
    };

    const initialResult = updateDisplay();

    // Only set up countdown interval if proposal is NOT ended and result is a countdown
    if (initialResult?.type === 'countdown' && !isEnded) {
      const interval = setInterval(updateDisplay, 1000);
      return () => clearInterval(interval);
    }
  }, [startDate, endDate, isUpcoming, isEnded]);

  if (!displayValue) return null;

  // Check countdown FIRST before checking isEnded status
  if (displayValue.type === 'countdown') {
    const { hours, minutes, seconds } = displayValue.value;
    const prefix = isUpcoming ? 'Starts in' : 'Ends in';
    return (
      <span>
        {prefix} {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    );
  }

  // Handle ended proposals (status-based) or type === 'ended'
  if (displayValue.type === 'ended' || isEnded) {
    let status = 'Started';
    if (proposalStatus === 'executed') {
      status = 'Executed';
    } else if (proposalStatus === 'rejected') {
      status = 'Failed';
    }

    // For ended proposals, always use formatted date string
    let valueToDisplay;
    if (typeof displayValue.value === 'string') {
      valueToDisplay = displayValue.value;
    } else {
      // If value is still an object (shouldn't happen but defensive), format the date directly
      const dateToFormat = isUpcoming ? startDate : endDate;
      valueToDisplay = dateToFormat ? formatDateWithTime(new Date(dateToFormat)) : 'N/A';
    }

    return (
      <span>
        {status} {valueToDisplay}
      </span>
    );
  }

  // Handle 'date' type or any other type
  const prefix = isUpcoming ? 'Starts' : 'Ends';
  const valueToDisplay =
    typeof displayValue.value === 'string' ? displayValue.value : JSON.stringify(displayValue.value);

  return (
    <span>
      {prefix} {valueToDisplay}
    </span>
  );
};
