import { useEffect, useState } from 'react';

import { calculateTimeLeft } from '@/utils/core.utils';
import { cn } from '@/lib/utils';

type VaultCountdownProps = {
  className?: string;
  color?: 'red' | 'yellow';
  countdownValue: string | number | null;
};

export const VaultCountdown = ({ countdownValue, className = '', color = 'red' }: VaultCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(countdownValue));

  useEffect(() => {
    if (typeof countdownValue !== 'number') return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(countdownValue));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownValue]);

  if (typeof countdownValue === 'string') {
    return (
      <div className="flex flex-col items-center relative" role="status">
        <div
          className={cn(
            'flex items-center justify-start w-full font-russo text-2xl font-bold text-white pointer-events-none px-4',
            color === 'red' ? 'vault-countdown-banner' : 'vault-countdown-banner-yellow',
            className
          )}
        >
          {countdownValue}
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
