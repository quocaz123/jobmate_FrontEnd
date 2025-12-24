import { useContext } from 'react';
import { MessageNotificationContext } from '../contexts/MessageNotificationContext';

export const useMessageNotification = () => {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error('useMessageNotification must be used within MessageNotificationProvider');
  }
  return context;
};

