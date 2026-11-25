import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Copy, ExternalLink, Info, Search } from 'lucide-react';

import { VaultsApiProvider } from '@/services/api/vaults';
import { getTokenUrl } from '@/utils/explorer.utils';
import { ChainType } from '@/utils/types';

// Public but unlisted: reachable only by its URL (no menu entry, no links from other pages).

const shortAddress = a => `${a.slice(0, 6)}…${a.slice(-4)}`;
const pct = bps => (bps === null || bps === undefined ? '—' : `${(bps / 100).toFixed(1)}%`);
const utcDate = iso =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const copy = (text, label) =>
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error('Failed to copy'));

const AddressCell = ({ address }) => (
  <span className="inline-flex items-center gap-1.5">
    <code className="text-xs text-dark-100">{shortAddress(address)}</code>
    <button
      type="button"
      aria-label="Copy token address"
      className="rounded p-1 text-dark-100 hover:bg-steel-750 hover:text-white"
      onClick={() => copy(address, 'Token address')}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
    <a
      href={getTokenUrl(address, ChainType.ROBINHOOD)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open in explorer"
      className="rounded p-1 text-dark-100 hover:bg-steel-750 hover:text-white"
    >
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  </span>
);

const SupportedTokensPage = () => {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['index-supported-tokens'],
    queryFn: () => VaultsApiProvider.getIndexSupportedTokens(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const tokens = useMemo(() => data?.tokens ?? [], [data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter(t => !q || [t.symbol, t.name, t.address].some(v => v?.toLowerCase().includes(q)));
  }, [tokens, query]);

  return (
    <div className="container mx-auto px-4 xl:px-0 py-8 text-primary-text space-y-5">
      <section className="rounded-2xl bg-steel-950 border border-steel-850 px-5 py-5 sm:px-8 sm:py-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Index vaults | Robinhood Chain</p>
        <h1 className="mt-1 font-russo text-3xl sm:text-4xl">Supported tokens</h1>
        <p className="mt-2 text-dark-100 max-w-3xl">
          Tokens an index vault can hold today. Each one is checked against live Uniswap liquidity: a vault must be able
          to buy it and sell it back without losing too much. Add a token to your basket by its address.
        </p>
      </section>

      <section className="rounded-2xl bg-steel-950 border border-steel-850 p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <label className="relative lg:ml-auto lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-100" />
            <input
              type="search"
              aria-label="Search tokens"
              value={query}
              placeholder="Search symbol, name or address"
              className="w-full rounded-lg bg-steel-850 border border-steel-750 py-2 pl-9 pr-3 text-sm placeholder:text-dark-100 focus:outline-none focus:border-orange-500"
              onChange={e => setQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-dark-100">
                <th className="px-2 py-2 font-medium">Token</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium text-right">
                  <span title={`Buy ${data?.refEth ?? '0.1'} ETH worth and sell it straight back`}>
                    Round-trip cost <Info className="ml-1 inline h-3 w-3 align-[-1px]" />
                  </span>
                </th>
                <th className="px-2 py-2 font-medium">Address</th>
                <th className="px-2 py-2 font-medium text-right">Checked</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.address} className="border-t border-steel-850 hover:bg-steel-850/50">
                  <td className="px-2 py-3">
                    <div className="font-semibold">{t.symbol}</div>
                    <div className="text-xs text-dark-100">{t.name}</div>
                  </td>
                  <td className="px-2 py-3 text-dark-100">{t.category}</td>
                  <td className="px-2 py-3 text-right tabular-nums">{pct(t.roundTripLossBps)}</td>
                  <td className="px-2 py-3">
                    <AddressCell address={t.address} />
                  </td>
                  <td className="px-2 py-3 text-right text-dark-100 whitespace-nowrap">{utcDate(t.checkedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-2">
          {visible.map(t => (
            <div key={t.address} className="rounded-xl bg-steel-850 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{t.symbol}</div>
                  <div className="text-xs text-dark-100 truncate">{t.name}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-dark-100">
                <AddressCell address={t.address} />
                <span>Round trip {pct(t.roundTripLossBps)}</span>
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="py-10 text-center text-dark-100">
            {isLoading
              ? 'Loading tokens…'
              : isError
                ? 'Could not load the token list. Please try again later.'
                : query
                  ? `No tokens match “${query}”.`
                  : 'No tokens in this list yet.'}
          </p>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs text-dark-100">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          Round-trip cost: buy {data?.refEth ?? '0.1'} ETH worth of the token and sell it straight back through Uniswap
          (pool fees and price impact). Liquidity changes over time and the list is re-checked regularly
          {data?.updatedAt && `, last on ${utcDate(data.updatedAt)}`}. This list is not investment advice. Missing a
          token? Ask us from the vault creation page.
        </span>
      </p>
    </div>
  );
};

export const Route = createFileRoute('/supported-tokens')({
  component: SupportedTokensPage,
});
