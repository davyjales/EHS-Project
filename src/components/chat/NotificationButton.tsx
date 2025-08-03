import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { MessageCircle, Bell } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/types";

interface NotificationButtonProps {
  onChatSelect: (chat: Chat) => void;
}

export function NotificationButton({ onChatSelect }: NotificationButtonProps) {
  const { user } = useAuth();
  const { getUserChats, getTotalUnreadCount } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const userChats = getUserChats();
  const totalUnreadCount = getTotalUnreadCount();

  const handleChatClick = (chat: Chat) => {
    onChatSelect(chat);
    setIsOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[20px]"
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="bottom"
      >
        <div className="p-3 border-b">
          <h4 className="font-medium flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas
          </h4>
        </div>
        
        <ScrollArea className="max-h-96">
          {userChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {userChats.map((chat) => {
                const otherUser = user.id === chat.buyerId ? chat.sellerName : chat.buyerName;
                const hasUnread = chat.unreadCount > 0;
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer rounded-md transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${hasUnread ? "font-semibold" : "font-medium"}`}>
                          {otherUser}
                        </p>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      
                      {chat.lastMessage && (
                        <p className={`text-xs text-muted-foreground truncate mt-1 ${
                          hasUnread ? "font-medium" : ""
                        }`}>
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                    
                    {hasUnread && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}