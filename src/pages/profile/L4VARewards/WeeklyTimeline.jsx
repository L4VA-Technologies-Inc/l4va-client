import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import PrimaryButton from '@/components/shared/PrimaryButton';
import { formatNum } from '@/utils/core.utils';

const STATUS_CONFIG = {
  claimed: {
    label: 'Earned',
    icon: CheckCircle,
    badgeClass: 'bg-green-800/50 text-green-400 border-green-600',
  },
  claimable: {
    label: 'Claimable',
    icon: Gift,
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    badgeClass: 'bg-steel-600 text-steel-300 border-steel-500',
  },
  future: {
    label: 'Upcoming',
    icon: Clock,
    badgeClass: 'bg-steel-800 text-steel-500 border-steel-750',
  },
};

const CARD_WIDTH = 260;
const GAP = 16;
const SCROLL_STEP = CARD_WIDTH + GAP;

const getInitialIndex = epochs => {
  const claimableIdx = epochs.findIndex(e => e.status === 'claimable');
  if (claimableIdx >= 0) return claimableIdx;
  const pendingIdx = epochs.findIndex(e => e.status === 'pending');
  if (pendingIdx >= 0) return pendingIdx;
  return 0;
};

export const WeeklyTimeline = ({ weeklyEpochs, onClaim, onClaimAll, isClaiming }) => {
  const scrollRef = useRef(null);
  const initialIndex = getInitialIndex(weeklyEpochs);
  const [canScrollLeft, setCanScrollLeft] = useState(initialIndex > 0);
  const [canScrollRight, setCanScrollRight] = useState(initialIndex < weeklyEpochs.length - 1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const hasScrolledToInitial = useRef(false);

  const claimableEpochs = weeklyEpochs.filter(e => e.status === 'claimable');
  const hasClaimable = claimableEpochs.length > 0;
  const maxIndex = Math.max(0, weeklyEpochs.length - 1);

  const getScrollLeftForIndex = index => {
    const el = scrollRef.current;
    if (!el) return 0;
    const { scrollWidth, clientWidth } = el;
    const cardLeft = index * SCROLL_STEP;
    const cardCenter = cardLeft + CARD_WIDTH / 2;
    const targetScroll = cardCenter - clientWidth / 2;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    return Math.max(0, Math.min(targetScroll, maxScroll));
  };

  const scrollToIndex = (index, behavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    const targetScroll = getScrollLeftForIndex(index);
    el.scrollTo({ left: targetScroll, behavior });
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth } = el;
    const index = Math.round((scrollLeft + clientWidth / 2 - CARD_WIDTH / 2) / SCROLL_STEP);
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    setCanScrollLeft(clampedIndex > 0);
    setCanScrollRight(clampedIndex < maxIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const runUpdate = () => updateScrollState();
    const runUpdateDelayed = () => {
      runUpdate();
      setTimeout(runUpdate, 100);
    };
    runUpdate();
    el.addEventListener('scroll', runUpdateDelayed);
    el.addEventListener('scrollend', runUpdate);
    window.addEventListener('resize', runUpdate);
    const ro = new ResizeObserver(runUpdate);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', runUpdateDelayed);
      el.removeEventListener('scrollend', runUpdate);
      window.removeEventListener('resize', runUpdate);
      ro.disconnect();
    };
  }, [weeklyEpochs]);

  useEffect(() => {
    if (hasScrolledToInitial.current || weeklyEpochs.length === 0) return;
    hasScrolledToInitial.current = true;
    const timer = setTimeout(() => {
      scrollToIndex(initialIndex, 'auto');
    }, 50);
    return () => clearTimeout(timer);
  }, [weeklyEpochs, initialIndex]);

  const scroll = dir => {
    const nextIndex = Math.max(0, Math.min(currentIndex + dir, maxIndex));
    setCurrentIndex(nextIndex);
    setCanScrollLeft(nextIndex > 0);
    setCanScrollRight(nextIndex < maxIndex);
    scrollToIndex(nextIndex, 'smooth');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Weekly Progress</h3>
        {hasClaimable && (
          <PrimaryButton size="sm" onClick={onClaimAll} disabled={isClaiming}>
            {isClaiming ? 'Claiming...' : `Claim All (${claimableEpochs.length})`}
          </PrimaryButton>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-visible py-4 scrollbar-thin scrollbar-thumb-steel-600 scrollbar-track-steel-900 scroll-smooth -mx-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {weeklyEpochs.map((epoch, index) => {
          const config = STATUS_CONFIG[epoch.status];
          const Icon = config.icon;
          const showClaim = epoch.status === 'claimable';

          return (
            <motion.div
              key={epoch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.4)' }}
              className={clsx(
                'flex-shrink-0 w-[260px] rounded-xl border p-4 transition-colors duration-200',
                epoch.status === 'claimable'
                  ? 'bg-steel-850 border-orange-500/40 hover:border-orange-500/70 hover:bg-steel-800/80'
                  : 'bg-steel-850 border-steel-750 hover:border-steel-600 hover:bg-steel-800/50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-steel-400 text-xs font-medium">Week {epoch.weekNumber}</span>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                    config.badgeClass
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              <p className="text-steel-400 text-xs mb-1">
                {epoch.startDate} – {epoch.endDate}
              </p>
              <p className="text-white font-semibold text-lg mb-3">{formatNum(epoch.amount)} $L4VA</p>
              {showClaim && (
                <PrimaryButton size="sm" className="w-full" onClick={() => onClaim(epoch)} disabled={isClaiming}>
                  Claim
                </PrimaryButton>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={!canScrollLeft}
          className={clsx(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
            canScrollLeft
              ? 'bg-steel-800 border-steel-750 text-steel-300 hover:text-white hover:bg-steel-750 hover:border-steel-600 cursor-pointer'
              : 'bg-steel-900 border-steel-800 text-steel-600 cursor-not-allowed'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-steel-500 text-sm tabular-nums min-w-[4ch] text-center">
          {currentIndex + 1} / {weeklyEpochs.length}
        </span>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={!canScrollRight}
          className={clsx(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
            canScrollRight
              ? 'bg-steel-800 border-steel-750 text-steel-300 hover:text-white hover:bg-steel-750 hover:border-steel-600 cursor-pointer'
              : 'bg-steel-900 border-steel-800 text-steel-600 cursor-not-allowed'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
