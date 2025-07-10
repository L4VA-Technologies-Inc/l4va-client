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
    <div className="flex flex-col items-center relative" role="timer">
      <div className="vault-countdown-banner flex items-center justify-start w-full font-russo text-2xl font-bold text-white pointer-events-none px-4">
        {countdownText}
      </div>
    </div>
  );
};
