import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Chat, ChatMessage } from "@/types";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  chats: Chat[];
  messages: ChatMessage[];
  createChat: (wasteItemId: string, sellerId: string, sellerName: string) => Promise<Chat>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  getChatMessages: (chatId: string) => ChatMessage[];
  getUserChats: () => Chat[];
  getTotalUnreadCount: () => number;
  getChatById: (chatId: string) => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const createChat = async (wasteItemId: string, sellerId: string, sellerName: string): Promise<Chat> => {
    if (!user) throw new Error("Usuário não autenticado");

    // Verifica se já existe um chat entre esses usuários para este resíduo
    const existingChat = chats.find(chat => 
      chat.wasteItemId === wasteItemId && 
      chat.buyerId === user.id && 
      chat.sellerId === sellerId
    );

    if (existingChat) {
      return existingChat;
    }

    const newChat: Chat = {
      id: `chat-${Math.random().toString(36).substring(2, 9)}`,
      wasteItemId,
      buyerId: user.id,
      buyerName: user.name,
      sellerId,
      sellerName,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChats(prev => [...prev, newChat]);
    return newChat;
  };

  const sendMessage = async (chatId: string, message: string): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado");

    const chat = chats.find(c => c.id === chatId);
    if (!chat) throw new Error("Chat não encontrado");

    const newMessage: ChatMessage = {
      id: `message-${Math.random().toString(36).substring(2, 9)}`,
      chatId,
      senderId: user.id,
      senderName: user.name,
      message,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Atualiza o chat com a última mensagem
    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { 
            ...c, 
            lastMessage: message, 
            lastMessageTime: new Date(),
            unreadCount: user.id === c.sellerId ? c.unreadCount : c.unreadCount + 1,
            updatedAt: new Date()
          }
        : c
    ));
  };

  const markMessagesAsRead = async (chatId: string): Promise<void> => {
    if (!user) return;

    setMessages(prev => prev.map(message => 
      message.chatId === chatId && message.senderId !== user.id 
        ? { ...message, isRead: true }
        : message
    ));

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));
  };

  const getChatMessages = (chatId: string): ChatMessage[] => {
    return messages
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getUserChats = (): Chat[] => {
    if (!user) return [];
    
    return chats
      .filter(chat => chat.buyerId === user.id || chat.sellerId === user.id)
      .sort((a, b) => {
        const aTime = a.lastMessageTime || a.createdAt;
        const bTime = b.lastMessageTime || b.createdAt;
        return bTime.getTime() - aTime.getTime();
      });
  };

  const getTotalUnreadCount = (): number => {
    if (!user) return 0;
    
    return chats
      .filter(chat => chat.buyerId === user.id || chat.sellerId === user.id)
      .reduce((total, chat) => {
        // Se o usuário é o vendedor, conta as mensagens não lidas do comprador
        // Se o usuário é o comprador, conta as mensagens não lidas do vendedor
        const unreadMessages = messages.filter(message => 
          message.chatId === chat.id && 
          message.senderId !== user.id && 
          !message.isRead
        );
        return total + unreadMessages.length;
      }, 0);
  };

  const getChatById = (chatId: string): Chat | undefined => {
    return chats.find(chat => chat.id === chatId);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      createChat,
      sendMessage,
      markMessagesAsRead,
      getChatMessages,
      getUserChats,
      getTotalUnreadCount,
      getChatById
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}