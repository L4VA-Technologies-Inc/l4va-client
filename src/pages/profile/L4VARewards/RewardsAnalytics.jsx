import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import L4vaIcon from '@/icons/l4va.svg?react';
import { formatNum } from '@/utils/core.utils';
import { HoverHelp } from '@/components/shared/HoverHelp';

const ACTIVITY_HINT = `Activity Score reflects your protocol participation across six categories. Higher weight categories contribute more to your total $L4VA rewards.`;

const CATEGORY_COLORS = ['#FF842C', '#FFD012', '#4ADE80', '#90A1B9', '#22C55E', '#EAB308'];

const DONUT_SIZE = 200;
const DONUT_R = 68;
const STROKE_WIDTH = 20;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

export const RewardsAnalytics = ({ activityBreakdown }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = activityBreakdown.reduce((sum, a) => sum + a.amount, 0);
  const segments = activityBreakdown.map((cat, i) => ({
    ...cat,
    percent: total > 0 ? (cat.amount / total) * 100 : 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  let offsetDeg = -90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-steel-850 border border-steel-750 rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-steel-750 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Activity Score Breakdown</h3>
          <HoverHelp hint={ACTIVITY_HINT} />
        </div>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="relative flex-shrink-0 mb-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
          >
            <svg
              width={DONUT_SIZE}
              height={DONUT_SIZE}
              viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              className="drop-shadow-sm"
            >
              {segments.map((seg, i) => {
                const dashLength = (seg.percent / 100) * CIRCUMFERENCE;
                const gapLength = CIRCUMFERENCE - dashLength;
                const rotation = offsetDeg;
                offsetDeg += seg.percent * 3.6;
                const isHovered = hoveredIndex === i;
                const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

                return (
                  <motion.g
                    key={seg.id}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                    initial={false}
                    animate={{
                      opacity: isDimmed ? 0.4 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={DONUT_R}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={STROKE_WIDTH}
                      strokeLinecap="round"
                      strokeDasharray={`${dashLength} ${gapLength}`}
                      transform={`rotate(${rotation} ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.15 + i * 0.05,
                        ease: 'easeOut',
                      }}
                      style={{
                        filter: isHovered ? `brightness(1.3) drop-shadow(0 0 14px ${seg.color})` : undefined,
                        transition: 'filter 0.2s ease',
                      }}
                    />
                    {/* Invisible wider stroke for easier hover */}
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={DONUT_R}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={STROKE_WIDTH + 16}
                      strokeDasharray={`${dashLength} ${gapLength}`}
                      transform={`rotate(${rotation} ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
                      style={{ cursor: 'pointer' }}
                    />
                  </motion.g>
                );
              })}
            </svg>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-24 h-24 rounded-full bg-steel-850 flex items-center justify-center border border-steel-750">
                <L4vaIcon className="w-10 h-10 text-orange-500" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {hoveredIndex !== null ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="min-h-[40px] flex items-center justify-center mb-4 px-5 py-2.5 rounded-xl bg-steel-800/90 border border-steel-700"
            >
              <span
                className="text-white font-medium text-sm text-center"
                style={{ color: segments[hoveredIndex]?.color }}
              >
                {segments[hoveredIndex]?.label}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[40px] flex items-center justify-center mb-4"
            >
              <span className="text-steel-500 text-xs">Hover over a segment</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 + i * 0.05 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                hoveredIndex === i ? 'bg-steel-800/80' : 'hover:bg-steel-800/50'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                style={{
                  backgroundColor: seg.color,
                  transform: hoveredIndex === i ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: hoveredIndex === i ? `0 0 8px ${seg.color}` : 'none',
                }}
              />
              <span className="text-white font-semibold text-sm tabular-nums">{formatNum(seg.amount)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
