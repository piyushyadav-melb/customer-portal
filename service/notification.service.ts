import { store } from '@/redux/store';
import {
    handleMessageNotification,
    handleGeneralNotification,
    setConnectionStatus
} from '@/redux/slice/notification.slice';

// Define payload types
interface MessageNotificationPayload {
    chatRoomId: string;
    sender: {
        name: string;
        profilePicture?: string;
    };
    message: {
        content: string;
    };
    messageId: string;
    recipientId: string;
}

interface GeneralNotificationPayload {
    title: string;
    type: string;
    body?: string;
    userId: string;
    data?: any;
}

class NotificationService {
    private static instance: NotificationService;
    private socket: any = null;
    private isInitialized = false;

    private constructor() {
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public initializeSocket(socket: any) {
        if (this.isInitialized) {
            console.log('Notification service already initialized');
            return;
        }

        this.socket = socket;
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Notification service initialized with socket');
    }

    public requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return Notification.requestPermission();
        }
        return Promise.resolve(Notification.permission);
    }

    private setupEventListeners() {
        if (!this.socket) {
            console.error('Socket not available for notification service');
            return;
        }

        // Handle socket connection status
        this.socket.on('connect', () => {
            console.log('Socket connected for notifications');
            store.dispatch(setConnectionStatus(true));
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected for notifications');
            store.dispatch(setConnectionStatus(false));
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('Socket connection error for notifications:', error);
            store.dispatch(setConnectionStatus(false));
        });

        // Handle message notifications
        // this.socket.on('messageNotification', (payload: MessageNotificationPayload) => {
        //     this.handleMessageNotification(payload);
        // });

        // Handle general notifications
        this.socket.on('notification', (payload: GeneralNotificationPayload) => {
            this.handleGeneralNotification(payload);
        });

        // Handle booking notifications
        this.socket.on('bookingNotification', (payload: any) => {
            this.handleBookingNotification(payload);
        });

        // Handle meeting notifications
        this.socket.on('meetingNotification', (payload: any) => {
            this.handleMeetingNotification(payload);
        });
    }

    /**
     * Handle message notification from socket
     */
    private handleMessageNotification(data: MessageNotificationPayload) {
        try {
            // Validate required fields
            if (!data.chatRoomId || !data.sender) {
                console.error('Invalid message notification data:', data);
                return;
            }

            // Dispatch to Redux store
            store.dispatch(handleMessageNotification(data));

            // Dispatch custom event for popup notification
            const popupEvent = new CustomEvent('notificationPopup', {
                detail: {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    type: 'MESSAGE',
                    title: `New message from ${data.sender.name}`,
                    body: data.message?.content || 'New message',
                    timestamp: new Date().toISOString(),
                    read: false,
                    data: {
                        chatRoomId: data.chatRoomId,
                        messageId: data.messageId,
                        senderName: data.sender.name,
                        recipientId: data.recipientId,
                    },
                    sender: data.sender,
                    message: data.message,
                }
            });
            window.dispatchEvent(popupEvent);

            // Show browser notification if permission granted
            this.showBrowserNotification({
                title: `New message from ${data.sender.name}`,
                body: data.message?.content || 'New message',
                icon: data.sender.profilePicture || '/favicon.ico',
                data: {
                    type: 'MESSAGE',
                    chatRoomId: data.chatRoomId,
                    messageId: data.messageId,
                    senderName: data.sender.name,
                },
            });

        } catch (error) {
            console.error('Error handling message notification:', error);
        }
    }

    /**
     * Handle general notification from socket
     */
    private handleGeneralNotification(data: GeneralNotificationPayload) {
        try {
            // Validate required fields
            if (!data.title || !data.type) {
                console.error('Invalid general notification data:', data);
                return;
            }

            // Dispatch to Redux store
            store.dispatch(handleGeneralNotification(data));

            // Dispatch custom event for popup notification
            const popupEvent = new CustomEvent('notificationPopup', {
                detail: {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    type: data.type,
                    title: data.title,
                    body: data.body || 'You have a new notification',
                    timestamp: new Date().toISOString(),
                    read: false,
                    data: {
                        ...data.data,
                        recipientId: data.userId,
                    },
                }
            });
            window.dispatchEvent(popupEvent);

            // Show browser notification if permission granted
            this.showBrowserNotification({
                title: data.title,
                body: data.body || 'You have a new notification',
                icon: '/favicon.ico',
                data: {
                    type: data.type,
                    ...data.data,
                },
            });

        } catch (error) {
            console.error('Error handling general notification:', error);
        }
    }

    /**
     * Handle booking notification from socket
     */
    private handleBookingNotification(data: any) {
        try {
            const notificationData = {
                type: 'BOOKING',
                title: data.title || 'New Booking Update',
                body: data.body || 'You have a new booking notification',
                data: data.data || {},
            };

            store.dispatch(handleGeneralNotification(notificationData));

            // Dispatch custom event for popup notification
            const popupEvent = new CustomEvent('notificationPopup', {
                detail: {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    type: 'BOOKING',
                    title: notificationData.title,
                    body: notificationData.body,
                    timestamp: new Date().toISOString(),
                    read: false,
                    data: {
                        ...notificationData.data,
                        recipientId: data.userId,
                    },
                }
            });
            window.dispatchEvent(popupEvent);

            this.showBrowserNotification({
                title: notificationData.title,
                body: notificationData.body,
                icon: '/favicon.ico',
                data: {
                    type: 'BOOKING',
                    ...notificationData.data,
                },
            });

        } catch (error) {
            console.error('Error handling booking notification:', error);
        }
    }

    /**
     * Handle meeting notification from socket
     */
    private handleMeetingNotification(data: any) {
        try {
            const notificationData = {
                type: 'MEETING',
                title: data.title || 'New Meeting Update',
                body: data.body || 'You have a new meeting notification',
                data: data.data || {},
            };

            store.dispatch(handleGeneralNotification(notificationData));

            // Dispatch custom event for popup notification
            const popupEvent = new CustomEvent('notificationPopup', {
                detail: {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    type: 'MEETING',
                    title: notificationData.title,
                    body: notificationData.body,
                    timestamp: new Date().toISOString(),
                    read: false,
                    data: {
                        ...notificationData.data,
                        recipientId: data.userId,
                    },
                }
            });
            window.dispatchEvent(popupEvent);

            this.showBrowserNotification({
                title: notificationData.title,
                body: notificationData.body,
                icon: '/favicon.ico',
                data: {
                    type: 'MEETING',
                    ...notificationData.data,
                },
            });

        } catch (error) {
            console.error('Error handling meeting notification:', error);
        }
    }

    /**
     * Show browser notification
     */
    private async showBrowserNotification(options: {
        title: string;
        body: string;
        icon?: string;
        data?: any;
    }) {
        try {
            // Check if notifications are supported
            if (!('Notification' in window)) {
                console.log('This browser does not support notifications');
                return;
            }

            // Request permission if not already granted
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }
            }

            // Don't show if permission denied
            if (Notification.permission !== 'granted') {
                return;
            }

            // Create and show notification
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/favicon.ico',
                data: options.data,
                tag: options.data?.type || 'general',
                requireInteraction: false,
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            // Handle click to navigate to relevant page
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();

                // Navigate based on notification type
                if (options.data?.type === 'MESSAGE' && options.data?.chatRoomId) {
                    window.location.href = `/chat?roomId=${options.data.chatRoomId}`;
                } else if (options.data?.type === 'BOOKING') {
                    window.location.href = '/bookings';
                } else if (options.data?.type === 'MEETING') {
                    window.location.href = '/meetings';
                }

                notification.close();
            };

        } catch (error) {
            console.error('Error showing browser notification:', error);
        }
    }

    /**
     * Cleanup event listeners
     */
    public cleanup() {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('connect_error');
            this.socket.off('messageNotification');
            this.socket.off('notification');
            this.socket.off('bookingNotification');
            this.socket.off('meetingNotification');
        }

        this.isInitialized = false;
        this.socket = null;
        console.log('Notification service cleaned up');
    }

    /**
     * Get current socket instance
     */
    public getSocket() {
        return this.socket;
    }

    /**
     * Check if service is initialized
     */
    public isServiceInitialized() {
        return this.isInitialized;
    }
}

// Export singleton instance
export const notificationService = NotificationService
export default notificationService;
