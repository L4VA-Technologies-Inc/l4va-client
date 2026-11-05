import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const STORAGE_PREFIX = 'l4va:proposal-outcome-collapsed:';

const readCollapsed = key => {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key) === '1';
  } catch {
    return false;
  }
};

const writeCollapsed = (key, collapsed) => {
  try {
    if (collapsed) window.localStorage.setItem(STORAGE_PREFIX + key, '1');
    else window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Storage blocked (private window): the choice just isn't remembered.
  }
};

/**
 * Standard "What happens if this passes" block for proposals: numbered steps, each a short bold
 * lead followed by the detail, so every proposal reads the same way.
 *
 * Open by default. When `collapsible`, the header toggles it and the choice is remembered per
 * proposal type (`storageKey`); collapsed, it shows the one-line `summary` instead of the steps.
 * Warnings that block Create must live outside this block, so collapsing never hides them.
 * Irreversible actions (termination) pass `collapsible={false}`.
 *
 * @param {{
 *   steps: Array<{ title: string, detail?: import('react').ReactNode }>,
 *   summary?: import('react').ReactNode,
 *   storageKey?: string,
 *   collapsible?: boolean,
 * }} props
 */
export function ProposalOutcome({ steps, summary, storageKey, collapsible = true }) {
  const canCollapse = collapsible && !!storageKey;
  const [collapsed, setCollapsed] = useState(() => (canCollapse ? readCollapsed(storageKey) : false));

  const toggle = () => {
    setCollapsed(prev => {
      writeCollapsed(storageKey, !prev);
      return !prev;
    });
  };

  const heading = <h4 className="text-white font-medium">What happens if this passes</h4>;

  return (
    <div className="bg-steel-800 rounded-lg p-4 space-y-3 text-sm">
      {canCollapse ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          {heading}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
      ) : (
        heading
      )}
      {collapsed ? (
        summary ? (
          <p className="text-white/70">{summary}</p>
        ) : null
      ) : (
        <ol className="list-decimal list-inside space-y-2 text-white/70">
          {steps.map(step => (
            <li key={step.title}>
              <span className="text-white">{step.title}</span>
              {step.detail ? <> {step.detail}</> : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
