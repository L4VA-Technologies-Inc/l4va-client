import { useEffect, useState } from 'react';
import { Shader, Aurora, MeshGradient, FloatingParticles, FilmGrain } from 'shaders/react';

import { useNetwork } from '@/hooks/useNetwork';

const PALETTES = {
  cardano: { bg: '#000322', accent: '#FF842C', accentAlt: '#FFD012', deep: '#1D1F5A' },
  robinhood: { bg: '#0D0D0C', accent: '#00C805', accentAlt: '#CCFF00', deep: '#0F2A12' },
};

const canAnimate = () => {
  if (typeof window === 'undefined' || !('gpu' in navigator)) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const Layers = ({ variant, p }) => {
  switch (variant) {
    case 'mesh':
      return (
        <>
          <MeshGradient
            stops={[
              { color: p.bg, position: 0 },
              { color: p.deep, position: 0.45 },
              { color: p.accent, position: 0.8 },
              { color: p.accentAlt, position: 1 },
            ]}
            count={4}
            swirl={0.4}
            speed={0.3}
          />
          <FilmGrain strength={0.08} />
        </>
      );
    case 'particles':
      return (
        <>
          <Aurora colorA={p.deep} colorB={p.accent} colorC={p.accentAlt} intensity={0.6} speed={0.4} />
          <FloatingParticles particleColor={p.accentAlt} count={40} speed={0.2} twinkle={0.6} />
          <FilmGrain strength={0.06} />
        </>
      );
    case 'aurora':
    default:
      return (
        <>
          <Aurora colorA={p.deep} colorB={p.accent} colorC={p.accentAlt} intensity={0.7} speed={0.3} />
          <FilmGrain strength={0.06} />
        </>
      );
  }
};

/**
 * Decorative WebGPU background. Renders nothing when WebGPU is missing, fails to start,
 * or the user prefers reduced motion — callers keep their CSS background as the fallback.
 */
export const ShaderBackground = ({ variant = 'aurora', className = '', opacity = 1 }) => {
  const { isRobinHood } = useNetwork();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setEnabled(canAnimate()), []);

  if (!enabled) return null;

  const palette = isRobinHood ? PALETTES.robinhood : PALETTES.cardano;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none transition-opacity duration-1000 ${className}`}
      style={{ opacity: ready ? opacity : 0 }}
    >
      <Shader
        className="w-full h-full"
        disableTelemetry
        onReady={() => setReady(true)}
        onUnavailable={() => setEnabled(false)}
      >
        <Layers variant={variant} p={palette} />
      </Shader>
    </div>
  );
};

export default ShaderBackground;
