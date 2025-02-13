import { useEffect, useRef, useState } from 'react';

export const useCountAnimation = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    // Parse the end value - handle currency and numbers with commas
    const parseValue = (val) => {
      if (typeof val === 'string') {
        // Remove currency symbol and commas
        return Number.parseFloat(val.replace(/[$,]/g, ''));
      }
      return val;
    };

    const endVal = parseValue(endValue);

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;

      if (progress < duration) {
        const nextCount = (progress / duration) * endVal;
        setCount(nextCount);
        countRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [endValue, duration]);

  // Format the count based on the original value format
  const formatCount = () => {
    if (typeof endValue === 'string') {
      if (endValue.startsWith('$')) {
        return `$${count.toFixed(2)} M`;
      }
    }
    return Math.round(count).toString();
  };

  return formatCount();
};
