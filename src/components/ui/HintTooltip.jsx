import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const TOUCH_VISIBLE_MS = 1800;
// Only one tap-opened hint may be visible: opening one closes the rest.
const OPEN_EVENT = 'hint-tooltip:open';
// Gap kept between the hint and the screen edge.
const EDGE_GAP = 8;

/**
 * Tooltip that shows on hover with a mouse and on tap on touch screens (where hover never fires).
 * A tap still triggers the child's own action; the hint just stays visible briefly afterwards.
 */
export const HintTooltip = ({ content, children, className = '' }) => {
  const [touchOpen, setTouchOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const timer = useRef(null);
  const tip = useRef(null);
  const id = useId();

  // Centered on its trigger, a hint near the screen edge ran off it on phones: nudge it back inside.
  const fitToViewport = () => {
    const el = tip.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = rect.left - shift;
    const right = rect.right - shift;
    const maxRight = window.innerWidth - EDGE_GAP;
    if (left < EDGE_GAP) setShift(EDGE_GAP - left);
    else if (right > maxRight) setShift(maxRight - right);
    else setShift(0);
  };

  useLayoutEffect(() => {
    if (touchOpen) fitToViewport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchOpen]);

  useEffect(() => {
    const closeIfOther = event => {
      if (event.detail === id) return;
      clearTimeout(timer.current);
      setTouchOpen(false);
    };
    window.addEventListener(OPEN_EVENT, closeIfOther);
    return () => {
      window.removeEventListener(OPEN_EVENT, closeIfOther);
      clearTimeout(timer.current);
    };
  }, [id]);

  const handlePointerDown = event => {
    if (event.pointerType === 'mouse') return;
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setTouchOpen(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTouchOpen(false), TOUCH_VISIBLE_MS);
  };

  return (
    <div className={cn('group relative', className)} onPointerDown={handlePointerDown} onMouseEnter={fitToViewport}>
      {children}
      <div
        ref={tip}
        role="tooltip"
        style={{ marginLeft: shift }}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[calc(100vw-1rem)] px-3 py-2 bg-steel-850 text-white text-xs rounded-lg transition-opacity duration-200 z-10 pointer-events-none',
          touchOpen ? 'opacity-100' : 'opacity-0 [@media(hover:hover)]:group-hover:opacity-100'
        )}
      >
        {content}
      </div>
    </div>
  );
};
