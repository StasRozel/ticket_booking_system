import { useEffect, useState } from 'react';


export const useModalClose = (
  isOpen: boolean,
  onClose: () => void,
  animationDuration = 300,
) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose, animationDuration]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing]);

  return { isClosing, handleClose };
};
