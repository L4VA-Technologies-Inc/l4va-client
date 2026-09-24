import { PieChart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { VAULT_ARCHETYPE_META } from '@/components/vaults/index/indexVault.utils';

/**
 * Vault archetype label. Standard vaults render nothing — only archetypes that
 * behave differently from the default acquire/contribute flow get a badge.
 *
 * `banner` sits under the vault name on the profile; `chip` fits on cards.
 */
export const VaultTypeBadge = ({ vault, variant = 'chip', className = '' }) => {
  const meta = VAULT_ARCHETYPE_META[vault?.vaultArchetype];
  if (!meta) return null;

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-3 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2',
          className
        )}
      >
        <PieChart className="h-5 w-5 flex-shrink-0 text-orange-500" aria-hidden />
        <div className="min-w-0">
          <p className="font-russo text-sm uppercase leading-tight text-white">{meta.label}</p>
          <p className="text-xs text-dark-100">{meta.description}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      title={`${meta.label}: ${meta.description}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm',
        className
      )}
    >
      <PieChart className="h-3.5 w-3.5 text-orange-500" aria-hidden />
      {meta.shortLabel}
    </span>
  );
};
