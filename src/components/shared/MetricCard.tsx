import { HoverHelp } from '@/components/shared/HoverHelp.jsx';

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

const MetricCard = ({ label, value, hint, className = '' }: MetricCardProps) => (
  <div className={`bg-steel-900/50 rounded-lg p-3 border border-steel-800/50 ${className}`}>
    <div className="text-dark-100 text-sm font-medium mb-1 flex items-center gap-1.5">
      {label}
      {hint && <HoverHelp hint={hint} />}
    </div>
    <div className="text-white font-semibold">{value}</div>
  </div>
);

export default MetricCard;
