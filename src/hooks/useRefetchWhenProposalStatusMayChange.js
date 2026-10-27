import { useEffect } from 'react';

const OVERDUE_RETRY_MS = 3000;
const AFTER_SCHEDULE_BUFFER_MS = 2000;

const getTimestamp = value => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

export const getProposalStatusRefetchDelayMs = (proposals = []) => {
  const now = Date.now();
  let nextFuture = Infinity;
  let hasOverdueTransition = false;

  proposals.forEach(proposal => {
    if (!proposal?.status) return;

    if (proposal.status === 'upcoming') {
      const startAt = getTimestamp(proposal.startDate);
      if (startAt == null) return;
      if (startAt <= now) hasOverdueTransition = true;
      else nextFuture = Math.min(nextFuture, startAt);
    }

    if (proposal.status === 'active') {
      const endAt = getTimestamp(proposal.endDate);
      if (endAt == null) return;
      if (endAt <= now) hasOverdueTransition = true;
      else nextFuture = Math.min(nextFuture, endAt);
    }
  });

  if (hasOverdueTransition) return OVERDUE_RETRY_MS;
  if (nextFuture === Infinity) return null;
  return Math.max(0, nextFuture - now) + AFTER_SCHEDULE_BUFFER_MS;
};

export const useRefetchWhenProposalStatusMayChange = (proposals, refetch) => {
  const list = Array.isArray(proposals) ? proposals : proposals ? [proposals] : [];
  const scheduleKey = list
    .map(proposal => `${proposal?.id}:${proposal?.status}:${proposal?.startDate}:${proposal?.endDate}`)
    .join('|');

  useEffect(() => {
    if (!refetch) return;

    const currentList = Array.isArray(proposals) ? proposals : proposals ? [proposals] : [];
    const delayMs = getProposalStatusRefetchDelayMs(currentList);
    if (delayMs == null) return;

    const timeoutId = setTimeout(() => {
      refetch();
    }, delayMs);

    return () => clearTimeout(timeoutId);
    // scheduleKey captures id/status/dates so a new array identity does not reset the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleKey, refetch]);
};
