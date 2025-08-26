import L4vaIcon from '@/icons/l4va.svg?react';

export const FullPageLoader = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center">
        <div className="mb-4">
          <div className="w-full flex items-center justify-center">
            <L4vaIcon className="h-32 w-32 text-white" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 text-center">
        <p className="text-sm">L4VA © {currentYear}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
