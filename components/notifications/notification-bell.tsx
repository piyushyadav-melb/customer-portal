"use client";
import React, { useState } from 'react';
import { Bell, X, Check, MessageCircle, Calendar, Video, Settings, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import {
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
} from "@/redux/slice/notification.slice";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
    const dispatch = useAppDispatch();
    const { notifications, unreadCount, isConnected } = useAppSelector(
        (state) => state.notification
    );
    const [isOpen, setIsOpen] = useState(false);

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

    // Filter notifications for current user only
    const currentUserId = getCurrentUserId();
    const filteredNotifications = notifications.filter(notification => {
        // For message notifications, check recipientId
        if (notification.type === 'MESSAGE' && notification.data?.recipientId) {
            const isForCurrentUser = notification.data.recipientId === currentUserId;
            if (!isForCurrentUser) {
            }
            return isForCurrentUser;
        }
        // For other notifications, check userId in data
        if (notification.data?.userId) {
            const isForCurrentUser = notification.data.userId === currentUserId;
            if (!isForCurrentUser) {
            }
            return isForCurrentUser;
        }
        // If no user filtering data, show the notification (fallback)
        return true;
    });

    // Calculate unread count for filtered notifications
    const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;


    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case 'BOOKING':
                return <Calendar className="w-4 h-4 text-green-500" />;
            case 'MEETING':
                return <Video className="w-4 h-4 text-purple-500" />;
            case 'SYSTEM':
                return <Settings className="w-4 h-4 text-gray-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'MESSAGE':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'BOOKING':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'MEETING':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            case 'SYSTEM':
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            dispatch(markAsRead(notification.id));
        }

        // Handle navigation based on notification type
        if (notification.type === 'MESSAGE' && notification.data?.chatRoomId) {
            window.location.href = `/chat?roomId=${notification.data.chatRoomId}`;
        } else if (notification.type === 'BOOKING') {
            window.location.href = '/bookings';
        } else if (notification.type === 'MEETING') {
            window.location.href = '/meetings';
        }

        setIsOpen(false);
    };

    const handleRemoveNotification = (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        dispatch(removeNotification(notificationId));
    };

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {filteredUnreadCount > 0 && (
                    <Badge
                        variant="soft"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                    >
                        {filteredUnreadCount > 9 ? '9+' : filteredUnreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>

                        </div>
                        <div className="flex space-x-1">
                            {filteredUnreadCount > 0 && (
                                <Button
                                    variant="soft"
                                    size="sm"
                                    onClick={() => dispatch(markAllAsRead())}
                                    className="text-xs"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            {filteredNotifications.length > 0 && (
                                <Button
                                    variant="soft"
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="text-xs text-red-400 hover:text-red-500"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />

                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                <Bell className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start space-x-3 p-3 cursor-pointer rounded-lg border transition-colors group",
                                            !notification.read && getNotificationColor(notification.type),
                                            "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.read && "font-semibold"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.body}
                                            </p>

                                            {notification.sender && (
                                                <div className="flex items-center space-x-2 mt-2">
                                                    {notification.sender.profilePicture && (
                                                        <img
                                                            src={notification.sender.profilePicture}
                                                            alt={notification.sender.name}
                                                            className="w-4 h-4 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {notification.sender.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleRemoveNotification(notification.id, e)}
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/20"
                                        >
                                            <X className="w-3 h-3 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
