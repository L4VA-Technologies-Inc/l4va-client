import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import VaultChart from '@/components/shared/VaultChart';
import VaultMetrics from '@/components/shared/VaultMetrics';
import { useMarketWithOHLCV } from '@/services/api/queries.js';

export const ChartModal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();
  const { vault } = activeModalData?.props || {};

  const { data, isLoading, isError, error } = useMarketWithOHLCV(vault?.id);

  const notFound =
    isError &&
    (error?.response?.status === 404 ||
      error?.status === 404 ||
      error?.message?.toLowerCase?.().includes('market not found'));

  const marketData = !notFound ? data?.data : null;

  return (
    <ModalWrapper isOpen onClose={closeModal} title="Vault Analytics" className="md:max-w-4xl xl:max-w-6xl">
      <div className="space-y-6">
        <VaultMetrics marketData={marketData} isLoading={isLoading && !notFound} />

        {isError && !notFound && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 text-sm px-4 py-3">
            Failed to load market data. Please try again later.
          </div>
        )}

        <VaultChart ohlcvData={marketData?.ohlcv} isLoading={isLoading && !notFound} isNotFound={notFound} />
      </div>
    </ModalWrapper>
  );
};
