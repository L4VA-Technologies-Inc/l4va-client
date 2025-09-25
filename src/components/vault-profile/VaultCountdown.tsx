import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';
import { cn } from '@/lib/utils';

type VaultCountdownProps = {
  className?: string;
  color?: 'red' | 'yellow';
  endTime: string | number | null;
};

export const VaultCountdown = ({ endTime, className = '', color = 'red' }: VaultCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    if (typeof endTime !== 'number') return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (typeof endTime === 'string') {
    return (
      <div className="flex flex-col items-center relative" role="status">
        <div
          className={cn(
            'flex items-center justify-start w-full font-russo text-2xl font-bold text-white pointer-events-none px-4',
            color === 'red' ? 'vault-countdown-banner' : 'vault-countdown-banner-yellow',
            className
          )}
        >
          {endTime}
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => String(num);
  const countdownText = `${formatNumber(timeLeft.days)}d ${formatNumber(timeLeft.hours)}h ${formatNumber(timeLeft.minutes)}m ${formatNumber(timeLeft.seconds)}s`;

  return (
    <div className="flex flex-col items-center relative" role="timer">
      <div
        className={cn(
          'flex items-center justify-start w-full font-russo text-2xl font-bold text-white pointer-events-none px-4',
          color === 'red' ? 'vault-countdown-banner' : 'vault-countdown-banner-yellow',
          className
        )}
      >
        {countdownText}
      </div>
    </div>
  );
};
