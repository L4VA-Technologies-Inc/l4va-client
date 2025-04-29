import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';
import TimeBanner from '@/icons/time-banner.svg?react';

export const VaultCountdown = () => {
  const endTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="relative">
      <TimeBanner className="w-full text-red-600" />
      <div className="absolute inset-0 flex items-center justify-start pl-4">
        <div className="font-mono text-2xl font-bold text-white">
          {formatNumber(timeLeft.days)}D : {formatNumber(timeLeft.hours)}H : {formatNumber(timeLeft.minutes)}M
        </div>
      </div>
    </div>
  );
}; 
