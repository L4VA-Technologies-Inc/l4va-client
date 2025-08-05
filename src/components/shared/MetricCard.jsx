const MetricCard = ({ label, value, className = '' }) => (
  <div className={`bg-steel-900/50 rounded-lg p-3 border border-steel-800/50 ${className}`}>
    <div className="text-dark-100 text-sm font-medium mb-1">{label}</div>
    <div className="text-white font-semibold">{value}</div>
  </div>
);

export default MetricCard;
