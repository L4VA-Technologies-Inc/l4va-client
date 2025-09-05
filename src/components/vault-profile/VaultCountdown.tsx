import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';
import { cn } from '@/lib/utils';

type VaultCountdownProps = {
  className?: string;
  color?: 'red' | 'yellow';
  endTime: string;
  isLocked?: boolean;
  isFailed?: boolean;
};

export const VaultCountdown = ({ endTime, isLocked, isFailed, className = '', color = 'red' }: VaultCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => String(num);

  const countdownText = isLocked
    ? 'LOCKED'
    : isFailed
      ? 'FAILED'
      : `${formatNumber(timeLeft.days)}d ${formatNumber(timeLeft.hours)}h ${formatNumber(timeLeft.minutes)}m ${formatNumber(timeLeft.seconds)}s`;

  return (
    <div className="flex flex-col items-center relative" role="timer">
      <div
        className={cn(
          'flex items-center justify-start w-full font-russo text-2xl font-bold text-white pointer-events-none px-4',
          color === 'red' || isLocked ? 'vault-countdown-banner' : 'vault-countdown-banner-yellow',
          className
        )}
      >
        {countdownText}
      </div>
    </div>
  );
};
