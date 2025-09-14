"use client";
import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { notificationService } from '@/service/notification.service';

interface NotificationProviderProps {
    children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const socket = useSocket();
    const isInitialized = useRef(false);

    useEffect(() => {
        // Initialize notification service when socket is available
        if (socket && !isInitialized.current) {
            notificationService.initialize(socket);
            isInitialized.current = true;
        }

        // Cleanup on unmount
        return () => {
            if (isInitialized.current) {
                notificationService.cleanup();
                isInitialized.current = false;
            }
        };
    }, [socket]);

    // Request notification permission on mount
    useEffect(() => {
        const requestNotificationPermission = async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    await Notification.requestPermission();
                } catch (error) {
                    console.log('Could not request notification permission:', error);
                }
            }
        };

        requestNotificationPermission();
    }, []);

    return <>{children}</>;
};

export default NotificationProvider;
