import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';

import { VAULT_STATUSES } from '@/components/vaults/constants/vaults.constants';
import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
import { ChainBadge } from '@/components/shared/ChainBadge';
import L4vaIcon from '@/components/shared/L4vaIcon';
import { VaultTypeBadge } from '@/components/vaults/index/VaultTypeBadge';
import { useCurrency } from '@/hooks/useCurrency';
import { clickableProps } from '@/utils/a11y';
import { formatCompactNumber, formatVaultStatus } from '@/utils/core.utils';

// Stage as a status dot + plain text: only live vaults get colour, finished ones fade out.
const stageTone = status => {
  const s = String(status || '');
  if (s.startsWith('acquire') || s === 'contribution' || s === 'published')
    return { dot: 'bg-emerald-400', text: 'text-white' };
  if (s === 'locked' || s.startsWith('gov')) return { dot: 'bg-sky-400', text: 'text-white' };
  return { dot: 'bg-dark-100/60', text: 'text-dark-100' };
};

const isLive = status => String(status || '').startsWith('acquire') || status === 'contribution';

const relativeAge = iso => {
  const t = Date.parse(iso);
  if (!t) return '—';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const StageBadge = ({ status }) => {
  const tone = stageTone(status);
  return (
    <span className={clsx('inline-flex items-center gap-2 whitespace-nowrap text-sm', tone.text)}>
      <span className={clsx('h-2 w-2 rounded-full', tone.dot)} />
      {formatVaultStatus(status)}
    </span>
  );
};

const VaultAvatar = ({ vault }) => (
  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-steel-750">
    {vault.vaultImage ? (
      <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" src={vault.vaultImage} />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <L4vaIcon className="h-5 w-5 text-white" />
      </div>
    )}
  </div>
);

const TimeCell = ({ vault }) =>
  isLive(vault.vaultStatus) && vault.phaseEndTime && Date.parse(vault.phaseEndTime) > Date.now() ? (
    <VaultCountdown
      className="text-sm font-normal"
      color="yellow"
      countdownValue={new Date(vault.phaseEndTime).getTime()}
    />
  ) : (
    <span className="text-sm text-dark-100">{relativeAge(vault.phaseStartTime)}</span>
  );

export const VaultTable = ({ vaults }) => {
  const navigate = useNavigate();
  const { currencySymbol, pickByCurrency } = useCurrency();

  const tvl = vault =>
    vault.vaultStatus !== VAULT_STATUSES.BURNED && vault.totalValueAda && vault.totalValueUsd
      ? `${currencySymbol}${formatCompactNumber(
          pickByCurrency({ ada: vault.totalValueAda, usd: vault.totalValueUsd, eth: vault.totalValueEth ?? 0 })
        )}`
      : '—';

  const open = vault => {
    navigate({ to: `/vaults/${vault.id}`, search: isLive(vault.vaultStatus) ? { tab: 'Token' } : undefined });
  };

  const ticker = vault => (vault.vaultTokenTicker ? `$${vault.vaultTokenTicker}` : '—');

  return (
    <>
      {/* Mobile: one compact row per vault. */}
      <div className="divide-y divide-steel-750 overflow-hidden rounded-2xl border border-steel-750 bg-steel-850 md:hidden">
        {vaults.map(vault => (
          <div
            key={vault.id}
            {...clickableProps(() => open(vault), { role: 'link' })}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors active:bg-steel-800/80"
          >
            <VaultAvatar vault={vault} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-white">{vault.name || 'No name'}</div>
              <div className="truncate text-xs uppercase text-dark-100">{ticker(vault)}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StageBadge status={vault.vaultStatus} />
              <span className="text-xs text-white tabular-nums">{tvl(vault)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table. */}
      <div className="hidden overflow-hidden rounded-2xl border border-steel-750 md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-steel-750 bg-steel-850 text-xs uppercase tracking-wide text-dark-100">
              <th className="px-4 py-3 font-medium">Vault</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 text-right font-medium">TVL</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Ends / Age</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map(vault => (
              <tr
                key={vault.id}
                {...clickableProps(() => open(vault), { role: 'link' })}
                className="cursor-pointer border-b border-steel-750 bg-steel-850 transition-colors last:border-b-0 hover:bg-steel-800/80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange-500"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <VaultAvatar vault={vault} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="max-w-[260px] truncate font-medium text-white">{vault.name || 'No name'}</span>
                        <ChainBadge chainType={vault.chainType} className="bg-steel-750 p-1" />
                        <VaultTypeBadge vault={vault} className="bg-steel-750" />
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-dark-100">
                        <span className="shrink-0 uppercase">{ticker(vault)}</span>
                        {vault.description ? (
                          <span className="max-w-[320px] truncate">· {vault.description}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StageBadge status={vault.vaultStatus} />
                </td>
                <td className="px-4 py-3 text-right text-sm text-white tabular-nums">{tvl(vault)}</td>
                <td className="px-4 py-3 text-sm capitalize text-dark-100">
                  {String(vault.privacy || '—').replace('-', ' ')}
                </td>
                <td className="px-4 py-3">
                  <TimeCell vault={vault} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
