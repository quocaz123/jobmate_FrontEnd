import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../services/localStorageService';
import { showSuccess } from '../utils/toast';
import { jwtDecode } from 'jwt-decode';
import { MessageNotificationContext } from './MessageNotificationContext';
import { getMyConversations } from '../services/chatService';

export const MessageNotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const isOnMessagesPageRef = useRef(false);
    const viewedConversationIdRef = useRef(null);
    const joinedRoomsRef = useRef(new Set());
    const processedMessageIdsRef = useRef(new Set());

    // Lấy userId từ token
    const getCurrentUserId = () => {
        try {
            const token = getToken();
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.userId;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Khởi tạo Socket.IO connection
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const joinedRooms = joinedRoomsRef.current;
        const newSocket = io(import.meta.env.VITE_SOCKET_IO_ENDPOINT, {
            transports: ['websocket'],
            query: { token: token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000,
        });

        newSocket.on('connect', async () => {
            // Join vào tất cả conversations của user để nhận message
            try {
                const res = await getMyConversations();
                const conversations = res?.data?.data || [];

                // Tính tổng unread count từ API
                let totalUnread = 0;
                conversations.forEach((conv) => {
                    if (conv.id && !joinedRooms.has(conv.id)) {
                        newSocket.emit('joinRoom', conv.id);
                        joinedRooms.add(conv.id);
                    }
                    // Tính unread count từ API (nếu có)
                    // Note: API có thể không trả về unread count, cần kiểm tra
                    if (conv.unreadCount !== undefined) {
                        totalUnread += conv.unreadCount || 0;
                    }
                });

                // Đồng bộ unread count từ API nếu có
                if (totalUnread > 0) {
                    setUnreadCount(totalUnread);
                }
            } catch (error) {
                console.error('Error fetching conversations for notification:', error);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Lắng nghe tin nhắn mới
        newSocket.on('message', (data) => {
            try {
                const message = typeof data === 'string' ? JSON.parse(data) : data;
                const currentUserId = getCurrentUserId();

                // Validate message
                if (!message || !message.conversationId) {
                    return;
                }

                // Kiểm tra duplicate message
                const messageId = String(message.id || `${message.conversationId}-${message.createdDate}`);
                if (processedMessageIdsRef.current.has(messageId)) {
                    return; // Đã xử lý message này rồi
                }
                processedMessageIdsRef.current.add(messageId);

                // Giới hạn size của Set để tránh memory leak
                if (processedMessageIdsRef.current.size > 200) {
                    const firstId = processedMessageIdsRef.current.values().next().value;
                    processedMessageIdsRef.current.delete(firstId);
                }

                const isMe = message.sender?.userId === currentUserId;

                // Chỉ tăng unreadCount trong context nếu:
                // 1. Tin nhắn không phải từ chính user này
                // 2. User KHÔNG đang ở trang messages (để MessagePage tự quản lý khi ở trang messages)
                if (!isMe && !isOnMessagesPageRef.current) {
                    // Chỉ tăng unreadCount và hiển thị thông báo khi KHÔNG ở trang messages
                    // Khi ở trang messages, MessagePage sẽ tự quản lý unreadCount thông qua syncUnreadCount
                    setUnreadCount((prev) => prev + 1);

                    const senderName = message.sender?.fullName || 'Ai đó';
                    const messagePreview = message.message?.substring(0, 50) || '';
                    showSuccess(`Tin nhắn mới từ ${senderName}: ${messagePreview}${messagePreview.length >= 50 ? '...' : ''}`, {
                        duration: 5000,
                    });
                }
            } catch (error) {
                console.error('Error handling message notification:', error);
            }
        });

        setSocket(newSocket);

        return () => {
            if (newSocket.connected) {
                // Leave tất cả rooms trước khi disconnect
                const roomsToLeave = Array.from(joinedRooms);
                roomsToLeave.forEach((roomId) => {
                    newSocket.emit('leaveRoom', roomId);
                });
                joinedRooms.clear();
                newSocket.disconnect();
            }
        };
    }, []);

    // Thay đổi title khi có tin nhắn chưa đọc
    useEffect(() => {
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Tin nhắn mới - JobMate`;
        } else {
            document.title = 'JobMate';
        }
    }, [unreadCount]);

    const resetUnreadCount = () => {
        setUnreadCount(0);
    };

    const incrementUnreadCount = () => {
        setUnreadCount((prev) => prev + 1);
    };

    const setIsOnMessagesPage = (value) => {
        isOnMessagesPageRef.current = value;
    };

    const setViewedConversationId = (conversationId) => {
        viewedConversationIdRef.current = conversationId ? String(conversationId) : null;
    };

    const syncUnreadCount = (count) => {
        setUnreadCount(count);
    };

    const value = {
        unreadCount,
        resetUnreadCount,
        incrementUnreadCount,
        setIsOnMessagesPage,
        setViewedConversationId,
        syncUnreadCount,
        socket,
    };

    return (
        <MessageNotificationContext.Provider value={value}>
            {children}
        </MessageNotificationContext.Provider>
    );
};

