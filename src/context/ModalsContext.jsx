import { useState } from 'react';

import { ModalContext } from '@/context/modals';

export const ModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});

  const openModal = (modalType, props = {}) => {
    setActiveModal(modalType);
    setModalProps(props);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        modalProps,
        openModal,
        closeModal,
        isModalOpen: Boolean(activeModal),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
