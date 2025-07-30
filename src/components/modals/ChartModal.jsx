import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { ModalWrapper } from '@/components/shared/ModalWrapper';
import VaultChart from '@/components/shared/VaultChart';
import VaultMetrics from '@/components/shared/VaultMetrics';

export const ChartModal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();
  const { vault } = activeModalData?.props || {};

  return (
    <ModalWrapper isOpen onClose={closeModal} title="Vault Analytics" className="md:max-w-4xl xl:max-w-6xl">
      <div className="space-y-6">
        <VaultMetrics vault={vault} />
        <VaultChart vaultName={vault?.name} />
      </div>
    </ModalWrapper>
  );
};
