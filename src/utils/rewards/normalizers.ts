import { format } from 'date-fns';

export const formatDate = (date: Date | string, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatStr);
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate, 'MMM dd')} - ${formatDate(endDate, 'MMM dd, yyyy')}`;
};

export const formatPercentage = (value: number, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};
