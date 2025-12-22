import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import VaultChart from '@/components/shared/VaultChart';
import VaultMetrics from '@/components/shared/VaultMetrics';
import { useVaultTokenStatistics } from '@/services/api/queries.js';

export const ChartModal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();
  const { vault } = activeModalData?.props || {};

  const { data, isLoading } = useVaultTokenStatistics(vault?.id);

  return (
    <ModalWrapper isOpen onClose={closeModal} title="Vault Analytics" className="md:max-w-4xl xl:max-w-6xl">
      <div className="space-y-6">
        <VaultMetrics statistics={data?.data.tokenPrice} isLoading={isLoading} />
        <VaultChart data={data?.data.tokenHistory} />
      </div>
    </ModalWrapper>
  );
};
