import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export const HoverHelp = ({ hint, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
      });
    }
  };

  const handleMouseEnter = () => {
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

  return (
    <div
      ref={triggerRef}
      className={`inline-flex font-normal ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={handleMouseEnter}
      onBlur={() => setIsVisible(false)}
      tabIndex="0"
      role="button"
    >
      <HelpCircle className="w-5 h-5 text-white/60 cursor-help hover:text-white transition-colors" />

      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 bg-steel-850 text-white text-sm rounded-lg sm:max-w-[360px] sm:min-w-[200px] max-w-[250px] min-w-[100px] whitespace-pre-wrap break-words text-left pointer-events-none shadow-xl"
            style={{
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {hint}
          </div>,
          document.body
        )}
    </div>
  );
};
