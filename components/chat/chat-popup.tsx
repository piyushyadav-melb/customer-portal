"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import {
  createOrGetChatRoom,
  getChatHistory,
  type ChatRoom,
  type Message,
} from "@/service/chat.service";
import { useSocket } from "@/hooks/use-socket";
import Image from "next/image";
import { toast } from "sonner";

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  expert: {
    id: string;
    name: string;
    profile_picture_url: string;
  };
}
const CURRENT_USER_ID = "CURRENT_USER_ID"; // Replace with actual user ID from auth

export const ChatPopup = ({ isOpen, onClose, expert }: ChatPopupProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on("newMessage", (message: Message) => {
        if (message.chatRoomId === roomId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      // Listen for typing indicators
      socket.on("userTyping", (data) => {
        if (data.userId === expert.id) {
          // Handle typing indicator UI
          console.log("Expert is typing:", data.isTyping);
        }
      });

      // Listen for read receipts
      socket.on("messagesRead", (data) => {
        if (data.chatRoomId === roomId) {
          // Handle read receipts UI
          console.log("Messages read by:", data.readBy);
        }
      });

      return () => {
        socket.off("newMessage");
        socket.off("userTyping");
        socket.off("messagesRead");
      };
    }
  }, [socket, expert.id, roomId]);

  // Join the chat room when socket or roomId changes
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("joinChat", { chatRoomId: roomId, userId: CURRENT_USER_ID });
    }
  }, [socket, roomId]);

  const initializeChat = async () => {
    try {
      // setIsLoading(true);
      const room = await createOrGetChatRoom(expert.id);
      setRoomId(room.id);

      const response = await getChatHistory(room.id);
      console.log(response);
      if (response?.length > 0) {
        setMessages(response);
      }

      if (socket) {
        // Join chat room
        const socketResponse = await socket.emitWithAck("joinChat", {
          customerId: "CURRENT_USER_ID", // Replace with actual user ID
          expertId: expert.id,
        });

        if (socketResponse?.chatRoom) {
          setRoomId(socketResponse.chatRoom.id);
        }
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to load chat history");
    } finally {
      // setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      // Emit message through socket
      if (socket) {
        const message = await socket.emitWithAck("sendMessage", {
          chatRoomId: roomId,
          senderId: "CURRENT_USER_ID", // Replace with actual user ID
          senderType: "CUSTOMER",
          content: newMessage,
        });

        if (message) {
          // setMessages((prev) => [...prev, message]);
          setNewMessage("");
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && roomId) {
      socket.emit("typing", {
        chatRoomId: roomId,
        isTyping,
        userId: "CURRENT_USER_ID", // Replace with actual user ID
      });
    }
  };

  const markMessagesAsRead = () => {
    if (socket && roomId) {
      socket.emit("markAsRead", {
        chatRoomId: roomId,
        receiverId: "CURRENT_USER_ID", // Replace with actual user ID
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={expert.profile_picture_url}
                alt={expert.name}
                fill
                className="object-cover"
              />
            </div>
            Chat with {expert.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === "EXPERT"
                  ? "justify-start"
                  : "justify-end"
                  }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${message.senderType === "EXPERT"
                    ? "bg-gray-100"
                    : "bg-primary text-white"
                    }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(true);
              }}
              onBlur={() => handleTyping(false)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
