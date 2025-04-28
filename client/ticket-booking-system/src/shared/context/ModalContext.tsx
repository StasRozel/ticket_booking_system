import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { ModalContextType } from '../types/ModalContextType';


const ModalContext = createContext<ModalContextType | undefined>(undefined);

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalAction, setModalAction] = useState<(() => void) | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const openModal = (message: string, action: () => void) => {
        setModalMessage(message);
        setModalAction(() => action);
        setIsModalOpen(true);
      };
    
      // Обработчик результата модального окна
      const handleModalClose = (result: boolean) => {
        if (result && modalAction) {
          modalAction(); 
        }
        setIsModalOpen(false);
        setModalAction(null);
      };
  return (
    <ModalContext.Provider value={{
        modalMessage, modalAction, isModalOpen, openModal, handleModalClose
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useDashboard must be used within an DashboardProvider');
  }
  return context;
};