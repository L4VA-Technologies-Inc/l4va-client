import ShaderBackground from '@/components/shared/ShaderBackground';

// Landing-page backdrop (texture + animated shader), shared with other pages.
export const LandingBackground = () => (
  <>
    <div className="home-bg-texture absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full min-h-[750px]" />
    <ShaderBackground
      variant="particles"
      opacity={0.55}
      className="absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full h-[750px] [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
    />
  </>
);

export default LandingBackground;
