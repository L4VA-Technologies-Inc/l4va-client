import { useEffect, useMemo, useState } from 'react';

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

const RobinhoodFallback = ({ alt, className, width, height }) => (
  <div
    aria-label={alt}
    className={`flex items-center justify-center rounded-full bg-steel-700 text-white font-bold ring-1 ring-white/10 ${className}`}
    role="img"
    style={{ width, height }}
  >
    T
  </div>
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
    return <RobinhoodFallback alt={alt} className={className} width={width} height={height} />;
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
