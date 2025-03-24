import { useEffect, useState } from 'react';

const calculateTimeLeft = (endTime) => {
  const difference = new Date(endTime) - new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
  };
};

export const VaultCountdown = ({
  endTime,
  contributionDuration,
  contributionOpenWindowType,
  contributionOpenWindowTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="mt-6">
      <h3 className="text-lg mb-2">
        {contributionOpenWindowType === 'custom' ? 'Custom Window' : 'Contribution Window'}
      </h3>
      <div className="bg-[#E31D1D] rounded-lg p-4 relative overflow-hidden">
        {/* Decorative slashes */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <div className="transform -skew-x-12 space-x-2">
            <div className="w-4 h-16 bg-black/20" />
            <div className="w-4 h-16 bg-black/20" />
            <div className="w-4 h-16 bg-black/20" />
          </div>
        </div>

        <div className="relative z-10 font-mono text-2xl font-bold text-white">
          {formatNumber(timeLeft.days)}D : {formatNumber(timeLeft.hours)}H : {formatNumber(timeLeft.minutes)}M
        </div>
      </div>
    </div>
  );
}; 