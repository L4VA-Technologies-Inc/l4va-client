import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

interface ModalData {
  name: string;
  props?: any;
}

interface ModalContextType {
  activeModalData: ModalData | null;
}

interface ModalControlContextType {
  openModal: (name: string, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  activeModalData: null,
});

const ModalControlContext = createContext<ModalControlContextType>({
  openModal: () => {},
  closeModal: () => {},
});

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [activeModalData, setActiveModalData] = useState<ModalData | null>(null);

  const openModal = useCallback((name: string, props?: any) => {
    setActiveModalData(currentModal => {
      if (currentModal) {
        return currentModal;
      }

      return { name, props };
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
      closeModal,
    }),
    [closeModal, openModal]
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
