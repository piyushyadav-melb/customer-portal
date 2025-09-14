"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { markAsRead, removeNotification } from "@/redux/slice/notification.slice";
import PopupNotification from "./popup-notification";

interface NotificationManagerProps {
    maxPopups?: number;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
    maxPopups = 3
}) => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notification);
    const [activePopups, setActivePopups] = useState<any[]>([]);
    const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());
    const audioContextRef = useRef<AudioContext | null>(null);
    const [audioInitialized, setAudioInitialized] = useState(false);

    // Initialize audio context on first user interaction
    useEffect(() => {
        const initializeAudio = () => {
            if (!audioContextRef.current) {
                try {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                    setAudioInitialized(true);
                } catch (error) {
                    console.log('Could not create audio context:', error);
                }
            }
        };

        // Initialize audio on first user interaction
        const handleUserInteraction = () => {
            initializeAudio();
            // Remove listeners after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        // Add event listeners for user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, []);

    const playNotificationSound = () => {
        if (!audioInitialized || !audioContextRef.current) {
            console.log('Audio not initialized yet, skipping sound');
            return;
        }

        try {
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);

            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    };

    // Handle popup events from notification service
    useEffect(() => {
        const handlePopupEvent = (event: CustomEvent) => {
            const notification = event.detail;

            // Get current user ID for filtering
            const getCurrentUserId = () => {
                try {
                    const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

                    if (!token) return null;

                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.userId || payload.sub || null;
                } catch (error) {
                    console.error("Error extracting user ID:", error);
                    return null;
                }
            };

            const currentUserId = getCurrentUserId();

            // Only show popup if notification is for current user
            if (notification.data?.recipientId && notification.data.recipientId !== currentUserId) {
                return;
            }

            // Play notification sound
            playNotificationSound();

            // Add to active popups if we haven't reached the limit
            if (activePopups.length < maxPopups) {
                setActivePopups(prev => [...prev, notification]);
                setProcessedNotifications(prev => new Set([...prev, notification.id]));
            }
        };

        window.addEventListener('notificationPopup', handlePopupEvent as EventListener);

        return () => {
            window.removeEventListener('notificationPopup', handlePopupEvent as EventListener);
        };
    }, [activePopups.length, maxPopups, audioInitialized]);

    const handlePopupClose = (notificationId: string) => {
        setActivePopups(prev => prev.filter(notification => notification.id !== notificationId));
    };

    const handlePopupAction = (notification: any) => {
        // Navigate based on notification type
        if (notification.type === 'MESSAGE' && notification.data?.chatRoomId) {
            window.location.href = `/chat?room=${notification.data.chatRoomId}`;
        } else if (notification.type === 'BOOKING') {
            window.location.href = '/bookings';
        } else if (notification.type === 'MEETING') {
            window.location.href = '/meetings';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
            {activePopups.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{
                        transform: `translateY(${index * 20}px)`,
                        zIndex: 9999 - index,
                    }}
                >
                    <PopupNotification
                        notification={notification}
                        onClose={() => handlePopupClose(notification.id)}
                        onAction={() => handlePopupAction(notification)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationManager;
