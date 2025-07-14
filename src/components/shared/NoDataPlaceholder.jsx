import { Search } from 'lucide-react';
import clsx from 'clsx';

export const NoDataPlaceholder = ({
  message = 'No data found',
  icon: Icon = Search,
  className = '',
  iconBgColor = 'bg-primary-blue/15',
  iconInnerBgColor = 'bg-primary-blue/30',
}) => {
  return (
    <div
      className={clsx(
        'w-full flex flex-col items-center justify-center gap-4 p-8 bg-fill-primary rounded-2xl',
        className
      )}
    >
      <div className={clsx('p-2 rounded-full flex items-center justify-center', iconBgColor)}>
        <div className={clsx('p-2 rounded-full flex items-center justify-center', iconInnerBgColor)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-text-secondary font-semibold">{message}</p>
    </div>
  );
};
