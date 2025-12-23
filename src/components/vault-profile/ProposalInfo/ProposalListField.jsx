export const ProposalListField = ({ label, value }) => {
  if (!Array.isArray(value)) {
    return (
      <div className="flex justify-between">
        <div className="text-gray-400">{label}</div>
        <div className="text-white">{value || 'N/A'}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="text-gray-400">{label}</div>
      <div className="text-white">
        <div className="space-y-1">
          {value.map((v, i) => (
            <div key={i} className="text-sm">
              {typeof v === 'object' ? (v.name ?? JSON.stringify(v)) : v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
