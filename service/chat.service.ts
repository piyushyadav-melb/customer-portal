import { privateClient } from "@/http/http-client";

export interface ChatRoom {
  id: string;
  customerId: string;
  expertId: string;
  customer?: {
    id: string;
    name: string;
    profile_picture_url: string;
  };
  expert?: {
    id: string;
    name: string;
    profile_picture_url: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: "CUSTOMER" | "EXPERT";
  content: string;
  is_read: boolean;
  timestamp: string;
}

export const createOrGetChatRoom = async (expertId: string) => {
  const response = await privateClient.post("/chat/room", {
    expertId,
  });
  return response.data.data;
};

export const getChatRooms = async () => {
  const response = await privateClient.get("/chat/rooms");
  return response.data.data;
};

export const getChatHistory = async (roomId: string, page = 1, limit = 1000, searchText = "") => {
  const response = await privateClient.get(`/chat/room/${roomId}/messages`, {
    params: { page, limit: 1000, searchText },
  });
  return response.data.data;
};

export const sendMessage = async (roomId: string, content: string) => {
  const response = await privateClient.post(`/chat/room/${roomId}/messages`, {
    content,
  });
  return response.data.data;
};

export const markMessagesAsRead = async (roomId: string) => {
  const response = await privateClient.post(`/chat/room/${roomId}/mark-read`);
  return response.data;
};

export const getUnreadMessageCount = async () => {
  const response = await privateClient.get("/chat/unread-count");
  return response.data.data.unreadCount;
};

export const getChattedExperts = async () => {
  const response = await privateClient.get("/chat/experts");
  return response.data.data;
};

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileDescription: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  previewUrl: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByType: 'CUSTOMER' | 'EXPERT';
  createdAt: string;
}

export const uploadFile = async (
  file: File,
  fileType: 'image' | 'video' | 'audio' | 'document',
  fileDescription?: string
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  if (fileDescription) {
    formData.append('fileDescription', fileDescription);
  }

  const response = await privateClient.post("/file/customer/upload", formData);
  return response.data.data;
};


export interface ChatRoomFile {
  id: string;
  senderId: string;
  senderType: "CUSTOMER" | "EXPERT";
  timestamp: string;
  files: {
    imageLink?: string;
    videoLink?: string;
    audioLink?: string;
    documentLink?: string;
    fileName?: string;
  };
}

export const getChatRoomFiles = async (chatRoomId: string): Promise<ChatRoomFile[]> => {
  const response = await privateClient.get(`/chat/room/${chatRoomId}`);
  return response.data.data;
};

export const deleteChat = async (expertId: string, customerId: string) => {
  const response = await privateClient.delete(`/chat/experts/${expertId}/${customerId}`);
  return response.data;
};