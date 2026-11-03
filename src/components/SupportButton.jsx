import { MessageCircleQuestion } from 'lucide-react';

import { useModalControls } from '@/lib/modals/modal.context';

/** Floating "Support" entry point on every page; opens the support chat (login required to write). */
export const SupportButton = () => {
  const { openModal } = useModalControls();

  return (
    <button
      aria-label="Contact support"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center gap-2 h-11 px-4 sm:w-40 sm:px-0 rounded-full bg-steel-850 border border-steel-750 text-sm font-semibold shadow-lg hover:bg-steel-800 transition-colors"
      type="button"
      onClick={() => openModal('SupportModal')}
    >
      <MessageCircleQuestion className="w-5 h-5 text-orange-500" />
      <span className="hidden sm:inline">Support</span>
    </button>
  );
};
