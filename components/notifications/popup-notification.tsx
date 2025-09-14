"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Calendar, Video, Bell } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { markAsRead, removeNotification } from "@/redux/slice/notification.slice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface PopupNotificationProps {
    notification: any;
    onClose: () => void;
    onAction: () => void;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({
    notification,
    onClose,
    onAction,
}) => {
    const dispatch = useAppDispatch();
    const [isVisible, setIsVisible] = useState(true);

    // Play notification sound
    // useEffect(() => {
    //     const playNotificationSound = () => {
    //         try {
    //             // Create audio context for better browser compatibility
    //             const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    //             // Create a pleasant notification sound
    //             const oscillator = audioContext.createOscillator();
    //             const gainNode = audioContext.createGain();

    //             oscillator.connect(gainNode);
    //             gainNode.connect(audioContext.destination);

    //             // Create a two-tone notification sound
    //             oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    //             oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    //             oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);

    //             gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    //             gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    //             gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    //             oscillator.start(audioContext.currentTime);
    //             oscillator.stop(audioContext.currentTime + 0.6);
    //         } catch (error) {
    //             console.log('Could not play notification sound:', error);
    //             // Fallback to a simple beep using HTML5 audio
    //             try {
    //                 const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
    //                 audio.volume = 0.3;
    //                 audio.play().catch(() => {
    //                     // Ignore if audio can't play
    //                 });
    //             } catch (fallbackError) {
    //                 console.log('Fallback audio also failed:', fallbackError);
    //             }
    //         }
    //     };

    //     playNotificationSound();
    // }, []);

    // Auto close after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
        }, 8000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClick = () => {
        if (!notification.read) {
            dispatch(markAsRead(notification.id));
        }
        onAction();
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return <MessageCircle className="h-5 w-5 text-blue-600" />;
            case 'BOOKING':
                return <Calendar className="h-5 w-5 text-green-600" />;
            case 'MEETING':
                return <Video className="h-5 w-5 text-purple-600" />;
            case 'SYSTEM':
                return <Bell className="h-5 w-5 text-orange-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'BOOKING':
                return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
            case 'MEETING':
                return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
            case 'SYSTEM':
                return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
            default:
                return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 400, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 400, scale: 0.8 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    className={cn(
                        "fixed top-4 right-4 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 z-[9999] cursor-pointer transform transition-all duration-300 hover:shadow-3xl hover:scale-105",
                        getNotificationColor(notification.type)
                    )}
                    onClick={handleClick}
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {notification.title}
                                        </h4>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                        )}
                                    </div>

                                    {notification.sender?.name && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            From: <span className="font-medium">{notification.sender.name}</span>
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                                        {notification.body}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                        {notification.message?.hasFile && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                📎 {notification.message.fileType}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 8, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PopupNotification;
