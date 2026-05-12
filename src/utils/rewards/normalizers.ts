import { format, isValid } from 'date-fns';

export const formatDate = (date: Date | string, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr);
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
  if (!startDate || !endDate) return '';
  const startFormatted = formatDate(startDate, 'MMM dd');
  const endFormatted = formatDate(endDate, 'MMM dd, yyyy');
  if (!startFormatted || !endFormatted) return '';
  return `${startFormatted} - ${endFormatted}`;
};

export const formatPercentage = (value: number, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};
