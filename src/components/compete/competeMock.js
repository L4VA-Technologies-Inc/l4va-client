// MOCK DATA — design preview only. Replace with the competition API before launch.

const DAY = 24 * 60 * 60 * 1000;

// Pretend the competition started 9 days ago so every status shows up.
export const COMPETITION = {
  start: new Date(Date.now() - 9 * DAY),
  get entryCutoff() {
    return new Date(this.start.getTime() + 23 * DAY);
  },
  get promoEnd() {
    return new Date(this.start.getTime() + 28 * DAY);
  },
  get end() {
    return new Date(this.start.getTime() + 30 * DAY);
  },
};

export const PRIZES = [
  { key: 'token', title: 'Best Performing Token', cash: 1000, l4va: 100000, icon: 'token' },
  {
    key: 'portfolio',
    title: 'Best Performing Portfolio',
    note: 'Different creator',
    cash: 1000,
    l4va: 100000,
    icon: 'portfolio',
  },
  { key: 'community', title: 'Best Community', cash: 500, l4va: 50000, icon: 'community' },
  { key: 'creative', title: 'Most Creative', cash: 500, l4va: 50000, icon: 'creative' },
];

const enteredAgo = days => new Date(Date.now() - days * DAY);

const rows = [
  ['AIX', 'AI Infrastructure', 'neuralalpha', 142.8, 189.4, 184500, 438, 9],
  ['GLDX', 'Digital Gold', 'hardassetdao', 96.4, 121.7, 142800, 312, 9],
  ['NRGX', 'Future Energy', 'energybull', 81.2, 102.6, 96700, 284, 8],
  ['TITN', 'Onchain Titans', 'chainbuilder', 67.9, 85.1, 212300, 591, 8],
  ['ORBT', 'Space Economy', 'orbitalfi', 53.6, 71.4, 78400, 205, 7],
  ['MEDX', 'Health Innovators', 'biohodl', 41.2, 44.9, 51200, 167, 7],
  ['CHIP', 'Semiconductor Basket', 'waferwhale', 37.5, 39.0, 66900, 143, 10],
  ['RBTX', 'Robotics Index', 'servostack', 28.3, 30.1, 40200, 98, 9],
  ['WATR', 'Water Rights', 'bluegold', 19.7, 22.4, 31800, 77, 4, 'qualifying'],
  ['GAME', 'Gaming Majors', 'pixelfund', 15.1, 15.1, 27400, 64, 2, 'qualifying'],
  ['FARM', 'AgriTech Basket', 'harvestdao', 9.8, 12.2, 22100, 51, 8, 'review'],
  ['LUXE', 'Luxury Brands', 'velvetvault', 6.4, 6.4, 18300, 33, 1, 'qualifying'],
];

export const TOKEN_ROWS = rows.map(([symbol, name, creator, q, total, value, holders, days, status], i) => ({
  id: `mock-${i}`,
  symbol,
  name,
  creator,
  qualifyingReturn: q,
  totalReturn: total,
  value,
  holders,
  enteredAt: enteredAgo(days),
  status: status ?? 'qualified',
}));

// Portfolio NAV returns differ from token prices; shuffle a bit so the tabs look distinct.
export const PORTFOLIO_ROWS = TOKEN_ROWS.map((row, i) => ({
  ...row,
  qualifyingReturn: +(row.qualifyingReturn * (0.55 + ((i * 7) % 5) / 10)).toFixed(1),
  totalReturn: +(row.totalReturn * (0.6 + ((i * 3) % 5) / 10)).toFixed(1),
})).sort((a, b) => b.qualifyingReturn - a.qualifyingReturn);

export const COMMUNITY_ROWS = TOKEN_ROWS.slice(0, 8)
  .map((row, i) => ({ ...row, score: 96 - i * 7 - (i % 3), growth: 420 - i * 41 }))
  .sort((a, b) => b.score - a.score);

export const CREATIVE_ROWS = TOKEN_ROWS.slice(2, 10).map((row, i) => ({ ...row, score: 9.4 - i * 0.5 }));
