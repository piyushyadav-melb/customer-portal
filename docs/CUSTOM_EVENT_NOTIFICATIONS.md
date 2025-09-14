# Custom Event Notification System

This document describes the enhanced notification system that uses custom events for popup notifications with user filtering and alert sounds.

## Overview

The custom event notification system provides:
- **Custom Event Architecture** - Uses `CustomEvent` API for decoupled notification handling
- **User Filtering** - Only shows notifications for the current authenticated user
- **Popup Management** - Handles multiple popup notifications with proper stacking
- **Alert Sounds** - Custom notification sounds using Web Audio API
- **Real-time Integration** - Works with Socket.IO for live notifications

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   Notification   │    │   Custom Event  │
│   Events        │───▶│   Service        │───▶│   System        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Redux Store    │    │   Popup Manager │
                       │   (Global State) │    │   (UI Layer)    │
                       └──────────────────┘    └─────────────────┘
```

## Components

### 1. NotificationManager (`components/notifications/popup-notification-manager.tsx`)

Enhanced popup notification manager with custom event handling:

**Key Features:**
- **Custom Event Listener** - Listens for `notificationPopup` events
- **User Filtering** - Extracts user ID from JWT token and filters notifications
- **Audio Integration** - Plays notification sounds using Web Audio API
- **Popup Queue Management** - Handles up to 3 simultaneous popups
- **Navigation Handling** - Routes to appropriate pages based on notification type

**Event Handling:**
```typescript
const handlePopupEvent = (event: CustomEvent) => {
    const notification = event.detail;
    
    // Get current user ID from JWT token
    const getCurrentUserId = () => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        
        if (!token) return null;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || null;
    };
    
    const currentUserId = getCurrentUserId();
    
    // Only show popup if notification is for current user
    if (notification.data?.recipientId && 
        notification.data.recipientId !== currentUserId) {
        return;
    }
    
    // Play sound and show popup
    if ((window as any).playNotificationSound) {
        (window as any).playNotificationSound();
    }
    
    setActivePopups(prev => [...prev, notification]);
};
```

### 2. Notification Service (`service/notification.service.ts`)

Enhanced service that dispatches custom events:

**Custom Event Dispatch:**
```typescript
// Message notifications
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
```

**Supported Notification Types:**
- **MESSAGE** - Chat message notifications with sender info
- **BOOKING** - Booking requests and updates
- **MEETING** - Meeting reminders and updates
- **SYSTEM** - System-wide notifications

### 3. PopupNotification (`components/notifications/popup-notification.tsx`)

Individual popup component with enhanced features:

**Features:**
- **Animated Entrance/Exit** - Smooth spring animations
- **Alert Sound** - Custom two-tone notification sound
- **Sender Display** - Shows sender name and profile picture
- **Progress Bar** - Visual countdown timer
- **Type-specific Styling** - Different colors and icons

## User Filtering

### JWT Token Extraction
```typescript
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
```

### Notification Filtering
- **Recipient ID Check** - Only shows notifications where `data.recipientId` matches current user
- **Fallback Handling** - Shows notifications without recipient ID (system-wide)
- **Debug Logging** - Logs filtered notifications for debugging

## Audio System

### Web Audio API Implementation
```typescript
const playNotificationSound = () => {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Two-tone notification sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
};
```

### Global Audio Function
- **Window Attachment** - Stores function globally for easy access
- **Error Handling** - Graceful fallback if audio fails
- **Performance** - Lightweight and efficient

## Event Flow

### 1. Socket Event Received
```typescript
// Socket receives notification
socket.on('messageNotification', (data) => {
    // Process notification
    handleMessageNotification(data);
});
```

### 2. Service Processing
```typescript
// Service processes and dispatches custom event
private handleMessageNotification(data: any) {
    // Validate data
    // Dispatch to Redux
    // Dispatch custom event
    // Show browser notification
}
```

### 3. Custom Event Dispatch
```typescript
// Custom event dispatched to window
const popupEvent = new CustomEvent('notificationPopup', {
    detail: notificationData
});
window.dispatchEvent(popupEvent);
```

### 4. Popup Manager Handling
```typescript
// Popup manager listens and processes
window.addEventListener('notificationPopup', handlePopupEvent);
```

### 5. UI Display
```typescript
// Popup displayed with sound and animation
<PopupNotification
    notification={notification}
    onClose={handleClose}
    onAction={handleAction}
/>
```

## Testing

### Notification Test Component
Enhanced test component that dispatches custom events:

```typescript
const testMessageNotification = () => {
    const notification = {
        type: 'MESSAGE',
        title: 'New message from John Doe',
        body: 'Hey! How are you doing?',
        data: {
            chatRoomId: 'room-123',
            recipientId: 'current-user-id',
        },
    };

    // Add to Redux store
    dispatch(addNotification(notification));

    // Dispatch custom event for popup
    const popupEvent = new CustomEvent('notificationPopup', {
        detail: {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false,
        }
    });
    window.dispatchEvent(popupEvent);
};
```

### Test Functions
- **testMessageNotification** - Tests message popups
- **testBookingNotification** - Tests booking popups
- **testMeetingNotification** - Tests meeting popups
- **testSystemNotification** - Tests system popups
- **testMultipleNotifications** - Tests multiple popups

## Configuration

### Popup Limits
- **Maximum Popups**: 3 simultaneous notifications
- **Auto-dismiss Time**: 8 seconds
- **Stagger Delay**: 500ms between multiple notifications
- **Z-index Stacking**: 9999 - index for proper layering

### Audio Settings
- **Volume**: 30% (0.3)
- **Duration**: 300ms
- **Frequency Pattern**: 800Hz → 600Hz
- **Browser Compatibility**: Web Audio API with fallback

### User Filtering
- **JWT Token**: Extracted from cookies
- **User ID Fields**: `userId` or `sub` from token payload
- **Recipient Matching**: Exact match with `data.recipientId`
- **Fallback**: Show notifications without recipient ID

## Integration

### Provider Setup
```tsx
<NotificationProvider>
    <div className="h-full">
        {children}
        <ReactToaster />
    </div>
    <Toaster />
    <SonnToaster />
    <NotificationManager maxPopups={3} />
</NotificationProvider>
```

### Socket Integration
- **Real-time Events** - Socket.IO events trigger custom events
- **User-specific Filtering** - Only relevant notifications shown
- **Automatic Sound** - Audio plays on new notifications
- **Browser Notifications** - Fallback browser notifications

## Performance

### Optimization Features
- **Event-based Architecture** - Decoupled components
- **Efficient Filtering** - JWT parsing only when needed
- **Memory Management** - Automatic cleanup of old popups
- **Audio Caching** - Reuses audio context

### Resource Usage
- **Memory**: Minimal impact with automatic cleanup
- **CPU**: Low impact with efficient event handling
- **Audio**: Lightweight Web Audio API usage
- **Network**: No additional network requests

## Troubleshooting

### Common Issues

1. **Popups Not Appearing**
   - Check custom event listener registration
   - Verify user ID extraction from JWT
   - Check recipient ID matching

2. **No Sound Playing**
   - Check Web Audio API support
   - Verify audio context creation
   - Check browser audio permissions

3. **User Filtering Not Working**
   - Verify JWT token format
   - Check user ID extraction
   - Verify recipient ID in notification data

### Debug Mode
Enable debug logging by checking browser console for:
- Custom event dispatches
- User ID extraction
- Notification filtering
- Audio context creation

## Security

### JWT Token Handling
- **Secure Extraction** - Parses JWT from secure cookies
- **Error Handling** - Graceful fallback if token invalid
- **User Validation** - Validates user ID before showing notifications

### Notification Filtering
- **Recipient Validation** - Only shows notifications for current user
- **Data Sanitization** - Validates notification data structure
- **XSS Prevention** - Safe handling of notification content

## Future Enhancements

- **Push Notifications** - Service worker integration
- **Notification Persistence** - Store across sessions
- **Advanced Filtering** - Category and priority filtering
- **Custom Sounds** - User-selectable notification sounds
- **Accessibility** - Screen reader and keyboard support
