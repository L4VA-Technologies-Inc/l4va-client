import { createFileRoute } from '@tanstack/react-router';
import { Shader, LinearGradient, CursorTrail } from 'shaders/react';

// Temporary test page for the `shaders` (WebGPU) library — not linked from navigation.
export const ShadersTest = () => (
  <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
    <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">Shaders test</h1>
    <div className="relative rounded-2xl overflow-hidden">
      <Shader className="w-full h-96">
        <LinearGradient colorA="#0f172a" colorB="#7c3aed" />
        <CursorTrail />
      </Shader>
      <p className="absolute inset-0 flex items-center justify-center pointer-events-none text-xl font-russo">
        Move your cursor over the gradient
      </p>
    </div>
  </div>
);

export const Route = createFileRoute('/shaders-test')({
  component: ShadersTest,
});
