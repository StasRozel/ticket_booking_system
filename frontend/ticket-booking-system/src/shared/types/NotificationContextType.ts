export type NotificationContextType = {
  notification: { message: string; type: 'success' | 'error' } | null;
  setOptionNotification: (message: string, type: 'success' | 'error') => void;
  isVisible: boolean, 
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleAnimationEnd: () => void;
};