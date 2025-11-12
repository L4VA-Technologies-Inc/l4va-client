import { HelpCircle } from 'lucide-react';

export const HoverHelp = ({ hint }) => {
  return (
    <div className="group relative inline-flex" tabIndex="0" role="button">
      <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
      <div
        className="
                  absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg
                  opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200
                  sm:max-w-[360px] sm:min-w-[200px] w-max z-10
                  max-w-[250px] min-w-[100px]
                  whitespace-pre-wrap break-words text-left pointer-events-none
                "
      >
        {hint}
      </div>
    </div>
  );
};
