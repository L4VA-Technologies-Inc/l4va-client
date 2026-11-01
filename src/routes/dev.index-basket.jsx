import { createFileRoute, notFound } from '@tanstack/react-router';

import { VaultIndexAllocationView } from '@/components/vault-profile/VaultIndexAllocation';

// Dev-only mock gallery for the index basket view. 404s outside `vite dev`.

const L4VA = { assetAddress: '0x0C020Bef00000000000000000000000000003683', symbol: 'L4VA', name: 'L4VA' };
const WETH = { assetAddress: '0x0000000000000000000000000000000000000001', symbol: 'WETH', name: 'Wrapped Ether' };
const USDC = { assetAddress: '0x0000000000000000000000000000000000000002', symbol: 'USDC', name: 'USD Coin' };
const HOOD = { assetAddress: '0x0000000000000000000000000000000000000003', symbol: 'HOOD', name: 'Robinhood Markets' };
const OLD = { assetAddress: '0x0000000000000000000000000000000000000004', symbol: 'PEPE', name: 'Pepe' };

const usd = valueUsd => ({ valueUsd, valueNative: '0' });
const formatValue = v => `$${Number(v.valueUsd ?? 0).toFixed(2)}`;

const holding = (asset, targetBps, actualBps, valueUsd, inBasket = true) => ({
  ...asset,
  targetBps,
  actualBps,
  driftBps: actualBps - targetBps,
  inBasket,
  ...usd(valueUsd),
});

const run = (id, trigger, status, legs, extra = {}) => ({
  id,
  trigger,
  status,
  createdAt: '2026-10-28T16:37:00Z',
  completedAt: status === 'completed' ? '2026-10-28T16:37:00Z' : null,
  navNative: '3100000000000000',
  legs: legs.map((l, i) => ({ operationId: `${id}-${i}`, status: 'confirmed', txHash: '0xabc', ...l })),
  ...extra,
});

const CASES = [
  {
    title: 'Before lock — target weights only',
    config: {
      reserveBps: 1000,
      targets: [
        { ...L4VA, weightBps: 5000 },
        { ...WETH, weightBps: 3000 },
        { ...USDC, weightBps: 2000 },
      ],
    },
  },
  {
    title: 'Live, on target — single asset + LP (current SWAPP vault)',
    config: { reserveBps: 1000, targets: [{ ...L4VA, weightBps: 10000 }] },
    portfolio: {
      assets: [holding(L4VA, 9000, 8890, 5.58)],
      reserve: { targetBps: 1000, actualBps: 1110, ...usd(0.7) },
      lp: usd(3.36),
    },
    rebalances: [run('r1', 'initial_buy', 'completed', [{ side: 'buy', symbol: 'L4VA' }])],
  },
  {
    title: 'Live, drifting — multi-asset, one leg moved',
    config: {
      reserveBps: 1000,
      targets: [
        { ...L4VA, weightBps: 5000 },
        { ...WETH, weightBps: 3000 },
        { ...HOOD, weightBps: 2000 },
      ],
    },
    portfolio: {
      assets: [holding(L4VA, 4500, 5320, 532), holding(WETH, 2700, 2410, 241), holding(HOOD, 1800, 1430, 143)],
      reserve: { targetBps: 1000, actualBps: 840, ...usd(84) },
    },
    rebalances: [
      run('r1', 'initial_buy', 'completed', [
        { side: 'buy', symbol: 'L4VA' },
        { side: 'buy', symbol: 'WETH' },
        { side: 'buy', symbol: 'HOOD' },
      ]),
    ],
  },
  {
    title: 'Governance re-weight in progress — asset leaving the basket',
    config: {
      version: 2,
      reserveBps: 500,
      targets: [
        { ...L4VA, weightBps: 6000 },
        { ...USDC, weightBps: 4000 },
      ],
    },
    portfolio: {
      assets: [holding(L4VA, 5700, 4100, 410), holding(USDC, 3800, 1900, 190), holding(OLD, 0, 3400, 340, false)],
      reserve: { targetBps: 500, actualBps: 600, ...usd(60) },
    },
    rebalances: [
      run('r2', 'governance_reweight', 'executing', [{ side: 'sell', symbol: 'PEPE' }]),
      run('r1', 'initial_buy', 'completed', [
        { side: 'buy', symbol: 'L4VA' },
        { side: 'buy', symbol: 'PEPE' },
      ]),
    ],
  },
  {
    title: 'Failed rebalance — off target',
    config: {
      reserveBps: 1000,
      targets: [
        { ...L4VA, weightBps: 7000 },
        { ...WETH, weightBps: 3000 },
      ],
    },
    portfolio: {
      assets: [holding(L4VA, 6300, 6100, 61), holding(WETH, 2700, 0, 0)],
      reserve: { targetBps: 1000, actualBps: 3900, ...usd(39) },
    },
    rebalances: [run('r1', 'initial_buy', 'failed', [{ side: 'buy', symbol: 'L4VA' }], { completedAt: null })],
  },
  {
    title: 'Quotes unavailable — falls back to targets',
    config: {
      reserveBps: 1000,
      targets: [
        { ...L4VA, weightBps: 8000 },
        { ...WETH, weightBps: 2000 },
      ],
    },
    portfolio: { error: 'Live prices are unavailable right now', assets: [] },
  },
];

const IndexBasketMocks = () => (
  <div className="container mx-auto max-w-4xl space-y-10 px-4 py-12">
    <h1 className="text-2xl font-semibold">Index basket — mock states</h1>
    {CASES.map(c => (
      <div key={c.title} className="space-y-3">
        <p className="text-sm text-dark-100">{c.title}</p>
        <VaultIndexAllocationView
          config={c.config}
          portfolio={c.portfolio}
          rebalances={c.rebalances}
          formatValue={formatValue}
        />
      </div>
    ))}
  </div>
);

export const Route = createFileRoute('/dev/index-basket')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: IndexBasketMocks,
});
