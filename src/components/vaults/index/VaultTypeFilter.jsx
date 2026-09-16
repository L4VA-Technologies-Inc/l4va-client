import { cn } from '@/lib/utils';
import { VAULT_ARCHETYPES } from '@/components/vaults/index/indexVault.utils';

const OPTIONS = [
  { value: undefined, label: 'All types' },
  { value: VAULT_ARCHETYPES.STANDARD, label: 'Standard' },
  { value: VAULT_ARCHETYPES.INDEX_WEIGHTED, label: 'Index weighted' },
];

/** Segmented control that narrows the vault list to one archetype. */
export const VaultTypeFilter = ({ value, onChange, className = '' }) => (
  <div
    role="radiogroup"
    aria-label="Vault type"
    className={cn('inline-flex w-full sm:w-auto rounded-lg border border-steel-750 bg-steel-850 p-1', className)}
  >
    {OPTIONS.map(option => {
      const selected = value === option.value;
      return (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 sm:flex-none rounded-md px-4 py-2 text-sm font-medium transition-colors',
            selected ? 'bg-orange-500 text-black' : 'text-dark-100 hover:text-white'
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
