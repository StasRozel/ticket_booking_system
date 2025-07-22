export type ModalContextType = {
    modalMessage: string;
    modalAction: (() => void) | null;
    isModalOpen: boolean;
    openModal: (message: string, action: () => void) => void;
    handleModalClose: (result: boolean) => void;
}