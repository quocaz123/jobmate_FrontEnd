import { useContext } from 'react';
import { MessageNotificationContext } from '../contexts/MessageNotificationContext';

export const useMessageNotification = () => {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    // Trả về default values thay vì throw error để tránh crash
    return {
      unreadCount: 0,
      resetUnreadCount: () => {},
      incrementUnreadCount: () => {},
      setIsOnMessagesPage: () => {},
      socket: null,
    };
  }
  return context;
};

