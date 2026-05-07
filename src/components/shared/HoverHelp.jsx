import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

const VIEWPORT_PADDING = 12;
const GAP = 8;

export const HoverHelp = ({ hint, className = '', variant = 'help', children = null, wrap = undefined }) => {
  const isIconVariant = variant === 'icon';
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const { hintText, shouldWrap } = useMemo(() => {
    const text = typeof hint === 'string' ? hint : String(hint ?? '');
    const autoWrap = text.includes('\n') || text.length > 80;
    return { hintText: text, shouldWrap: typeof wrap === 'boolean' ? wrap : autoWrap };
  }, [hint, wrap]);

  const clampTooltipPosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;

    const trigger = triggerEl.getBoundingClientRect();
    const tooltip = tooltipEl.getBoundingClientRect();
    const tw = tooltip.width;
    const th = tooltip.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = VIEWPORT_PADDING;
    const gap = GAP;

    const centerX = trigger.left + trigger.width / 2;

    let left = centerX - tw / 2;
    left = Math.min(Math.max(left, pad), Math.max(pad, vw - pad - tw));

    let top = trigger.top - gap - th;

    if (top < pad) {
      top = trigger.bottom + gap;
    }

    if (top + th > vh - pad) {
      top = Math.max(pad, vh - pad - th);
    }

    setCoords({ left, top });
  }, []);

  const show = () => {
    setIsVisible(true);
  };

  useLayoutEffect(() => {
    if (!isVisible) return;

    clampTooltipPosition();
    const raf1 = requestAnimationFrame(() => clampTooltipPosition());
    const raf2 = requestAnimationFrame(() => clampTooltipPosition());

    const tooltipEl = tooltipRef.current;
    const ro =
      typeof ResizeObserver !== 'undefined' && tooltipEl ? new ResizeObserver(() => clampTooltipPosition()) : null;
    if (ro && tooltipEl) ro.observe(tooltipEl);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro?.disconnect();
    };
  }, [isVisible, hintText, shouldWrap, clampTooltipPosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handle = () => clampTooltipPosition();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);

    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [isVisible, clampTooltipPosition]);

  const Tag = isIconVariant ? 'span' : 'div';

  return (
    <Tag
      ref={triggerRef}
      className={`inline-flex ${isIconVariant ? '' : 'font-normal'} ${className}`}
      onMouseEnter={show}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={show}
      onBlur={() => setIsVisible(false)}
      tabIndex={isIconVariant ? -1 : 0}
      role={isIconVariant ? undefined : 'button'}
    >
      {isIconVariant ? (
        children
      ) : (
        <HelpCircle className="w-5 h-5 text-white/60 cursor-help hover:text-white transition-colors" />
      )}

      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[9999] px-3 py-2 bg-steel-850 text-white text-sm rounded-lg text-left pointer-events-none shadow-xl box-border max-w-[min(360px,calc(100vw-24px))] ${
              shouldWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-normal break-words'
            }`}
            style={{
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              maxWidth: 'min(360px, calc(100vw - 24px))',
            }}
          >
            {hintText}
          </div>,
          document.body
        )}
    </Tag>
  );
};
