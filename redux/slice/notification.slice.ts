import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
    id: string;
    type: 'MESSAGE' | 'BOOKING' | 'MEETING' | 'SYSTEM';
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    data?: any;
    sender?: {
        id: string;
        name: string;
        profilePicture?: string;
        type: 'CUSTOMER' | 'EXPERT';
    };
    message?: {
        content: string;
        hasFile: boolean;
        fileType?: 'image' | 'video' | 'audio' | 'document' | null;
    };
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    lastNotificationTime: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    lastNotificationTime: null,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'timestamp'>>) => {
            const newNotification: Notification = {
                ...action.payload,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                read: false,
                timestamp: new Date().toISOString(),
            };

            // Add to beginning of array
            state.notifications.unshift(newNotification);

            // Increment unread count
            state.unreadCount += 1;

            // Update last notification time
            state.lastNotificationTime = newNotification.timestamp;

            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
                const removedNotification = state.notifications.pop();
                if (removedNotification && !removedNotification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },

        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },

        markAllAsRead: (state) => {
            state.notifications.forEach(notification => {
                notification.read = true;
            });
            state.unreadCount = 0;
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
            if (notificationIndex !== -1) {
                const notification = state.notifications[notificationIndex];
                if (!notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications.splice(notificationIndex, 1);
            }
        },

        clearAllNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },

        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },

        // Handle socket message notification
        handleMessageNotification: (state, action: PayloadAction<any>) => {
            const data = action.payload;
            const newNotification: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: 'MESSAGE',
                title: `New message from ${data.sender?.name || 'Unknown'}`,
                body: data.message?.content?.length > 50
                    ? `${data.message.content.substring(0, 50)}...`
                    : data.message?.content || 'New message',
                timestamp: new Date().toISOString(),
                read: false,
                data: {
                    chatRoomId: data.chatRoomId,
                    messageId: data.messageId,
                    senderId: data.sender?.id,
                    senderType: data.sender?.type,
                },
                sender: data.sender,
                message: data.message,
            };

            state.notifications.unshift(newNotification);
            state.unreadCount += 1;
            state.lastNotificationTime = newNotification.timestamp;

            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
                const removedNotification = state.notifications.pop();
                if (removedNotification && !removedNotification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },

        // Handle general notification
        handleGeneralNotification: (state, action: PayloadAction<any>) => {
            const data = action.payload;
            const newNotification: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: data.type || 'SYSTEM',
                title: data.title || 'New Notification',
                body: data.body || 'You have a new notification',
                timestamp: new Date().toISOString(),
                read: false,
                data: data.data,
            };

            state.notifications.unshift(newNotification);
            state.unreadCount += 1;
            state.lastNotificationTime = newNotification.timestamp;

            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
                const removedNotification = state.notifications.pop();
                if (removedNotification && !removedNotification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setConnectionStatus,
    handleMessageNotification,
    handleGeneralNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
