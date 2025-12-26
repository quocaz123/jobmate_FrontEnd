import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Search, MoreVertical, Send } from 'lucide-react'
import { io } from 'socket.io-client'
import { jwtDecode } from 'jwt-decode'
import {
  getMyConversations,
  getMessagesOfConversation,
  createMessage,
  searchConversations,
  deleteConversation
} from '../../services/chatService'
import { getToken } from '../../services/localStorageService'
import { showError, showSuccess } from '../../utils/toast'
import { useMessageNotification } from '../../hooks/useMessageNotification'

const getCurrentUserId = () => {
  try {
    const token = getToken()
    if (!token) return null
    const decoded = jwtDecode(token)
    return decoded.userId
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// ================= Conversation List =================
const ConversationList = ({ conversations, onSelectConversation, selectedConversation, onDeleteConversation }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredConversations, setFilteredConversations] = useState(conversations)
  const [menuOpenId, setMenuOpenId] = useState(null)

  useEffect(() => {
    setFilteredConversations(conversations)
  }, [conversations])

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setFilteredConversations(conversations)
        return
      }
      try {
        const res = await searchConversations(searchTerm)
        const data = res?.data?.data || []
        const normalized = data.map((c) => {
          const other = (c.participants || []).find(p => p.userId !== getCurrentUserId())
          const name = other?.fullName || c.conversationName || 'Chưa đặt tên'
          const avatar = other?.avatar || c.conversationAvatar || 'U'
          return {
            id: c.id,
            name,
            avatar,
            lastMessage: c.lastMessage || 'Chưa có tin nhắn',
            timestamp: c.modifiedDate ? new Date(c.modifiedDate).toLocaleString('vi-VN') : '',
            unread: 0,
          }
        })
        setFilteredConversations(normalized)
      } catch (err) {
        showError("Error searching conversations:", err)
      }
    }, 400)
    return () => clearTimeout(delay)
  }, [searchTerm, conversations])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-green-100 flex items-center justify-center text-white font-bold">
                  {typeof conversation.avatar === 'string' && conversation.avatar.startsWith('http') ? (
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement.textContent = (conversation.name || 'U').charAt(0)
                      }}
                    />
                  ) : (
                    (conversation.name || 'U').charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conversation.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                      <div className="relative">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => setMenuOpenId(menuOpenId === conversation.id ? null : conversation.id)}
                        >
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>
                        {menuOpenId === conversation.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-10">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpenId(null)
                                onDeleteConversation?.(conversation.id)
                              }}
                            >
                              Xóa cuộc hội thoại
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-4">Không tìm thấy hội thoại nào</p>
        )}
      </div>
    </div>
  )
}

// ================= Chat Window =================
const ChatWindow = ({ conversation, socket, onMessageSent }) => {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)
  const conversationIdRef = useRef(null)
  const processedMessageIdsRef = useRef(new Set())

  useEffect(() => {
    if (!conversation?.id || !socket || !socket.connected) return

    const currentConversationId = String(conversation.id)
    conversationIdRef.current = currentConversationId
    setMessages([])
    processedMessageIdsRef.current.clear() // Reset processed messages khi chuyển conversation

    const fetchMessages = async () => {
      try {
        const res = await getMessagesOfConversation(conversation.id)
        const raw = res.data.data || []
        const currentUserId = getCurrentUserId()
        const normalized = raw.map(m => {
          const isMe = m.sender?.userId === currentUserId
          return {
            ...m,
            me: isMe,
            createdDate: m.createdDate || new Date().toISOString(),
            sender: m.sender || {},
          }
        })
        normalized.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
        setMessages(normalized)

        // Lưu các message IDs đã có để tránh duplicate
        normalized.forEach(m => {
          if (m.id) {
            processedMessageIdsRef.current.add(String(m.id))
          }
        })
      } catch (error) {
        showError("Error fetching messages:", error)
      }
    }
    fetchMessages()

    // Validate conversationId trước khi join
    if (currentConversationId && socket.connected) {
      try {
        socket.emit('joinRoom', currentConversationId)
      } catch (error) {
        console.error('Error joining room:', error)
      }
    }

    const handleMessage = (data) => {
      try {
        const message = typeof data === "string" ? JSON.parse(data) : data

        // Validate message data
        if (!message || !message.conversationId) {
          console.warn('Invalid message format:', message)
          return
        }

        // So sánh conversationId dưới dạng string để tránh type mismatch
        const messageConversationId = String(message.conversationId)
        const currentConvId = conversationIdRef.current

        if (messageConversationId !== currentConvId) {
          // Message không thuộc conversation hiện tại - bỏ qua (không show error)
          return
        }

        // Kiểm tra duplicate message
        const messageId = String(message.id || `${messageConversationId}-${message.createdDate}`)
        if (processedMessageIdsRef.current.has(messageId)) {
          return // Đã xử lý message này rồi
        }
        processedMessageIdsRef.current.add(messageId)

        // Giới hạn size của Set để tránh memory leak
        if (processedMessageIdsRef.current.size > 200) {
          const firstId = processedMessageIdsRef.current.values().next().value
          processedMessageIdsRef.current.delete(firstId)
        }

        const currentUserId = getCurrentUserId()
        const isMe = message.sender?.userId === currentUserId

        const normalized = {
          ...message,
          me: isMe,
          sender: message.sender || {},
          createdDate: message.createdDate || new Date().toISOString(),
        }

        setMessages((prev) => {
          // Double check để tránh duplicate
          if (prev.some((m) => String(m.id) === messageId)) {
            return prev
          }
          return [...prev, normalized]
        })

        // Cập nhật thứ tự hội thoại khi có tin mới
        onMessageSent(messageConversationId)
      } catch (e) {
        console.error("Error parsing socket message:", e, "Raw data:", data)
      }
    }

    // Lắng nghe event 'message' từ server
    socket.on('message', handleMessage)

    // Cleanup: chỉ remove listener, KHÔNG leave room vì có thể người khác đang nhắn
    return () => {
      socket.off('message', handleMessage)
      conversationIdRef.current = null
    }
  }, [conversation?.id, socket, onMessageSent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation?.id) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Optimistic update: hiển thị tin nhắn tạm thời
    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      id: tempId,
      message: messageText,
      conversationId: conversation.id,
      me: true,
      createdDate: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMessage])

    try {
      const res = await createMessage({
        conversationId: conversation.id,
        message: messageText,
      })
      const apiMsg = res?.data?.data || res?.data
      if (apiMsg) {
        const currentUserId = getCurrentUserId()
        // Tính lại 'me' để đảm bảo chính xác
        const isMe = apiMsg.sender?.userId === currentUserId

        const normalized = {
          ...apiMsg,
          createdDate: apiMsg.createdDate || new Date().toISOString(),
          me: isMe, // Đảm bảo 'me' đúng
          sender: apiMsg.sender || {},
        }
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempId && m.id !== normalized.id)
          return [...filtered, normalized]
        })

        onMessageSent(conversation.id)
      }
    } catch (err) {
      showError("Error sending message:", err)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setNewMessage(messageText)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center text-white font-bold">
            {typeof conversation.avatar === 'string' && conversation.avatar.startsWith('http') ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement.textContent = (conversation.name || 'U').charAt(0)
                }}
              />
            ) : (
              (conversation.name || 'U').charAt(0)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-black">{conversation.name}</h3>
          </div>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.me ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-xs lg:max-w-md ${msg.me ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.me && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                  {msg.sender?.avatar && msg.sender.avatar.startsWith('http') ? (
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender?.fullName || 'Avatar'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback nếu ảnh lỗi
                        e.target.style.display = 'none'
                        e.target.parentElement.textContent = msg.sender?.fullName?.charAt(0)?.toUpperCase() || 'A'
                      }}
                    />
                  ) : (
                    msg.sender?.fullName?.charAt(0)?.toUpperCase() || msg.sender?.avatar || 'A'
                  )}
                </div>
              )}
              <div className={`px-4 py-2 rounded-2xl border border-gray-200 shadow-sm ${msg.me ? 'bg-blue-100 text-black rounded-br-md' : 'bg-white text-black rounded-bl-md'}`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 text-gray-500">
                  {new Date(msg.createdDate).toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

// ================= Main Page =================
const MessagesPage = () => {
  const { resetUnreadCount, setIsOnMessagesPage } = useMessageNotification()
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const selectedConversationRef = useRef(null)
  const processedMessagesRef = useRef(new Set())

  // Đồng bộ ref với state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  // Reset unreadCount và set isOnMessagesPage khi vào trang messages
  useEffect(() => {
    setIsOnMessagesPage(true)
    resetUnreadCount()

    return () => {
      setIsOnMessagesPage(false)
    }
  }, [resetUnreadCount, setIsOnMessagesPage])

  const updateConversationOrder = useCallback((conversationId) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId
          ? { ...c, timestamp: new Date().toLocaleString("vi-VN") }
          : c
      )
      updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      return [...updated]
    })
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      showError("No token found, cannot connect to socket")
      return
    }

    const newSocket = io(import.meta.env.VITE_SOCKET_IO_ENDPOINT, {
      transports: ['websocket'],
      query: { token: token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
    })

    newSocket.on("connect", () => {
      // Join vào tất cả conversations hiện có
      setConversations((prev) => {
        const joinedRooms = new Set()
        prev.forEach((conv) => {
          const convId = String(conv.id)
          if (convId && !joinedRooms.has(convId)) {
            try {
              newSocket.emit('joinRoom', convId)
              joinedRooms.add(convId)
            } catch (error) {
              console.error(`Error joining room ${convId}:`, error)
            }
          }
        })
        return prev
      })
    })

    newSocket.on("connect_error", (error) => {
      showError("Socket connection error:", error)
    })

    newSocket.on("disconnect", () => {

    })

    // Lắng nghe tin nhắn mới để cập nhật danh sách conversations
    // Sử dụng Set để tránh xử lý cùng một message nhiều lần
    const handleNewMessage = (data) => {
      try {
        const message = typeof data === "string" ? JSON.parse(data) : data

        // Validate message data
        if (!message || !message.conversationId) {
          console.warn('Invalid message format in conversation list:', message)
          return
        }

        const messageId = String(message.id || `${message.conversationId}-${message.createdDate}`)
        const messageConversationId = String(message.conversationId)

        // Nếu đã xử lý message này rồi, bỏ qua
        if (processedMessagesRef.current.has(messageId)) {
          return
        }
        processedMessagesRef.current.add(messageId)

        // Giới hạn size của Set để tránh memory leak
        if (processedMessagesRef.current.size > 200) {
          const firstId = processedMessagesRef.current.values().next().value
          processedMessagesRef.current.delete(firstId)
        }

        const currentUserId = getCurrentUserId()
        const isMe = message.sender?.userId === currentUserId
        const isViewingConversation = String(selectedConversationRef.current?.id) === messageConversationId

        // Cập nhật conversation trong danh sách
        setConversations((prev) => {
          const conversationIndex = prev.findIndex(c => String(c.id) === messageConversationId)

          if (conversationIndex === -1) {
            // Nếu conversation chưa có trong danh sách, không làm gì
            // Có thể là conversation mới, sẽ được thêm khi fetch lại
            return prev
          }

          const updated = [...prev]
          const conversation = updated[conversationIndex]

          // Chỉ tăng unread nếu:
          // 1. Tin nhắn không phải từ chính user
          // 2. User không đang xem conversation này
          const shouldIncreaseUnread = !isMe && !isViewingConversation
          const newUnread = shouldIncreaseUnread
            ? (conversation.unread || 0) + 1
            : (isMe || isViewingConversation ? 0 : conversation.unread || 0)

          // Cập nhật lastMessage, timestamp và unread count
          updated[conversationIndex] = {
            ...conversation,
            lastMessage: message.message || conversation.lastMessage,
            timestamp: new Date().toLocaleString('vi-VN'),
            unread: newUnread
          }

          // Sắp xếp lại: conversation có tin nhắn mới lên đầu
          updated.sort((a, b) => {
            if (String(a.id) === messageConversationId) return -1
            if (String(b.id) === messageConversationId) return 1
            return new Date(b.timestamp) - new Date(a.timestamp)
          })

          return updated
        })

        // Nếu đang xem conversation này, cập nhật luôn selectedConversation và reset unread
        setSelectedConversation((prev) => {
          if (prev && String(prev.id) === messageConversationId) {
            return {
              ...prev,
              lastMessage: message.message || prev.lastMessage,
              timestamp: new Date().toLocaleString('vi-VN'),
              unread: 0
            }
          }
          return prev
        })
      } catch (error) {
        console.error('Error handling new message in conversation list:', error)
      }
    }

    newSocket.on('message', handleNewMessage)

    setSocket(newSocket)

    return () => {
      if (newSocket.connected) {
        newSocket.off('message', handleNewMessage)
        newSocket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getMyConversations()
        const normalized = (res.data.data || []).map((c) => {
          const other = (c.participants || []).find(p => p.userId !== getCurrentUserId())
          const name = other?.fullName || c.conversationName || 'Chưa đặt tên'
          const avatar = other?.avatar || c.conversationAvatar || 'U'
          return {
            id: c.id,
            name,
            avatar,
            lastMessage: c.lastMessage || 'Chưa có tin nhắn',
            timestamp: c.modifiedDate ? new Date(c.modifiedDate).toLocaleString('vi-VN') : '',
            unread: 0,
          }
        })
        setConversations(normalized)

        // Join vào tất cả conversations sau khi fetch xong
        if (socket && socket.connected) {
          const joinedRooms = new Set()
          normalized.forEach((conv) => {
            const convId = String(conv.id)
            if (convId && !joinedRooms.has(convId)) {
              try {
                socket.emit('joinRoom', convId)
                joinedRooms.add(convId)
              } catch (error) {
                console.error(`Error joining room ${convId}:`, error)
              }
            }
          })
        }
      } catch (error) {
        showError("Error fetching conversations:", error)
      }
    }
    fetchConversations()
  }, [socket])

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return
    const confirm = window.confirm("Bạn có chắc muốn xóa cuộc hội thoại này?")
    if (!confirm) return
    try {
      await deleteConversation(conversationId)
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
      showSuccess("Đã xóa cuộc hội thoại.")
    } catch {
      showError("Không thể xóa cuộc hội thoại.")
    }
  }

  const handleSelectConversation = (conversation) => {
    // Reset unread count khi chọn conversation
    setConversations((prev) => {
      return prev.map((c) => {
        if (c.id === conversation.id) {
          return { ...c, unread: 0 }
        }
        return c
      })
    })
    setSelectedConversation(conversation)
  }

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <div className="flex-1 bg-white">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            socket={socket}
            onMessageSent={updateConversationOrder}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
              <p className="text-sm">Để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
