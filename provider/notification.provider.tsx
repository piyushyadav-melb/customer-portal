"use client";
import React, { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import notificationService from "@/service/notification.service";
import PopupNotificationManager from "@/components/notifications/popup-notification-manager";

interface NotificationProviderProps {
    children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            // Initialize notification service with socket
            const notificationServiceInstance = notificationService
            console.log('Notification service initialized with socket', notificationService);
            notificationService.initializeSocket(socket);

            // Request notification permission
            notificationService.requestNotificationPermission();

            // Cleanup on unmount
            return () => {
                notificationService.cleanup();
            };
        }
    }, [socket]);

    return (
        <>
            {children}
            <PopupNotificationManager />
        </>
    );
};

export default NotificationProvider;
