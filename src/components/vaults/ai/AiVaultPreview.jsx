import { useEffect, useRef, useState } from 'react';
import { addMilliseconds } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ListChecks, Plus, RotateCcw, Sparkles } from 'lucide-react';

import { Chip } from '@/components/shared/Chip';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaIntervalPicker } from '@/components/shared/LavaIntervalPicker';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import {
  MIN_ACQUIRE_WINDOW_DURATION_MS,
  MIN_CONTRIBUTION_DURATION_MS,
  MIN_SUPPLY,
  MAX_SUPPLY,
  TERMINATION_TYPE_OPTIONS,
  VAULT_PRIVACY_OPTIONS,
  VAULT_PRIVACY_TYPES,
  VAULT_TAGS_OPTIONS,
  VAULT_VALUE_METHOD_OPTIONS,
  vaultSchema,
} from '@/components/vaults/constants/vaults.constants';
import { useCurrency } from '@/hooks/useCurrency';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useModalControls } from '@/lib/modals/modal.context';
import { useNetwork } from '@/hooks/useNetwork';

const percent = value => (value === null || value === undefined ? '—' : `${value}%`);
const isEmptyValue = value =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length);

const CONTRIBUTION_OPENS_OPTIONS = [
  { value: 'upon-vault-launch', label: 'Upon vault launch' },
  { value: 'custom', label: 'Custom date' },
];

const ACQUIRE_OPENS_OPTIONS = [
  { value: 'upon-asset-window-closing', label: 'Upon contribution closing' },
  { value: 'custom', label: 'Custom date' },
];

const YES_NO_OPTIONS = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

// The fields that actually gate launch — used only to compute the completion header, never the
// launch button itself (that stays on the full schema via vaultSchema.isValidSync).
const BASE_REQUIRED_KEYS = [
  'name',
  'vaultImage',
  'privacy',
  'valueMethod',
  'ftTokenSupply',
  'terminationType',
  'creationThreshold',
  'cosigningThreshold',
  'executionThreshold',
  'tokensForAcquires',
  'acquireReserve',
  'liquidityPoolContribution',
];

const SECTIONS = [
  {
    id: 'identity',
    label: 'Identity',
    fields: ['name', 'vaultTokenTicker', 'description', 'tokenDescription', 'tags', 'socialLinks', 'vaultImage'],
  },
  {
    id: 'assets',
    label: 'Assets',
    fields: [
      'assetsWhitelist',
      'contributorWhitelist',
      'acquirerWhitelist',
      'acquireReserve',
      'isAcquireOnly',
      'allowAcquireExpansion',
    ],
  },
  {
    id: 'launch',
    label: 'Launch',
    fields: [
      'privacy',
      'valueMethod',
      'contributionDuration',
      'contributionOpenWindowType',
      'acquireWindowDuration',
      'acquireOpenWindowType',
      'minAcquireThreshold',
    ],
  },
  {
    id: 'tokenomics',
    label: 'Tokenomics',
    fields: ['ftTokenSupply', 'tokensForAcquires', 'liquidityPoolContribution'],
  },
  {
    id: 'governance',
    label: 'Governance',
    fields: ['creationThreshold', 'cosigningThreshold', 'executionThreshold', 'terminationType'],
  },
];

const Row = ({ label, value, isAiSet, isChanged, isEmptyAction, actionLabel, onAction }) => (
  <div
    className={`group flex items-start justify-between gap-4 py-2.5 border-b border-steel-800/70 last:border-b-0 rounded-md px-2 -mx-2 transition-colors duration-700 ${isChanged ? 'bg-orange-500/15' : ''}`}
  >
    <span className="pt-0.5 text-xs uppercase tracking-wide text-dark-100 font-russo">{label}</span>
    {isEmptyAction && actionLabel ? (
      <button
        className="flex items-center gap-1.5 text-sm transition-[color,transform] duration-150 ease-out active:scale-[0.97]"
        type="button"
        onClick={onAction}
      >
        <span className="text-dark-100">Not set</span>
        <span className="font-medium text-orange-300 underline decoration-orange-500/40 underline-offset-2 hover:text-orange-200">
          {actionLabel}
        </span>
      </button>
    ) : (
      <span className="flex min-w-0 items-center justify-end gap-1.5 text-right text-sm text-white">
        <span className="break-words">{value}</span>
        {isAiSet && (
          <span
            className="flex shrink-0 items-center opacity-40 transition-opacity duration-150 group-hover:opacity-100"
            title="AI suggested this value — ask the assistant to change it, or edit manually"
          >
            <Sparkles className="h-3 w-3 text-orange-400/80" />
          </span>
        )}
      </span>
    )}
  </div>
);

const EditableRow = ({
  label,
  value,
  displayValue,
  isAiSet,
  isChanged,
  isEmptyAction,
  actionLabel,
  onAction,
  onCommit,
  multiline = false,
  maxLength,
  sanitize,
  suffix,
  placeholder = 'Type here',
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? '');
  }, [editing, value]);

  useEffect(() => {
    if (!editing) return undefined;
    const node = inputRef.current;
    if (!node) return undefined;
    node.focus();
    if (typeof node.setSelectionRange === 'function') {
      const length = node.value.length;
      node.setSelectionRange(length, length);
    }
    return undefined;
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = (draft ?? '').trim();
    if (next === (value ?? '').trim()) return;
    onCommit(next);
  };

  const cancel = () => {
    setDraft(value ?? '');
    setEditing(false);
  };

  const handleChange = event => {
    const next = sanitize ? sanitize(event.target.value) : event.target.value;
    setDraft(next);
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commit();
    }
  };

  const fieldClassName =
    'w-full min-w-0 bg-transparent text-right text-sm text-white caret-orange-400 outline-none border-b border-orange-400/70 py-0.5 transition-[border-color] duration-150 placeholder:text-dark-100';

  return (
    <div
      className={`group flex items-start justify-between gap-4 py-2.5 border-b border-steel-800/70 last:border-b-0 rounded-md px-2 -mx-2 transition-colors duration-700 ${isChanged ? 'bg-orange-500/15' : ''}`}
    >
      <span className="pt-0.5 text-xs uppercase tracking-wide text-dark-100 font-russo shrink-0">{label}</span>
      {editing ? (
        <div className="min-w-0 flex-1">
          {multiline ? (
            <textarea
              ref={inputRef}
              className={`${fieldClassName} min-h-[4.5rem] resize-none leading-5`}
              maxLength={maxLength}
              placeholder={placeholder}
              rows={3}
              value={draft}
              onBlur={commit}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="relative">
              <input
                ref={inputRef}
                className={`${fieldClassName} ${suffix ? 'pr-5' : ''}`}
                maxLength={maxLength}
                placeholder={placeholder}
                type="text"
                value={draft}
                onBlur={commit}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              {suffix ? (
                <span className="pointer-events-none absolute right-0 top-0.5 text-sm text-dark-100">{suffix}</span>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-start justify-end gap-2">
          <button
            className="min-w-0 text-right text-sm text-white break-words transition-[color,transform] duration-150 ease-out hover:text-orange-200 active:scale-[0.99]"
            title="Click to edit"
            type="button"
            onClick={() => setEditing(true)}
          >
            {displayValue || <span className="text-dark-100">Not set</span>}
          </button>
          {isEmptyAction && actionLabel ? (
            <button
              className="shrink-0 text-sm font-medium text-orange-300 underline decoration-orange-500/40 underline-offset-2 transition-[color,transform] duration-150 ease-out hover:text-orange-200 active:scale-[0.97]"
              type="button"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : (
            isAiSet && (
              <span
                className="flex shrink-0 items-center pt-0.5 opacity-40 transition-opacity duration-150 group-hover:opacity-100"
                title="AI suggested this value — click to edit, or ask the assistant"
              >
                <Sparkles className="h-3 w-3 text-orange-400/80" />
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};

const compactControlClass =
  'inline-flex h-7 items-center justify-center gap-1 rounded-md border border-steel-750 bg-steel-850 px-2 text-xs leading-none text-white';

const FieldShell = ({ label, isAiSet, isChanged, children }) => (
  <div
    className={`group flex items-center justify-between gap-3 py-2 border-b border-steel-800/70 last:border-b-0 rounded-md px-2 -mx-2 transition-colors duration-700 ${isChanged ? 'bg-orange-500/15' : ''}`}
  >
    <span className="text-xs uppercase tracking-wide text-dark-100 font-russo shrink-0">{label}</span>
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
      {children}
      {isAiSet && (
        <span
          className="flex shrink-0 items-center opacity-40 transition-opacity duration-150 group-hover:opacity-100"
          title="AI suggested this value — click to change it"
        >
          <Sparkles className="h-3 w-3 text-orange-400/80" />
        </span>
      )}
    </div>
  </div>
);

const SelectRow = ({ label, value, options, isAiSet, isChanged, onCommit }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);

  return (
    <FieldShell isAiSet={isAiSet} isChanged={isChanged} label={label}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`${compactControlClass} max-w-full transition-[color,transform] duration-150 ease-out hover:text-orange-200 active:scale-[0.99]`}
            type="button"
          >
            <span className="min-w-0 truncate">
              {selected?.label || <span className="text-dark-100">Not set</span>}
            </span>
            <ChevronDown
              className={`h-3 w-3 shrink-0 text-dark-100 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="z-50 min-w-[200px] border-steel-750 bg-steel-850 p-1 shadow-xl"
          sideOffset={6}
        >
          {options.map(option => (
            <button
              key={String(option.value)}
              className={`flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-100 ${
                option.value === value ? 'text-orange-300' : 'text-white hover:bg-white/5'
              }`}
              type="button"
              onClick={() => {
                onCommit(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
};

const DurationRow = ({ label, value, isAiSet, isChanged, minMs, onCommit }) => (
  <FieldShell isAiSet={isAiSet} isChanged={isChanged} label={label}>
    <div className="w-auto [&_div]:mt-0 [&_button]:h-7 [&_button]:min-h-7 [&_button]:w-auto [&_button]:justify-center [&_button]:px-2 [&_button]:py-0 [&_button]:text-xs [&_span]:text-xs [&_svg]:mr-1 [&_svg]:h-3 [&_svg]:w-3">
      <LavaIntervalPicker margin={0} minMs={minMs} value={value} variant="steel" onChange={onCommit} />
    </div>
  </FieldShell>
);

const DateRow = ({ label, value, isAiSet, isChanged, minDate, onCommit }) => (
  <div
    className={`rounded-md px-2 -mx-2 py-2.5 border-b border-steel-800/70 last:border-b-0 transition-colors duration-700 ${isChanged ? 'bg-orange-500/15' : ''}`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-dark-100 font-russo">{label}</span>
      {isAiSet && (
        <span
          className="flex shrink-0 items-center opacity-40"
          title="AI suggested this value — click to change it"
        >
          <Sparkles className="h-3 w-3 text-orange-400/80" />
        </span>
      )}
    </div>
    <div className="mt-2 w-full min-w-0 [&_button]:h-auto [&_button]:min-h-10 [&_button]:min-w-0 [&_button]:shrink [&_button]:whitespace-normal">
      <LavaDatePicker minDate={minDate} value={value} variant="steel" onChange={onCommit} />
    </div>
  </div>
);

const TagsRow = ({ value = [], isAiSet, isChanged, isEmptyAction, onAction, onCommit }) => {
  const [open, setOpen] = useState(false);
  const selected = value || [];
  const available = VAULT_TAGS_OPTIONS.filter(option => !selected.includes(option.value));

  return (
    <FieldShell isAiSet={isAiSet} isChanged={isChanged} label="Tags">
      <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
        {selected.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {selected.map(tag => {
              const option = VAULT_TAGS_OPTIONS.find(item => item.value === tag);
              return (
                <Chip
                  key={tag}
                  label={option?.label || tag}
                  selected
                  size="sm"
                  value={tag}
                  variant="removable"
                  onRemove={next => onCommit(selected.filter(item => item !== next))}
                />
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          {available.length > 0 && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-orange-300 underline decoration-orange-500/40 underline-offset-2 transition-[color,transform] duration-150 ease-out hover:text-orange-200 active:scale-[0.97]"
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add tag
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="z-50 max-h-64 min-w-[200px] overflow-y-auto border-steel-750 bg-steel-850 p-1 shadow-xl"
                sideOffset={6}
              >
                {available.map(option => (
                  <button
                    key={option.value}
                    className="flex w-full rounded-md px-3 py-2 text-left text-sm text-white transition-colors duration-100 hover:bg-white/5"
                    type="button"
                    onClick={() => {
                      onCommit([...selected, option.value]);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
          {isEmptyAction && onAction ? (
            <button
              className="text-sm font-medium text-orange-300 underline decoration-orange-500/40 underline-offset-2 transition-[color,transform] duration-150 ease-out hover:text-orange-200 active:scale-[0.97]"
              type="button"
              onClick={onAction}
            >
              Generate
            </button>
          ) : null}
        </div>
      </div>
    </FieldShell>
  );
};

const ManageList = ({ label, count, max, emptyHint, names = [], onManage, manageLabel }) => (
  <div className="border-b border-steel-800/70 pb-3 last:border-b-0">
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark-100">{label}</span>
      <span className="text-sm text-dark-100">
        {count}
        {max ? `/${max}` : ''}
      </span>
    </div>
    {names.length > 0 ? (
      <ul className="mt-3 space-y-2">
        {names.slice(0, 5).map((name, index) => (
          <li key={`${name}-${index}`} className="truncate text-sm text-white">
            {name}
          </li>
        ))}
        {names.length > 5 ? <li className="text-sm text-dark-100">+{names.length - 5} more</li> : null}
      </ul>
    ) : (
      <p className="mt-1 text-sm text-dark-100">{emptyHint}</p>
    )}
    <SecondaryButton className="mt-3 w-full" onClick={onManage}>
      <ListChecks className="h-4 w-4" />
      {manageLabel}
    </SecondaryButton>
  </div>
);

const filledWallets = list => (list || []).filter(item => item?.walletAddress);

const Section = ({ id, label, isOpen, onToggle, children }) => (
  <div className="border-b border-steel-800 last:border-b-0">
    <button
      className="flex w-full items-center justify-between py-3 text-left transition-colors duration-150 hover:text-white"
      type="button"
      onClick={() => onToggle(id)}
    >
      <span className="text-xs uppercase tracking-wide text-dark-100 font-russo">{label}</span>
      <ChevronDown
        className={`h-4 w-4 text-dark-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        >
          <div className="pb-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const AiVaultPreview = ({
  vault,
  aiFields,
  missingFields = [],
  onLaunch,
  isLaunching,
  onReset,
  onUpdateVault,
  onSendMessage,
  onGenerateImageRequest,
}) => {
  const { currencyLabel } = useCurrency();
  const { isRobinHood } = useNetwork();
  const { openModal } = useModalControls();
  const previousVault = useRef(vault);
  const [changedFields, setChangedFields] = useState(() => new Set());
  const [openSections, setOpenSections] = useState(() => {
    const firstIncomplete = SECTIONS.find(section => section.fields.some(field => missingFields.includes(field)));
    return new Set([firstIncomplete?.id ?? SECTIONS[0].id]);
  });

  useEffect(() => {
    const prev = previousVault.current;
    const next = new Set();
    Object.keys(vault || {}).forEach(key => {
      if (JSON.stringify(prev?.[key]) !== JSON.stringify(vault?.[key])) {
        next.add(key);
      }
    });
    previousVault.current = vault;
    if (!next.size) return undefined;
    setChangedFields(next);

    // Surface exactly what the AI just touched, so the user never has to go hunting for it.
    const touchedSections = SECTIONS.filter(section => section.fields.some(field => next.has(field))).map(
      section => section.id
    );
    if (touchedSections.length) {
      setOpenSections(prevOpen => new Set([...prevOpen, ...touchedSections]));
    }

    const timeout = setTimeout(() => setChangedFields(new Set()), 1000);
    return () => clearTimeout(timeout);
  }, [vault]);

  const toggleSection = id => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAiSet = field => aiFields.includes(field);
  const isChanged = field => changedFields.has(field);
  // Mirrors the manual form's own gate (same schema powers "Confirm & launch" there) instead of
  // trusting the assistant's self-reported status, which can lag behind an already-valid draft.
  const canOpenInForm = vaultSchema.isValidSync(vault);
  const whitelistAssets = (vault.assetsWhitelist || []).filter(item => item?.policyId);
  const whitelistCount = whitelistAssets.length;

  const requiredKeys = [
    ...BASE_REQUIRED_KEYS,
    ...(vault.isAcquireOnly ? [] : ['contributionDuration', 'contributionOpenWindowType', 'assetsWhitelist']),
    ...(Number(vault.tokensForAcquires) === 0 ? [] : ['acquireWindowDuration', 'acquireOpenWindowType']),
    ...(vault.privacy === VAULT_PRIVACY_TYPES.PRIVATE && vault.valueMethod === 'lbe' ? ['contributorWhitelist'] : []),
    ...(vault.privacy === VAULT_PRIVACY_TYPES.PRIVATE ? ['acquirerWhitelist'] : []),
  ];
  // missingFields lags a beat behind on a brand-new draft (it is only computed once the first
  // assistant turn resolves), so before that lands fall back to raw emptiness — otherwise the
  // header would briefly claim "ready" while the button correctly still reads "Complete setup".
  const missingRequired = requiredKeys.filter(key => {
    const fieldMissing = missingFields.some(field => field === key || field.startsWith(`${key}[`));
    if (fieldMissing) return true;
    if (missingFields.length > 0 || canOpenInForm) return false;
    if (key === 'contributorWhitelist' || key === 'acquirerWhitelist') {
      return filledWallets(vault[key]).length === 0;
    }
    return isEmptyValue(vault[key]);
  });
  const completionPercent = requiredKeys.length
    ? Math.round(((requiredKeys.length - missingRequired.length) / requiredKeys.length) * 100)
    : 100;

  const requestIdentityGeneration = () => {
    onSendMessage?.('Please generate the vault name, ticker, description and tags now.');
  };

  const openWhitelistModal = () => {
    openModal('AiAssetWhitelistModal', {
      whitelist: vault.assetsWhitelist || [],
      setWhitelist: assets => onUpdateVault('assetsWhitelist', assets),
      isExpandable: vault.isExpandableAssetWhitelist,
      onExpandableChange: checked => onUpdateVault('isExpandableAssetWhitelist', checked),
    });
  };

  const openWalletWhitelistModal = ({ field, title, description, required }) => {
    openModal('AiWalletWhitelistModal', {
      title,
      description,
      label: title,
      required,
      whitelist: vault[field] || [],
      setWhitelist: next => onUpdateVault(field, next),
    });
  };

  const openSocialLinksModal = () => {
    openModal('AiSocialLinksModal', {
      socialLinks: vault.socialLinks || [],
      setSocialLinks: next => onUpdateVault('socialLinks', next),
    });
  };

  const privacyOptions = (isRobinHood
    ? VAULT_PRIVACY_OPTIONS.filter(option => option.name === VAULT_PRIVACY_TYPES.PUBLIC)
    : VAULT_PRIVACY_OPTIONS
  ).map(option => ({ value: option.name, label: option.label.replace(/ Vault$/i, '') }));

  const isPrivate = vault.privacy === VAULT_PRIVACY_TYPES.PRIVATE;
  const isSemiPrivate = vault.privacy === VAULT_PRIVACY_TYPES.SEMI_PRIVATE;
  const isAcquireOnly = vault.isAcquireOnly === true;
  const hasAcquireWindow = Number(vault.tokensForAcquires) !== 0;
  const showContributorWhitelist =
    (isPrivate && vault.valueMethod === 'lbe') || isSemiPrivate;
  const showAcquirerWhitelist = isPrivate || isSemiPrivate;
  const contributorWallets = filledWallets(vault.contributorWhitelist);
  const acquirerWallets = filledWallets(vault.acquirerWhitelist);
  const socialCount = (vault.socialLinks || []).filter(link => link?.url).length;
  const valueMethodOptions = VAULT_VALUE_METHOD_OPTIONS.map(option => ({
    value: option.name,
    label: option.label,
  }));
  const valuationCurrencyOptions = [
    ...(isRobinHood ? [] : [{ value: 'ADA', label: 'ADA' }]),
    { value: 'USD', label: 'USD' },
    ...(isRobinHood ? [{ value: 'ETH', label: 'ETH' }] : []),
  ];
  const acquireMinDate =
    vault.contributionOpenWindowType === 'custom' && vault.contributionOpenWindowTime
      ? addMilliseconds(new Date(vault.contributionOpenWindowTime), vault.contributionDuration || 0)
      : undefined;

  const commitNumber = (field, raw, { min = 0, max = 100, emptyValue = null, integer = false } = {}) => {
    if (raw === '') {
      onUpdateVault(field, emptyValue);
      return;
    }
    const parsed = Number(String(raw).replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(max, Math.max(min, parsed));
    onUpdateVault(field, integer ? Math.round(clamped) : clamped);
  };

  const sanitizeDecimal = next => {
    const cleaned = next.replace(/[^0-9.]/g, '');
    const [whole, ...rest] = cleaned.split('.');
    return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
  };

  return (
    <div className="rounded-2xl border border-steel-750 bg-steel-900 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-russo uppercase text-lg text-white">Vault draft</h2>
        <button
          className="text-dark-100 transition-[color,transform] duration-150 ease-out hover:text-white active:scale-90"
          title="Start over"
          type="button"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="uppercase tracking-wide text-dark-100 font-russo">{completionPercent}% complete</span>
          <span className="text-dark-100">
            {missingRequired.length === 0 ? 'Ready to launch' : `${missingRequired.length} left before launch`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-steel-800">
          <motion.div
            animate={{ width: `${completionPercent}%` }}
            className="h-full rounded-full bg-orange-gradient"
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
      </div>

      <div>
        <Section id="identity" isOpen={openSections.has('identity')} label="Identity" onToggle={toggleSection}>
          <EditableRow
            actionLabel="Generate"
            displayValue={vault.name}
            isAiSet={isAiSet('name')}
            isChanged={isChanged('name')}
            isEmptyAction={!vault.name}
            label="Name"
            maxLength={50}
            placeholder="Vault name"
            value={vault.name || ''}
            onAction={requestIdentityGeneration}
            onCommit={next => onUpdateVault('name', next)}
          />
          <EditableRow
            actionLabel="Generate"
            displayValue={vault.vaultTokenTicker}
            isAiSet={isAiSet('vaultTokenTicker')}
            isChanged={isChanged('vaultTokenTicker')}
            isEmptyAction={!vault.vaultTokenTicker}
            label="Ticker"
            maxLength={9}
            placeholder="TICKER"
            sanitize={next => next.replace(/[^A-Za-z0-9]/g, '').slice(0, 9)}
            value={vault.vaultTokenTicker || ''}
            onAction={requestIdentityGeneration}
            onCommit={next => onUpdateVault('vaultTokenTicker', next)}
          />
          <EditableRow
            multiline
            actionLabel="Generate"
            displayValue={vault.description}
            isAiSet={isAiSet('description')}
            isChanged={isChanged('description')}
            isEmptyAction={!vault.description}
            label="Description"
            maxLength={500}
            placeholder="Vault description"
            value={vault.description || ''}
            onAction={requestIdentityGeneration}
            onCommit={next => onUpdateVault('description', next)}
          />
          <EditableRow
            multiline
            actionLabel="Generate"
            displayValue={vault.tokenDescription}
            isAiSet={isAiSet('tokenDescription')}
            isChanged={isChanged('tokenDescription')}
            isEmptyAction={!vault.tokenDescription}
            label="Token description"
            maxLength={300}
            placeholder="Token description"
            value={vault.tokenDescription || ''}
            onAction={requestIdentityGeneration}
            onCommit={next => onUpdateVault('tokenDescription', next)}
          />
          <TagsRow
            isAiSet={isAiSet('tags')}
            isChanged={isChanged('tags')}
            isEmptyAction={!vault.tags?.length}
            value={vault.tags || []}
            onAction={requestIdentityGeneration}
            onCommit={next => onUpdateVault('tags', next)}
          />
          <ManageList
            count={socialCount}
            emptyHint="Optional. Add the same social profiles as in manual setup."
            label="Social links"
            manageLabel={socialCount > 0 ? 'Manage social links' : 'Add social links'}
            names={(vault.socialLinks || []).filter(link => link?.url).map(link => link.url)}
            onManage={openSocialLinksModal}
          />
          <Row
            actionLabel="Generate image"
            isChanged={isChanged('vaultImage')}
            isEmptyAction={!vault.vaultImage}
            label="Image"
            value={vault.vaultImage ? 'Added' : '—'}
            onAction={() => onGenerateImageRequest?.()}
          />
        </Section>

        <Section id="assets" isOpen={openSections.has('assets')} label="Assets" onToggle={toggleSection}>
          {!isAcquireOnly && (
            <div className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-100">Asset whitelist</span>
                <span className="text-dark-100 text-sm">{whitelistCount}/10</span>
              </div>
              {whitelistAssets.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {whitelistAssets.map(asset => (
                    <li key={asset.uniqueId || asset.policyId} className="flex items-center gap-2 min-w-0">
                      {(asset.imageUrl || asset.image) && (
                        <img
                          alt=""
                          className="h-6 w-6 rounded-full object-cover shrink-0"
                          src={asset.imageUrl || asset.image}
                        />
                      )}
                      <span className="text-white text-sm truncate">
                        {asset.name || asset.assetName || asset.collectionName || asset.policyId}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-dark-100">
                  Pick verified collections contributors can deposit, plus min/max caps for each.
                </p>
              )}
              <SecondaryButton className="mt-3 w-full" onClick={openWhitelistModal}>
                <ListChecks className="w-4 h-4" />
                {whitelistCount > 0 ? 'Manage asset whitelist' : 'Add asset whitelist'}
              </SecondaryButton>
            </div>
          )}
          {showContributorWhitelist && (
            <ManageList
              count={contributorWallets.length}
              emptyHint="Wallets allowed to contribute assets."
              label="Contributor whitelist"
              manageLabel={contributorWallets.length > 0 ? 'Manage contributor whitelist' : 'Add contributor whitelist'}
              max={100}
              names={contributorWallets.map(item => item.walletAddress)}
              onManage={() =>
                openWalletWhitelistModal({
                  field: 'contributorWhitelist',
                  title: 'Contributor whitelist',
                  description: 'Wallets that can deposit assets during the contribution window.',
                  required: isPrivate,
                })
              }
            />
          )}
          {showAcquirerWhitelist && (
            <ManageList
              count={acquirerWallets.length}
              emptyHint="Wallets allowed to acquire vault tokens."
              label="Acquirer whitelist"
              manageLabel={acquirerWallets.length > 0 ? 'Manage acquirer whitelist' : 'Add acquirer whitelist'}
              max={100}
              names={acquirerWallets.map(item => item.walletAddress)}
              onManage={() =>
                openWalletWhitelistModal({
                  field: 'acquirerWhitelist',
                  title: 'Acquirer whitelist',
                  description: 'Wallets that can acquire vault tokens during the acquire window.',
                  required: isPrivate,
                })
              }
            />
          )}
          <EditableRow
            displayValue={percent(vault.acquireReserve)}
            isAiSet={isAiSet('acquireReserve')}
            isChanged={isChanged('acquireReserve')}
            label="Reserve"
            placeholder="100"
            sanitize={sanitizeDecimal}
            suffix="%"
            value={vault.acquireReserve === 0 || vault.acquireReserve ? String(vault.acquireReserve) : ''}
            onCommit={next => commitNumber('acquireReserve', next)}
          />
          <SelectRow
            isAiSet={isAiSet('isAcquireOnly')}
            isChanged={isChanged('isAcquireOnly')}
            label="Acquisitions only"
            options={YES_NO_OPTIONS}
            value={!!vault.isAcquireOnly}
            onCommit={next => onUpdateVault('isAcquireOnly', next)}
          />
          <SelectRow
            isAiSet={isAiSet('allowAcquireExpansion')}
            isChanged={isChanged('allowAcquireExpansion')}
            label="Acquire expansion"
            options={YES_NO_OPTIONS}
            value={!!vault.allowAcquireExpansion}
            onCommit={next => onUpdateVault('allowAcquireExpansion', next)}
          />
        </Section>

        <Section id="launch" isOpen={openSections.has('launch')} label="Launch" onToggle={toggleSection}>
          <SelectRow
            isAiSet={isAiSet('privacy')}
            isChanged={isChanged('privacy')}
            label="Privacy"
            options={privacyOptions}
            value={vault.privacy}
            onCommit={next => onUpdateVault('privacy', next)}
          />
          {isPrivate && (
            <>
              <SelectRow
                isAiSet={isAiSet('valueMethod')}
                isChanged={isChanged('valueMethod')}
                label="Value method"
                options={valueMethodOptions}
                value={vault.valueMethod}
                onCommit={next => onUpdateVault('valueMethod', next)}
              />
              {vault.valueMethod === 'fixed' && (
                <>
                  <SelectRow
                    isChanged={isChanged('valuationCurrency')}
                    label="Valuation currency"
                    options={valuationCurrencyOptions}
                    value={vault.valuationCurrency}
                    onCommit={next => onUpdateVault('valuationCurrency', next)}
                  />
                  <EditableRow
                    displayValue={vault.valuationAmount ? String(vault.valuationAmount) : ''}
                    isChanged={isChanged('valuationAmount')}
                    label="Valuation amount"
                    placeholder="Amount"
                    sanitize={sanitizeDecimal}
                    value={vault.valuationAmount ? String(vault.valuationAmount) : ''}
                    onCommit={next =>
                      commitNumber('valuationAmount', next, { min: 0, max: Number.MAX_SAFE_INTEGER })
                    }
                  />
                </>
              )}
            </>
          )}
          {!isAcquireOnly && (
            <>
              <DurationRow
                isAiSet={isAiSet('contributionDuration')}
                isChanged={isChanged('contributionDuration')}
                label="Contribution"
                minMs={MIN_CONTRIBUTION_DURATION_MS}
                value={vault.contributionDuration}
                onCommit={next => onUpdateVault('contributionDuration', next)}
              />
              <SelectRow
                isAiSet={isAiSet('contributionOpenWindowType')}
                isChanged={isChanged('contributionOpenWindowType')}
                label="Contribution opens"
                options={CONTRIBUTION_OPENS_OPTIONS}
                value={vault.contributionOpenWindowType}
                onCommit={next => onUpdateVault('contributionOpenWindowType', next)}
              />
              {vault.contributionOpenWindowType === 'custom' && (
                <DateRow
                  isChanged={isChanged('contributionOpenWindowTime')}
                  label="Contribution date"
                  value={vault.contributionOpenWindowTime}
                  onCommit={next => onUpdateVault('contributionOpenWindowTime', next)}
                />
              )}
            </>
          )}
          {hasAcquireWindow && (
            <>
              <DurationRow
                isAiSet={isAiSet('acquireWindowDuration')}
                isChanged={isChanged('acquireWindowDuration')}
                label="Acquire"
                minMs={MIN_ACQUIRE_WINDOW_DURATION_MS}
                value={vault.acquireWindowDuration}
                onCommit={next => onUpdateVault('acquireWindowDuration', next)}
              />
              <SelectRow
                isAiSet={isAiSet('acquireOpenWindowType')}
                isChanged={isChanged('acquireOpenWindowType')}
                label="Acquire opens"
                options={ACQUIRE_OPENS_OPTIONS}
                value={vault.acquireOpenWindowType}
                onCommit={next => onUpdateVault('acquireOpenWindowType', next)}
              />
              {vault.acquireOpenWindowType === 'custom' && (
                <DateRow
                  isChanged={isChanged('acquireOpenWindowTime')}
                  label="Acquire date"
                  minDate={acquireMinDate}
                  value={vault.acquireOpenWindowTime}
                  onCommit={next => onUpdateVault('acquireOpenWindowTime', next)}
                />
              )}
            </>
          )}
          {isAcquireOnly && (
            <EditableRow
              displayValue={
                vault.minAcquireThreshold ? `${vault.minAcquireThreshold} ${currencyLabel}` : ''
              }
              isAiSet={isAiSet('minAcquireThreshold')}
              isChanged={isChanged('minAcquireThreshold')}
              label="Min acquire"
              placeholder="Optional"
              sanitize={sanitizeDecimal}
              suffix={currencyLabel}
              value={
                vault.minAcquireThreshold === 0 || vault.minAcquireThreshold
                  ? String(vault.minAcquireThreshold)
                  : ''
              }
              onCommit={next => commitNumber('minAcquireThreshold', next, { min: 0, max: 100000 })}
            />
          )}
        </Section>

        <Section id="tokenomics" isOpen={openSections.has('tokenomics')} label="Tokenomics" onToggle={toggleSection}>
          <EditableRow
            displayValue={vault.ftTokenSupply?.toLocaleString() ?? ''}
            isAiSet={isAiSet('ftTokenSupply')}
            isChanged={isChanged('ftTokenSupply')}
            label="Token supply"
            placeholder="1,000,000"
            sanitize={next => next.replace(/[^0-9]/g, '')}
            value={vault.ftTokenSupply ? String(vault.ftTokenSupply) : ''}
            onCommit={next => commitNumber('ftTokenSupply', next, { min: MIN_SUPPLY, max: MAX_SUPPLY, integer: true })}
          />
          {isAcquireOnly ? (
            <FieldShell isAiSet={isAiSet('tokensForAcquires')} isChanged={isChanged('tokensForAcquires')} label="For acquirers">
              <span className="text-sm text-white">100%</span>
            </FieldShell>
          ) : (
            <EditableRow
              displayValue={percent(vault.tokensForAcquires)}
              isAiSet={isAiSet('tokensForAcquires')}
              isChanged={isChanged('tokensForAcquires')}
              label="For acquirers"
              placeholder="50"
              sanitize={sanitizeDecimal}
              suffix="%"
              value={vault.tokensForAcquires === 0 || vault.tokensForAcquires ? String(vault.tokensForAcquires) : ''}
              onCommit={next => commitNumber('tokensForAcquires', next)}
            />
          )}
          <EditableRow
            displayValue={percent(vault.liquidityPoolContribution)}
            isAiSet={isAiSet('liquidityPoolContribution')}
            isChanged={isChanged('liquidityPoolContribution')}
            label="LP contribution"
            placeholder="10"
            sanitize={sanitizeDecimal}
            suffix="%"
            value={
              vault.liquidityPoolContribution === 0 || vault.liquidityPoolContribution
                ? String(vault.liquidityPoolContribution)
                : ''
            }
            onCommit={next => commitNumber('liquidityPoolContribution', next)}
          />
        </Section>

        <Section id="governance" isOpen={openSections.has('governance')} label="Governance" onToggle={toggleSection}>
          <EditableRow
            displayValue={percent(vault.creationThreshold)}
            isAiSet={isAiSet('creationThreshold')}
            isChanged={isChanged('creationThreshold')}
            label="Proposal threshold"
            placeholder="1"
            sanitize={sanitizeDecimal}
            suffix="%"
            value={vault.creationThreshold === 0 || vault.creationThreshold ? String(vault.creationThreshold) : ''}
            onCommit={next => commitNumber('creationThreshold', next)}
          />
          <EditableRow
            displayValue={percent(vault.cosigningThreshold)}
            isAiSet={isAiSet('cosigningThreshold')}
            isChanged={isChanged('cosigningThreshold')}
            label="Quorum"
            placeholder="35"
            sanitize={sanitizeDecimal}
            suffix="%"
            value={vault.cosigningThreshold === 0 || vault.cosigningThreshold ? String(vault.cosigningThreshold) : ''}
            onCommit={next => commitNumber('cosigningThreshold', next, { min: 1 })}
          />
          <EditableRow
            displayValue={percent(vault.executionThreshold)}
            isAiSet={isAiSet('executionThreshold')}
            isChanged={isChanged('executionThreshold')}
            label="Approval"
            placeholder="51"
            sanitize={sanitizeDecimal}
            suffix="%"
            value={vault.executionThreshold === 0 || vault.executionThreshold ? String(vault.executionThreshold) : ''}
            onCommit={next => commitNumber('executionThreshold', next, { min: 1 })}
          />
          <SelectRow
            isAiSet={isAiSet('terminationType')}
            isChanged={isChanged('terminationType')}
            label="Termination"
            options={TERMINATION_TYPE_OPTIONS.map(option => ({ value: option.name, label: option.label }))}
            value={vault.terminationType}
            onCommit={next => onUpdateVault('terminationType', next)}
          />
        </Section>

      </div>

      <div className="space-y-2">
        <PrimaryButton className="w-full uppercase" disabled={!canOpenInForm || isLaunching} onClick={onLaunch}>
          <Sparkles className="w-4 h-4" />
          {isLaunching
            ? 'Launching...'
            : canOpenInForm
              ? 'Confirm & launch'
              : missingRequired.length > 0
                ? `Complete setup · ${missingRequired.length} remaining`
                : 'Complete setup'}
        </PrimaryButton>
      </div>
    </div>
  );
};
