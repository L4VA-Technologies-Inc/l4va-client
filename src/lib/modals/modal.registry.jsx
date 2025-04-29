import { useModal, useModalControls } from '@/lib/modals/modal.context';
import { MODAL_ENTRIES } from '@/lib/modals/modal.constants';

export const Modal = () => {
  const { activeModalData } = useModal();
  const { closeModal } = useModalControls();

  const { Component } = MODAL_ENTRIES.find(({ name }) => activeModalData?.name === name) || {};

  if (!Component) return null;

  const props = {
    ...activeModalData?.props,
    isOpen: true,
    onClose: closeModal,
  };

  return <Component {...props} />;
};
