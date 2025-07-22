export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: (result: boolean) => void;
  message: string;
}