import { clickableProps } from '@/utils/a11y';

export const ProposalField = ({ label, value, onClick, children }) => (
  <div className="flex justify-between items-center">
    <div className="text-gray-400">{label}</div>
    {children || (
      <div
        className={`text-white ${onClick ? 'cursor-pointer hover:text-orange-500' : ''}`}
        {...clickableProps(onClick)}
      >
        {value}
      </div>
    )}
  </div>
);
