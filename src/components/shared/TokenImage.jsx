import { useEffect, useMemo, useState } from 'react';

import L4vaIcon from '@/components/shared/L4vaIcon';

const CARDANO_FALLBACK_SRC = '/assets/icons/ada.svg';

const getAssetImageSrc = asset =>
  asset?.src ||
  asset?.image ||
  asset?.imageUrl ||
  asset?.metadata?.image ||
  asset?.metadata?.imageUrl ||
  asset?.tokenImage ||
  asset?.token_image ||
  '';

/** Green lava centered in a round token slot. */
export const LavaTokenFallback = ({ alt = 'L4VA', className = '', style }) => (
  <span
    aria-label={alt}
    role="img"
    className={`inline-flex items-center justify-center overflow-hidden ${className}`}
    style={style}
  >
    <L4vaIcon chainType="robinhood" preserveAspectRatio="xMidYMid meet" className="block size-[70%] shrink-0" />
  </span>
);

export const TokenImage = ({
  asset,
  src,
  alt = 'Token',
  chainType = 'cardano',
  className = '',
  width = 32,
  height = 32,
  loading = 'lazy',
}) => {
  const resolvedSrc = useMemo(() => src || getAssetImageSrc(asset), [asset, src]);
  const [hasError, setHasError] = useState(false);
  const isRobinhood = chainType === 'robinhood' || asset?.chainType === 'robinhood';
  const hasImage = typeof resolvedSrc === 'string' && resolvedSrc.trim() !== '';

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (isRobinhood && (!hasImage || hasError)) {
    return <LavaTokenFallback alt={alt} className={className} style={{ width, height }} />;
  }

  return (
    <img
      src={hasImage && !hasError ? resolvedSrc : CARDANO_FALLBACK_SRC}
      alt={alt}
      className={`object-cover ${className}`}
      style={{ width, height }}
      width={typeof width === 'number' ? width : undefined}
      height={typeof height === 'number' ? height : undefined}
      loading={loading}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
};
