import { useEffect, useState } from 'react';

import { formatProposalEndDate, formatDateWithTime, MS_PER_HOUR, MS_PER_DAY } from '@/utils/core.utils';

/** Tick often enough that the visible unit changes smoothly, and no more. */
const getTickInterval = totalMs => {
  if (totalMs < MS_PER_HOUR) return 1000; // mm:ss is on screen
  if (totalMs < MS_PER_DAY) return 30000; // minutes are on screen
  return 60000; // hours are on screen
};

/** Urgency reads as colour, so a closing window is visible without being read. */
const getUrgencyClass = totalMs => {
  if (totalMs <= 0) return '';
  if (totalMs < MS_PER_HOUR) return 'text-red-400 font-medium';
  if (totalMs < MS_PER_DAY) return 'text-yellow-400 font-medium';
  return '';
};

export const ProposalEndDate = ({ startDate, endDate, proposalStatus, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(null);

  const isEnded = proposalStatus === 'executed' || proposalStatus === 'rejected';
  const isUpcoming = proposalStatus === 'upcoming';

  useEffect(() => {
    const dateToUse = isUpcoming ? startDate : endDate;
    if (!dateToUse) return;

    let timeoutId;

    const updateDisplay = () => {
      const result = formatProposalEndDate(dateToUse);

      // A concluded proposal shows when it concluded, never a live countdown.
      if (isEnded && result?.type === 'countdown') {
        setDisplayValue({ type: 'ended', value: formatDateWithTime(new Date(dateToUse)) });
        return;
      }

      setDisplayValue(result);

      if (result?.type === 'countdown') {
        timeoutId = setTimeout(updateDisplay, getTickInterval(result.totalMs));
      }
    };

    updateDisplay();
    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, isUpcoming, isEnded]);

  if (!displayValue) return null;

  if (displayValue.type === 'countdown') {
    const prefix = isUpcoming ? 'Starts in' : 'Ends in';
    return (
      <span
        className={`${getUrgencyClass(displayValue.totalMs)} ${className}`.trim()}
        title={`${isUpcoming ? 'Voting opens' : 'Voting closes'} ${displayValue.absolute}`}
      >
        {prefix} {displayValue.value}
      </span>
    );
  }

  // Concluded, by status or because the moment has passed.
  let status = 'Ended';
  if (proposalStatus === 'executed') {
    status = 'Executed';
  } else if (proposalStatus === 'rejected') {
    status = 'Failed';
  } else if (isUpcoming) {
    status = 'Started';
  }

  const dateToFormat = isUpcoming ? startDate : endDate;
  const valueToDisplay =
    typeof displayValue.value === 'string'
      ? displayValue.value
      : dateToFormat
        ? formatDateWithTime(new Date(dateToFormat))
        : 'N/A';

  return (
    <span className={className}>
      {status} {valueToDisplay}
    </span>
  );
};
