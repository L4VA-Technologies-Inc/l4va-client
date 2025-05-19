import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';
import TimeBanner from '@/icons/time-banner.svg?react';

export const VaultCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = num => String(num);

  return (
    <div className="relative">
      <TimeBanner className="w-full text-red-600" />
      <div className="absolute inset-0 flex items-center justify-start pl-4">
        <div className="font-mono text-xl font-bold text-white">
          {formatNumber(timeLeft.days)}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m{' '}
          {formatNumber(timeLeft.seconds)}s
        </div>
      </div>
    </div>
  );
};
