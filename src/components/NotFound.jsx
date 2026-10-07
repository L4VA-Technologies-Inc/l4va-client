import { useNavigate } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';

import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';
import ShaderBackground from '@/components/shared/ShaderBackground';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <ShaderBackground
        variant="mesh"
        opacity={0.4}
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="max-w-xl mx-auto text-center">
        <p className="text-base font-semibold text-orange-500">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight  sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-lg ">
          Sorry, we could not find the page you are looking for. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <SecondaryButton type="button" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Go back
          </SecondaryButton>
          <PrimaryButton type="button" onClick={() => navigate({ to: '/' })}>
            <Home className="w-4 h-4" />
            Go home
          </PrimaryButton>
        </div>
      </div>

      <div className="mt-16 select-none pointer-events-none">
        <div className="relative">
          <div className="absolute inset-x-0 /10 -z-10">
            <div className="h-[20rem] flex items-center justify-center text-[20rem] font-bold tracking-widest opacity-20">
              404
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
