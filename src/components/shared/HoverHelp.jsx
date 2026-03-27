import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export const HoverHelp = ({ hint, className = '', variant = 'help', children = null, wrap = undefined }) => {
  const isIconVariant = variant === 'icon';
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);

  const { hintText, shouldWrap } = useMemo(() => {
    const text = typeof hint === 'string' ? hint : String(hint ?? '');
    const autoWrap = text.includes('\n') || text.length > 80;
    return { hintText: text, shouldWrap: typeof wrap === 'boolean' ? wrap : autoWrap };
  }, [hint, wrap]);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left + rect.width / 2,
      top: rect.top - 8,
    });
  };

  const show = () => {
    updatePosition();
    setIsVisible(true);
  };

  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

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
            className={`fixed z-[9999] px-3 py-2 bg-steel-850 text-white text-sm rounded-lg text-left pointer-events-none shadow-xl ${
              shouldWrap ? 'max-w-[min(360px,calc(100vw-24px))] whitespace-pre-wrap break-words' : 'whitespace-nowrap'
            }`}
            style={{
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {hintText}
          </div>,
          document.body
        )}
    </Tag>
  );
};
