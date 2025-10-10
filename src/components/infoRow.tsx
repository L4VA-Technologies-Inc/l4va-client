import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { formatNum } from '@/utils/core.utils';
import { cn } from '@/lib/utils';

type InfoRowProps = {
  label: string;
  value: string | number;
  copyable?: boolean;
  hideValue?: boolean;
  labelClassName?: string;
  symbol?: string;
};

export const InfoRow = ({
  label,
  value,
  symbol = '',
  copyable,
  labelClassName = '',
  hideValue = false,
}: InfoRowProps) => {
  const formattedValue = typeof value === 'number' ? formatNum(value) : value;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value.toString())
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <div className="flex justify-between items-center py-2">
      <span className={cn('text-dark-100', labelClassName)}>{label}</span>
      <div className="flex items-center gap-2">
        {!hideValue && (
          <span>
            {formattedValue} {symbol}
          </span>
        )}
        {copyable && (
          <button className="text-gray-500 hover:text-gray-700" type="button" onClick={handleCopy}>
            <Copy className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
