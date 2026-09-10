import { Check } from 'lucide-react';

const ACCENTS = {
  yes: { rgb: '34, 197, 94', border: '#22c55e', icon: 'text-green-500', ring: 'focus-visible:ring-green-500' },
  no: { rgb: '239, 68, 68', border: '#ef4444', icon: 'text-red-500', ring: 'focus-visible:ring-red-500' },
  abstain: { rgb: '148, 163, 184', border: '#94a3b8', icon: 'text-gray-400', ring: 'focus-visible:ring-gray-400' },
};

const BASE_BACKGROUND = 'var(--color-steel-850)';

export const VoteButton = ({ voteType, icon: Icon, label, canVote, isSelected, onClick }) => {
  const accent = ACCENTS[voteType] ?? ACCENTS.abstain;

  // A disabled option still has to read as the choice it represents, so it keeps
  // its colour and loses only the interactive treatment.
  const background = canVote
    ? `linear-gradient(90deg, rgba(${accent.rgb}, 0.00) 0%, rgba(${accent.rgb}, ${isSelected ? '0.28' : '0.20'}) 100%), ${BASE_BACKGROUND}`
    : BASE_BACKGROUND;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={!canVote}
      onClick={onClick}
      className={`w-full rounded-lg flex items-center gap-3 px-4 py-3.5 text-left transition-[transform,box-shadow,border-color] duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-steel-950 ${accent.ring}
        ${canVote ? 'cursor-pointer hover:brightness-110 active:scale-[0.99] motion-reduce:active:scale-100' : 'cursor-not-allowed opacity-70'}
        motion-reduce:transition-none`}
      style={{
        background,
        color: canVote ? 'white' : '#4b7488',
        border: `1px solid ${isSelected ? accent.border : BASE_BACKGROUND}`,
        boxShadow: isSelected ? `0 0 0 1px ${accent.border}` : 'none',
      }}
    >
      <Icon className={`${accent.icon} w-5 h-5 shrink-0`} aria-hidden="true" />
      <span className="text-base flex-1">{label}</span>
      {isSelected && <Check className={`${accent.icon} w-5 h-5 shrink-0`} aria-label="Selected" />}
    </button>
  );
};
