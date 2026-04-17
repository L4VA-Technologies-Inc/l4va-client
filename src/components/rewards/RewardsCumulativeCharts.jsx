import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { HoverHelp } from '@/components/shared/HoverHelp';

const VAULT_HINT = `Cumulative $L4VA rewards over time, broken down by vault. Each colored band shows how much you've earned from each vault.`;
const ACTIVITY_HINT = `Cumulative $L4VA rewards over time, broken down by activity type. See which activities contribute most to your earnings.`;

const CHART_COLORS = [
  '#FF842C',
  '#FFD012',
  '#4ADE80',
  '#818CF8',
  '#F472B6',
  '#22D3EE',
  '#A78BFA',
  '#FB923C',
  '#34D399',
  '#E879F9',
];

const ACTIVITY_LABELS = {
  asset_contribution: 'Vault Deposits',
  token_acquire: 'Token Acquisitions',
  expansion_asset_contribution: 'Expansion Deposits',
  expansion_token_purchase: 'Expansion Tokens',
  lp_position_update: 'LP Positions',
  widget_swap: 'Widget Swaps',
  governance_proposal: 'Proposals',
  governance_vote: 'Governance Votes',
};

const TIME_FILTERS = [
  { label: 'All', value: 'all' },
  { label: '30d', value: '30' },
  { label: '60d', value: '60' },
  { label: '90d', value: '90' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatAmount(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

function buildCumulativeData(timeline, seriesKey, filterDays) {
  if (!timeline?.length) return { chartData: [], seriesKeys: [], seriesMetadata: {} };

  // Filter by date
  let filtered = timeline;
  if (filterDays !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(filterDays));
    filtered = timeline.filter(item => new Date(item.epochEnd) >= cutoff);
  }

  // Get unique series and dates
  const seriesSet = new Set();
  const dateMap = new Map();
  const seriesMetadata = {}; // Track vaultId for each vaultName

  for (const item of filtered) {
    const key = item[seriesKey];
    seriesSet.add(key);

    // Store vaultId mapping for navigation
    if (seriesKey === 'vaultName' && item.vaultId && !seriesMetadata[key]) {
      seriesMetadata[key] = { vaultId: item.vaultId };
    }

    const dateKey = item.epochEnd.slice(0, 10);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: item.epochEnd, epochNumber: item.epochNumber });
    }

    const existing = dateMap.get(dateKey);
    existing[key] = (existing[key] || 0) + item.rewardAmount;
  }

  const seriesKeys = [...seriesSet];
  const dates = [...dateMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

  // Compute cumulative sums
  const cumulative = {};
  for (const key of seriesKeys) {
    cumulative[key] = 0;
  }

  const chartData = dates.map(entry => {
    const point = { date: entry.date, epochNumber: entry.epochNumber };
    for (const key of seriesKeys) {
      cumulative[key] += entry[key] || 0;
      point[key] = cumulative[key];
    }
    return point;
  });

  return { chartData, seriesKeys, seriesMetadata };
}

function CustomTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-steel-900 border border-steel-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-steel-400 text-xs mb-2">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload
        .filter(entry => entry.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-steel-300">{entry.name}</span>
            </div>
            <span className="text-white font-medium">{formatAmount(entry.value)}</span>
          </div>
        ))}
      <div className="border-t border-steel-700 mt-2 pt-2 flex justify-between text-sm">
        <span className="text-steel-400">Total</span>
        <span className="text-orange-400 font-semibold">{formatAmount(total)} $L4VA</span>
      </div>
    </div>
  );
}

function CumulativeAreaChart({ title, hint, timeline, seriesKey, labelMap, isLoading, onSeriesClick }) {
  const [filterDays, setFilterDays] = useState('all');

  const { chartData, seriesKeys, seriesMetadata } = useMemo(
    () => buildCumulativeData(timeline, seriesKey, filterDays),
    [timeline, seriesKey, filterDays]
  );

  const getLabel = key => labelMap?.[key] || key;

  // Sanitize key for use in CSS IDs (remove spaces and special chars)
  const sanitizeKey = key => key.replace(/[^a-zA-Z0-9]/g, '_');

  const handleLegendClick = key => {
    if (onSeriesClick && seriesMetadata[key]?.vaultId) {
      onSeriesClick(seriesMetadata[key].vaultId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-750">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <div className="p-6 flex items-center justify-center h-[300px]">
          <div className="animate-pulse text-steel-500">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-750">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <div className="p-6 flex items-center justify-center h-[200px]">
          <p className="text-steel-500 text-sm">No reward data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-steel-750 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">{title}</h3>
          <HoverHelp hint={hint} />
        </div>
        <div className="flex gap-1">
          {TIME_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterDays(f.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterDays === f.value
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-steel-400 hover:text-steel-300 hover:bg-steel-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              {seriesKeys.map((key, i) => (
                <linearGradient key={key} id={`gradient-${sanitizeKey(key)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: '#6b7a90', fontSize: 11 }}
              axisLine={{ stroke: '#2a3040' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAmount}
              tick={{ fill: '#6b7a90', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} labelFormatter={formatDate} />
            <Legend
              formatter={value => getLabel(value)}
              wrapperStyle={{
                paddingTop: 12,
                cursor: onSeriesClick ? 'pointer' : 'default',
              }}
              onClick={onSeriesClick ? e => handleLegendClick(e.value) : undefined}
            />
            {seriesKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={getLabel(key)}
                stackId="1"
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={`url(#gradient-${sanitizeKey(key)})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export const RewardsCumulativeByVault = ({ timeline, isLoading, onVaultClick }) => {
  return (
    <CumulativeAreaChart
      title="Rewards Accumulated Over Time by Vault"
      hint={VAULT_HINT}
      timeline={timeline}
      seriesKey="vaultName"
      labelMap={null}
      isLoading={isLoading}
      onSeriesClick={onVaultClick}
    />
  );
};

export const RewardsCumulativeByActivity = ({ timeline, isLoading }) => {
  return (
    <CumulativeAreaChart
      title="Rewards Accumulated Over Time by Activity"
      hint={ACTIVITY_HINT}
      timeline={timeline}
      seriesKey="activityType"
      labelMap={ACTIVITY_LABELS}
      isLoading={isLoading}
    />
  );
};
