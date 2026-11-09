import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const TOUCH_VISIBLE_MS = 1800;

/**
 * Tooltip that shows on hover with a mouse and on tap on touch screens (where hover never fires).
 * A tap still triggers the child's own action; the hint just stays visible briefly afterwards.
 */
export const HintTooltip = ({ content, children, className = '' }) => {
  const [touchOpen, setTouchOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handlePointerDown = event => {
    if (event.pointerType === 'mouse') return;
    setTouchOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTouchOpen(false), TOUCH_VISIBLE_MS);
  };

  return (
    <div className={cn('group relative', className)} onPointerDown={handlePointerDown}>
      {children}
      <div
        role="tooltip"
        className={cn(
          'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-xs rounded-lg transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none',
          touchOpen ? 'opacity-100' : 'opacity-0 [@media(hover:hover)]:group-hover:opacity-100'
        )}
      >
        {content}
      </div>
    </div>
  );
};
