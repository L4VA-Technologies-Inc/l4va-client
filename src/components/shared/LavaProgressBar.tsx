import { cn } from '@/lib/utils';

type ProgressSegment = {
  progress: number;
  className?: string;
};

type LavaProgressBarProps = {
  segments: ProgressSegment[];
  className?: string;
  minLabel?: string;
  maxLabel?: string;
  minValue?: string;
  maxValue?: string;
  showLabel?: boolean;
};

const LavaProgressBar = ({
  segments,
  minValue,
  maxValue,
  minLabel = 'min',
  maxLabel = 'max',
  className = '',
  showLabel = false,
}: LavaProgressBarProps) => {
  const totalProgress = segments.reduce((sum, segment) => sum + segment.progress, 0);
  const normalizedSegments =
    totalProgress > 100
      ? segments.map(segment => ({
          ...segment,
          progress: (segment.progress / totalProgress) * 100,
        }))
      : segments;

  return (
    <>
      {showLabel && (
        <div className="flex justify-between w-full text-xs font-semibold text-dark-100 mb-2">
          <div className="flex items-center">
            <span>{minLabel}</span>
            <span className="ml-1 text-white">{minValue}</span>
          </div>
          <div className="flex items-center">
            <span>{maxLabel}</span>
            <span className="ml-1 text-white">{maxValue}</span>
          </div>
        </div>
      )}
      <div className={`w-full ${className}`}>
        <div className="flex h-full">
          {normalizedSegments.map((segment, index) => (
            <div
              key={index}
              className={cn('h-full rounded-full transition-all', segment.className)}
              style={{
                width: `${segment.progress}%`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default LavaProgressBar;
