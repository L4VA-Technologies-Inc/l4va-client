import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { VestingProgress } from './VestingProgress';

export const VestingGrouped = ({ positions, groupBy = 'epoch' }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  if (!positions || positions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No vesting positions available</div>;
  }

  // Group positions
  const grouped = positions.reduce((acc, position) => {
    let key;
    let label;

    if (groupBy === 'epoch') {
      key = position.epochId || 'unknown';
      label = position.epochId ? `Epoch ${position.epochId}` : 'Unknown Epoch';
    } else if (groupBy === 'vault') {
      key = position.vaultId || 'unknown';
      label = position.vaultId ? `Vault ${position.vaultId.slice(0, 8)}...` : 'Unknown Vault';
    } else {
      // Default: no grouping
      key = 'all';
      label = 'All Positions';
    }

    if (!acc[key]) {
      acc[key] = {
        label,
        positions: [],
        totalAmount: 0,
      };
    }

    acc[key].positions.push(position);
    acc[key].totalAmount += position.totalAmount || 0;

    return acc;
  }, {});

  const toggleGroup = key => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const groups = Object.keys(grouped);

  // If only one group or groupBy is 'all', don't show collapsible headers
  if (groups.length === 1 && groups[0] === 'all') {
    return (
      <div className="space-y-4">
        {grouped['all'].positions.map((position, index) => (
          <VestingProgress key={position.id || index} position={position} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(key => {
        const group = grouped[key];
        const isExpanded = expandedGroups.has(key);

        return (
          <div key={key} className="border border-gray-700/50 rounded-lg overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(key)}
              className="w-full px-4 py-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{group.label}</span>
                <span className="text-sm text-gray-400">
                  {group.positions.length} position{group.positions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-400">
                    {Number(group.totalAmount).toLocaleString()} VLRM
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Group Content */}
            {isExpanded && (
              <div className="p-4 space-y-4 bg-gray-900/20">
                {group.positions.map((position, index) => (
                  <VestingProgress key={position.id || index} position={position} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
