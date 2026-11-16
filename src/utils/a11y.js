/**
 * Props that make a non-button element (div/tr/span card) keyboard-operable:
 * focusable, announced as a button/link, and activated by Enter (and Space for buttons).
 * Key events bubbling up from nested controls (inputs, inner buttons) are ignored.
 */
export const clickableProps = (onClick, { disabled = false, role = 'button' } = {}) => {
  if (!onClick) return {};
  return {
    role,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled || undefined,
    onClick: disabled ? undefined : onClick,
    onKeyDown: event => {
      if (disabled || event.target !== event.currentTarget) return;
      if (event.key === 'Enter' || (role === 'button' && event.key === ' ')) {
        event.preventDefault();
        onClick(event);
      }
    },
  };
};

/** 'smooth' unless the user asked the OS for reduced motion. Use as `behavior: scrollBehavior()`. */
export const scrollBehavior = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
