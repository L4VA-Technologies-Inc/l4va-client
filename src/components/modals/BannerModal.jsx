import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { useModalControls } from '@/lib/modals/modal.context';

export const BannerModal = () => {
  const { closeModal } = useModalControls();

  return (
    <ModalWrapper isOpen title="Pre-sale Details" onClose={closeModal} size="md">
      <div className="flex flex-col gap-3 items-center justify-center w-full">
        <img className="w-14 h-14 rounded-lg" alt="ada-icon" src="/assets/icons/ada.svg" />
        <h1 className="text-2xl font-bold">SOON!</h1>
        <p className="text-dark-100 text-center m-0">
          Stay turned for{' '}
          <a
            href="https://l4va.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            pre-sale details
          </a>{' '}
          coming soon
        </p>
      </div>
    </ModalWrapper>
  );
};
