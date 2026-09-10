import { ArrowRight } from 'lucide-react';

/**
 * Full-bleed footer on a proposal card. A 16px corner arrow is easy to miss;
 * this is the whole bottom of the card, with a label that names the destination.
 */
export const ProposalCardAction = ({ label, hint, isPrimary, onClick }) => (
  <button
    type="button"
    title={hint}
    aria-label={hint}
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-[transform,filter] duration-150 ease-out active:scale-[0.99] motion-reduce:active:scale-100 motion-reduce:transition-none ${
      isPrimary
        ? 'bg-orange-gradient text-slate-950 hover:brightness-110'
        : 'border-t border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]'
    }`}
  >
    <span className="text-lg font-semibold tracking-tight">{label}</span>
    <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" strokeWidth={2.5} />
  </button>
);
