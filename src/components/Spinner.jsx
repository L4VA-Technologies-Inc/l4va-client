const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Spinner = ({ size = 'md' }) => (
  <div
    className={`animate-spin rounded-full border-t-2 border-b-2 border-orange-500 ${sizeClasses[size] ?? sizeClasses.md}`}
  ></div>
);
