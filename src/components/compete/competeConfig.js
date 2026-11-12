// Static Creator Challenge content. Season dates and rankings come from /competition/leaderboard.

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

export const RULES = [
  {
    title: 'Eligibility',
    items: [
      'Every vault on Robinhood Chain with a live liquidity pool is entered automatically. You do not need to sign up.',
      'Vaults created before the competition can compete too. Their performance is measured from the competition start, not from their launch.',
      'New vaults can enter until the Day 23 cutoff, so every entry gets a full 7-day qualifying window.',
      'One creator can enter several vaults, but cannot win both Best Performing Token and Best Performing Portfolio.',
    ],
  },
  {
    title: 'How performance is measured',
    items: [
      'Prices and vault values are snapshotted every hour from on-chain pool data.',
      'Qualifying return compares the 7-day average after entry with the value at entry. Rankings never use a single trade.',
      'Best Performing Token ranks the vault token price. Best Performing Portfolio ranks the value of the vault’s assets.',
      'Returns are provisional until an entry completes its 7-day window.',
    ],
  },
  {
    title: 'Community & Creative awards',
    items: [
      'Best Community and Most Creative are chosen by the L4VA team. Judges look at real community growth and engagement, and at how original and innovative the vault is.',
    ],
  },
  {
    title: 'Anti-manipulation',
    items: [
      'Wash trading, price manipulation, Sybil wallets and related-wallet abuse are prohibited.',
      'A vault needs enough liquidity in its pool to qualify. Entries with suspicious activity are marked Under Review.',
      'L4VA may disqualify any entry that breaks these rules. All prizes are paid only after a final manual review.',
    ],
  },
];
