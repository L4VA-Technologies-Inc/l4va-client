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
  customClassName?: string;
  hideLongString?: boolean;
};

export const InfoRow = ({
  label,
  value,
  symbol = '',
  copyable,
  labelClassName = '',
  hideValue = false,
  hideLongString = false,
  customClassName,
}: InfoRowProps) => {
  const formattedValue = (text: any) => {
    if (typeof text === 'number') {
      return formatNum(text);
    }
    if (hideLongString) {
      return `${text.substring(0, 6)}...${text.substring(text.length - 6)}`
    }

    return text;
  }

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
    <div className={cn('flex justify-between items-center py-2', customClassName)}>
      <span className={cn('text-dark-100', labelClassName)}>{label}</span>
      <div className="flex items-center gap-2">
        {!hideValue && (
          <span>
            {formattedValue(value)} {symbol}
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
