import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModalContext = createContext({
  activeModalData: null,
});

const ModalControlContext = createContext({
  openModal: () => {},
  updateModal: () => {},
  closeModal: () => false,
});

export function ModalProvider({ children }) {
  const [activeModalData, setActiveModalData] = useState(null);

  const openModal = useCallback((name, props) => {
    setActiveModalData({ name, props });
  }, []);

  const updateModal = useCallback((name, props) => {
    setActiveModalData(currentModal => {
      if (!currentModal || currentModal.name !== name) {
        return currentModal;
      }

      return {
        ...currentModal,
        props: {
          ...(currentModal.props ?? {}),
          ...(props ?? {}),
        },
      };
    });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModalData(null);
  }, []);

  const state = useMemo(
    () => ({
      activeModalData,
    }),
    [activeModalData]
  );

  const methods = useMemo(
    () => ({
      openModal,
      updateModal,
      closeModal,
    }),
    [closeModal, openModal, updateModal]
  );

  return (
    <ModalContext.Provider value={state}>
      <ModalControlContext.Provider value={methods}>{children}</ModalControlContext.Provider>
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}

export function useModalControls() {
  return useContext(ModalControlContext);
}
