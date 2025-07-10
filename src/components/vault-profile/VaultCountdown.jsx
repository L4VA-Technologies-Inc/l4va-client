import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';

export const VaultCountdown = ({ endTime, isLocked }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = num => String(num);

  const countdownText = isLocked
    ? 'LOCKED'
    : `${formatNumber(timeLeft.days)}d ${formatNumber(timeLeft.hours)}h ${formatNumber(timeLeft.minutes)}m ${formatNumber(timeLeft.seconds)}s`;

  return (
    <div className="countdown-banner min-h-[45px] md:min-h-[65px]" role="timer">
      <div className="countdown-stripe" />
      <div className="relative z-[1] font-mono md:text-xl font-bold text-white">{countdownText}</div>
    </div>
  );
};
