import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Database,
  Info,
  PlayCircle,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { Pagination } from '@/components/shared/Pagination';
import { PRIZES } from '@/components/compete/competeConfig';
import { CompetitionApiProvider } from '@/services/api/competition';

const PAGE_SIZE = 8;
const DAY = 24 * 60 * 60 * 1000;
const QUALIFY_MS = 7 * DAY;

const TABS = [
  { key: 'tokens', label: 'Top Tokens', icon: Database },
  { key: 'portfolios', label: 'Portfolios', icon: BarChart3 },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'creative', label: 'Creative', icon: Sparkles },
];

const PRIZE_ICONS = { token: Database, portfolio: BarChart3, community: Users, creative: Sparkles };

const usd = n => `$${Math.round(n).toLocaleString('en-US')}`;
const pct = n => `${n >= 0 ? '+' : ''}${Number(n).toFixed(1)}%`;
const utcDate = d =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) +
  ', ' +
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) +
  ' UTC';

const remaining = enteredAt => {
  const left = new Date(enteredAt).getTime() + QUALIFY_MS - Date.now();
  if (left <= 0) return null;
  const days = Math.floor(left / DAY);
  const hours = Math.floor((left % DAY) / (60 * 60 * 1000));
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
};

const StatusBadge = ({ row }) => {
  if (row.status === 'review') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs text-yellow-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Under Review
      </span>
    );
  }
  if (row.status === 'qualifying') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-steel-750 px-2.5 py-1 text-xs text-dark-100">
        <Clock className="h-3.5 w-3.5" /> Qualifying · {remaining(row.enteredAt) ?? 'finalizing'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs text-orange-500">
      Qualified <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  );
};

const RankCell = ({ rank }) => (
  <span className="inline-flex items-center gap-1.5 font-semibold">
    {rank <= 3 && (
      <Trophy
        className={clsx('h-4 w-4', rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600')}
      />
    )}
    {rank}
  </span>
);

const TokenCell = ({ row }) => (
  <a
    href={`/vaults/${row.vaultId}`}
    title={row.name}
    className="flex items-center gap-3 min-w-0 max-w-[220px] hover:text-orange-500"
  >
    {row.imageUrl ? (
      <img src={row.imageUrl} alt={row.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
    ) : (
      <div className="h-8 w-8 shrink-0 rounded-lg bg-steel-750 flex items-center justify-center text-[10px] font-bold text-orange-500">
        {(row.symbol || row.name || '?').slice(0, 2)}
      </div>
    )}
    <div className="min-w-0 leading-tight">
      <div className="font-semibold truncate">{row.symbol || row.name}</div>
      <div className="text-dark-100 text-xs truncate">{row.name}</div>
    </div>
  </a>
);

const shareRow = (row, rank) => {
  const text = `${row.name}${row.symbol ? ` ($${row.symbol})` : ''} is #${rank} in the L4VA Creator Challenge`;
  const url = `${window.location.origin}/vaults/${row.vaultId}`;
  window.open(
    `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank',
    'noopener,noreferrer'
  );
};

const ShareButton = ({ row, rank }) => (
  <button
    type="button"
    aria-label={`Share ${row.name} on X`}
    className="rounded-full p-2 text-dark-100 hover:bg-steel-750 hover:text-white transition-colors"
    onClick={() => shareRow(row, rank)}
  >
    <Share2 className="h-4 w-4" />
  </button>
);

/** Performance tabs: qualifying return is only final after 7 days, before that it is provisional. */
const returnCell = (row, value) =>
  row.status === 'qualified' ? (
    <span className="font-semibold text-orange-500">{pct(value)}</span>
  ) : (
    <span className="text-dark-100" title="Provisional until the 7-day window completes">
      {pct(value)}*
    </span>
  );

const creatorCell = row => <span className="text-dark-100">{row.creator ? `@${row.creator}` : '—'}</span>;

const performanceColumns = ({ qualifyingKey, totalKey, qualifyingHint }) => [
  { label: '#', cell: (_, rank) => <RankCell rank={rank} /> },
  { label: 'Token / Vault', cell: row => <TokenCell row={row} /> },
  { label: 'Creator', cell: creatorCell },
  { label: 'Return (qualifying)', hint: qualifyingHint, cell: row => returnCell(row, row[qualifyingKey]) },
  { label: 'Return (total)', hint: 'Since entry, informational', cell: row => pct(row[totalKey]) },
  { label: 'Vault value', cell: row => usd(row.value) },
  { label: 'Holders', cell: row => row.holders ?? '—' },
  { label: 'Status', cell: row => <StatusBadge row={row} /> },
];

const COLUMNS = {
  tokens: performanceColumns({
    qualifyingKey: 'qualifyingReturn',
    totalKey: 'totalReturn',
    qualifyingHint: '7-day average token price vs entry price',
  }),
  portfolios: performanceColumns({
    qualifyingKey: 'qualifyingValueReturn',
    totalKey: 'totalValueReturn',
    qualifyingHint: '7-day average vault NAV vs NAV at entry',
  }),
};

const Leaderboard = ({ data, isLoading }) => {
  const [tab, setTab] = useState('tokens');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const isJudged = tab === 'community' || tab === 'creative';
  const source = useMemo(() => (isJudged ? [] : (data?.[tab] ?? [])), [data, tab, isJudged]);
  const columns = COLUMNS[tab];

  // Rank comes from the full list, so searching never renumbers entries.
  const ranked = useMemo(() => source.map((row, i) => ({ row, rank: i + 1 })), [source]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter(({ row }) => [row.name, row.symbol, row.creator].some(v => v?.toLowerCase().includes(q)));
  }, [ranked, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="rounded-2xl bg-steel-950 border border-steel-850 p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-steel-850 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={clsx(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === key ? 'bg-steel-750 text-orange-500' : 'text-white hover:text-orange-500'
              )}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        <label className="relative lg:ml-auto lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-100" />
          <input
            value={query}
            placeholder="Search vault, symbol or creator"
            className="w-full rounded-lg bg-steel-850 border border-steel-750 py-2 pl-9 pr-3 text-sm placeholder:text-dark-100 focus:outline-none focus:border-orange-500"
            onChange={e => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      {isJudged ? (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-orange-500" />
          <p className="font-semibold">
            {tab === 'community' ? 'Best Community' : 'Most Creative'} is decided by the judges
          </p>
          <p className="mt-1 text-sm text-dark-100">Winners are announced after the competition ends.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-dark-100">
                  {columns.map(col => (
                    <th key={col.label} className="px-2 py-2 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-1" title={col.hint}>
                        {col.label}
                        {col.hint && <Info className="h-3 w-3" />}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map(({ row, rank }) => (
                  <tr key={row.vaultId} className="border-t border-steel-850 hover:bg-steel-850/50">
                    {columns.map(col => (
                      <td key={col.label} className="px-2 py-3 whitespace-nowrap">
                        {col.cell(row, rank)}
                      </td>
                    ))}
                    <td className="px-1 py-3 text-right">
                      <ShareButton row={row} rank={rank} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {visible.map(({ row, rank }) => (
              <div key={row.vaultId} className="rounded-xl bg-steel-850 p-3">
                <div className="flex items-center gap-3">
                  <RankCell rank={rank} />
                  <TokenCell row={row} />
                  <div className="ml-auto">
                    <ShareButton row={row} rank={rank} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  {creatorCell(row)}
                  {returnCell(row, tab === 'portfolios' ? row.qualifyingValueReturn : row.qualifyingReturn)}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-dark-100">
                  <span>
                    {usd(row.value)}
                    {row.holders != null && ` · ${row.holders} holders`}
                  </span>
                  <StatusBadge row={row} />
                </div>
              </div>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="py-10 text-center text-dark-100">
              {isLoading
                ? 'Loading leaderboard…'
                : query
                  ? `No vaults match “${query}”.`
                  : 'No entries yet — launch a vault to be the first.'}
            </p>
          )}

          <Pagination className="mt-4" currentPage={page} totalPages={totalPages} onPageChange={setPage} />

          <p className="mt-3 text-xs text-dark-100">
            * Provisional until the entry completes its 7-day qualifying window.
            {data?.updatedAt && ` Updated hourly · last ${utcDate(new Date(data.updatedAt))}.`}
          </p>
        </>
      )}
    </section>
  );
};

const Timeline = ({ season }) => {
  if (!season) return null;
  const now = Date.now();
  const start = new Date(season.start);
  const end = new Date(season.end);
  const dayOf = d => Math.floor((d.getTime() - start.getTime()) / DAY) + 1;
  const steps = [
    { at: start, title: 'Competition Live', text: 'Create and enter vaults anytime' },
    {
      at: new Date(season.entryCutoff),
      title: 'Performance Entry Closes',
      text: 'Last day to enter for performance awards (7-day minimum)',
    },
    season.promoEnd && {
      at: new Date(season.promoEnd),
      title: 'Launch Special Ends',
      text: 'Normal L4VA fees and 1X rewards resume',
    },
    { at: end, title: 'Competition Ends', text: 'Winners announced after review' },
  ].filter(Boolean);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now) / DAY));

  return (
    <section className="rounded-2xl bg-steel-950 border border-steel-850 p-5">
      <h3 className="flex items-center gap-2 font-semibold text-lg mb-1">
        <CalendarDays className="h-5 w-5" /> Competition Timeline
      </h3>
      <p className="text-xs text-dark-100 mb-5">{daysLeft} days left · all times UTC</p>
      <ol className="relative border-l border-steel-750 ml-1.5 space-y-5">
        {steps.map(step => {
          const done = step.at.getTime() <= now;
          return (
            <li key={step.title} className="pl-5">
              <span
                className={clsx(
                  'absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2',
                  done ? 'bg-orange-500 border-orange-500' : 'bg-steel-950 border-steel-750'
                )}
              />
              <p className={clsx('text-sm font-semibold', done && 'text-orange-500')}>
                Day {dayOf(step.at)} · {utcDate(step.at)}
              </p>
              <p className="text-sm">{step.title}</p>
              <p className="text-xs text-dark-100">{step.text}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

const CompetePage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['competition-leaderboard'],
    queryFn: async () => (await CompetitionApiProvider.getLeaderboard()).data,
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });
  const season = data?.season;

  return (
    <div className="container mx-auto px-4 xl:px-0 py-8 text-primary-text space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-steel-950 border border-steel-850 px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
          L4VA Protocol | Robinhood Chain
        </p>
        <h1 className="mt-2 font-russo text-4xl sm:text-5xl">
          Creator <span className="text-orange-gradient">Challenge</span>
        </h1>
        <p className="mt-3 text-lg sm:text-xl">Dream it. Launch it. Own the market.</p>
        <p className="mt-1 text-dark-100">Create and own AI-powered vault tokens — compete for the top spot.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton size="lg" onClick={() => navigate({ to: '/create-ai' })}>
            Create Vault <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton size="lg" onClick={() => navigate({ to: '/create-ai' })}>
            Join Competition
          </SecondaryButton>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 text-dark-100 hover:text-white"
            onClick={() => navigate({ to: '/how-it-works' })}
          >
            <PlayCircle className="h-5 w-5" /> How it works
          </button>
        </div>
      </section>

      {/* Prize pool */}
      <section className="grid gap-3 lg:grid-cols-[auto_1fr] rounded-2xl bg-steel-950 border border-steel-850 p-4">
        <div className="lg:pr-6 lg:border-r border-steel-850">
          <p className="text-sm text-dark-100">Prize Pool</p>
          <p className="font-russo text-3xl">
            <span className="text-orange-gradient">$3,000</span> + 300,000 L4VA
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PRIZES.map(prize => {
            const Icon = PRIZE_ICONS[prize.icon];
            return (
              <div key={prize.key} className="flex items-center gap-3 rounded-xl bg-steel-850 p-3">
                <Icon className="h-6 w-6 shrink-0 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold">
                    {prize.title}
                    {prize.note && <span className="block text-[11px] font-normal text-dark-100">({prize.note})</span>}
                  </p>
                  <p className="text-sm text-orange-500">
                    {usd(prize.cash)} + {prize.l4va.toLocaleString('en-US')} L4VA
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promotion */}
      <section className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-5 py-4">
        <p className="flex items-center gap-2 font-russo text-lg">
          <Zap className="h-5 w-5 text-orange-500" /> 4-Week Launch Special
        </p>
        <p>
          <span className="font-russo text-2xl text-orange-500">0%</span> L4VA protocol fees
        </p>
        <p>
          <span className="font-russo text-2xl text-orange-500">2X</span> L4VA rewards for creators & acquirers
        </p>
        {season?.promoEnd && (
          <p className="md:ml-auto text-xs text-dark-100">Until {utcDate(new Date(season.promoEnd))}</p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Leaderboard data={data} isLoading={isLoading} />
          <p className="mt-3 flex items-start gap-2 text-xs text-dark-100">
            <Info className="h-4 w-4 shrink-0" />
            L4VA protocol fees are 0% during the launch special. The 0.25% Uniswap API fee still applies to applicable
            transactions; network gas and other third-party fees may also apply.
          </p>
        </div>
        <div className="space-y-4">
          <Timeline season={season} />
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-orange-500/40 bg-steel-950 px-5 py-4 text-left hover:bg-steel-850 transition-colors"
            onClick={() => toast('Rules page is not written yet')}
          >
            <ShieldCheck className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">Rules & Anti-Manipulation Requirements</span>
            <ArrowRight className="ml-auto h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/compete')({
  component: CompetePage,
});
