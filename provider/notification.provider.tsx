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
        // The notification service initialization is now handled in useSocket
        // when the socket connects, so we don't need to do anything here
        console.log("NotificationProvider mounted, socket:", socket?.connected);
    }, [socket]);


    return (
        <>
            {children}
            <PopupNotificationManager />
        </>
    );
};

export default NotificationProvider;
