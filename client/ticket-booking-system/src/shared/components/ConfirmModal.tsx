import React from 'react';
import '../styles/css/ConfirmModal.css';
import { ConfirmModalProps } from '../types/ConfirmModalProps';

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose(true); 
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-button modal-button--confirm" onClick={handleConfirm}>
            Да
          </button>
          <button className="modal-button modal-button--cancel" onClick={handleCancel}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;