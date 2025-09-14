# Popup Notification System

This document describes the popup notification system that displays real-time notifications with sender information and alert sounds.

## Overview

The popup notification system provides:
- **Real-time Popup Alerts** - Animated popups that appear in the top-right corner
- **Alert Sounds** - Custom notification sounds using Web Audio API
- **Sender Information** - Displays sender name and profile information
- **Auto-dismiss** - Notifications automatically disappear after 8 seconds
- **Click Navigation** - Click notifications to navigate to relevant pages
- **Multiple Notifications** - Supports up to 3 simultaneous popups

## Components

### 1. PopupNotification (`components/notifications/popup-notification.tsx`)

Individual popup notification component with:
- **Animated Entrance/Exit** - Smooth spring animations using Framer Motion
- **Alert Sound** - Custom two-tone notification sound
- **Sender Display** - Shows sender name and profile picture
- **Progress Bar** - Visual countdown timer
- **Type-specific Styling** - Different colors and icons for each notification type

**Features:**
- Auto-close after 8 seconds
- Click to navigate to relevant page
- Close button to dismiss manually
- Hover effects and scaling
- Dark/light theme support

### 2. PopupNotificationManager (`components/notifications/popup-notification-manager.tsx`)

Manages multiple popup notifications:
- **Queue Management** - Shows up to 3 notifications simultaneously
- **Auto-cleanup** - Removes old notifications automatically
- **Navigation Handling** - Routes to appropriate pages based on notification type
- **Z-index Management** - Proper layering of multiple popups

## Sound System

### Web Audio API Implementation
```typescript
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Create two-tone notification sound
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
  
  // Volume envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.6);
};
```

### Fallback Support
- **HTML5 Audio Fallback** - For older browsers that don't support Web Audio API
- **Silent Mode** - Gracefully handles cases where audio can't play
- **Volume Control** - Adjustable volume (currently set to 30%)

## Notification Types

### MESSAGE Notifications
- **Icon**: MessageCircle (blue)
- **Color**: Blue theme with left border
- **Navigation**: Routes to chat room
- **Sound**: Standard notification sound

### BOOKING Notifications
- **Icon**: Calendar (green)
- **Color**: Green theme with left border
- **Navigation**: Routes to bookings page
- **Sound**: Standard notification sound

### MEETING Notifications
- **Icon**: Video (purple)
- **Color**: Purple theme with left border
- **Navigation**: Routes to meetings page
- **Sound**: Standard notification sound

### SYSTEM Notifications
- **Icon**: Bell (orange)
- **Color**: Orange theme with left border
- **Navigation**: No specific navigation
- **Sound**: Standard notification sound

## Styling

### Color Themes
```css
/* MESSAGE */
border-l-blue-500 bg-blue-50 dark:bg-blue-900/20

/* BOOKING */
border-l-green-500 bg-green-50 dark:bg-green-900/20

/* MEETING */
border-l-purple-500 bg-purple-50 dark:bg-purple-900/20

/* SYSTEM */
border-l-orange-500 bg-orange-50 dark:bg-orange-900/20
```

### Animations
- **Entrance**: Slide in from right with scale effect
- **Exit**: Slide out to right with scale effect
- **Hover**: Scale up slightly (1.05x) with enhanced shadow
- **Progress Bar**: Linear countdown animation

## Integration

### Redux Integration
The popup system automatically listens to the Redux notification store:
```typescript
const { notifications } = useAppSelector((state) => state.notification);
```

### Socket Integration
Real-time notifications are received via Socket.IO and automatically trigger popups:
- `messageNotification` - Chat message notifications
- `notification` - General notifications
- `bookingNotification` - Booking updates
- `meetingNotification` - Meeting updates

### Global Provider
The popup manager is included in the main app provider:
```tsx
<NotificationProvider>
  <div className="h-full">
    {children}
    <ReactToaster />
  </div>
  <Toaster />
  <SonnToaster />
  <PopupNotificationManager />
</NotificationProvider>
```

## Usage

### Automatic Display
Popups are automatically displayed when:
1. New unread notifications are added to Redux store
2. Socket receives real-time notification events
3. User triggers test notifications

### Manual Testing
Use the NotificationTest component to test popups:
```tsx
import NotificationTest from '@/components/notifications/notification-test';

// Add to any page for testing
<NotificationTest />
```

### Custom Notifications
Add custom notifications programmatically:
```typescript
import { useAppDispatch } from '@/hooks';
import { addNotification } from '@/redux/slice/notification.slice';

const dispatch = useAppDispatch();

dispatch(addNotification({
  type: 'MESSAGE',
  title: 'New message from John Doe',
  body: 'Hello! How are you?',
  sender: {
    id: 'user-123',
    name: 'John Doe',
    profilePicture: 'https://example.com/avatar.jpg',
    type: 'CUSTOMER',
  },
  data: {
    chatRoomId: 'room-123',
    senderName: 'John Doe',
  },
}));
```

## Configuration

### Display Limits
- **Maximum Popups**: 3 simultaneous notifications
- **Auto-dismiss Time**: 8 seconds
- **Animation Duration**: 300ms for entrance/exit
- **Progress Bar Duration**: 8 seconds (matches auto-dismiss)

### Sound Settings
- **Volume**: 30% (0.3)
- **Duration**: 600ms
- **Frequency Pattern**: 800Hz → 1000Hz → 600Hz
- **Fallback**: HTML5 Audio with base64 encoded WAV

### Z-index Management
- **Popup Container**: 9999
- **Individual Popups**: 10000 - index (stacked)
- **Hover Effects**: Enhanced shadow and scale

## Browser Compatibility

### Web Audio API Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with webkit prefix)
- **Edge**: Full support

### Fallback Support
- **Older Browsers**: HTML5 Audio fallback
- **Mobile Browsers**: Graceful degradation
- **Silent Mode**: No errors if audio fails

## Performance

### Optimization Features
- **Efficient Rendering**: Only renders visible notifications
- **Memory Management**: Automatic cleanup of old notifications
- **Animation Performance**: Hardware-accelerated transforms
- **Sound Caching**: Reuses audio context for better performance

### Resource Usage
- **Memory**: Minimal impact with automatic cleanup
- **CPU**: Low impact with optimized animations
- **Audio**: Lightweight Web Audio API usage
- **Network**: No additional network requests

## Troubleshooting

### Common Issues

1. **No Sound Playing**
   - Check browser audio permissions
   - Verify Web Audio API support
   - Check console for audio errors

2. **Popups Not Appearing**
   - Verify Redux store is populated
   - Check notification provider is mounted
   - Ensure notifications are unread

3. **Animation Issues**
   - Check Framer Motion installation
   - Verify CSS transforms are supported
   - Check for conflicting styles

### Debug Mode
Enable debug logging by checking browser console for:
- Notification service logs
- Redux action dispatches
- Audio context creation
- Animation events

## Future Enhancements

- **Custom Sound Themes** - Different sounds for different notification types
- **Notification Persistence** - Store notifications across sessions
- **Advanced Animations** - More sophisticated entrance/exit effects
- **Mobile Optimizations** - Touch-friendly interactions
- **Accessibility** - Screen reader support and keyboard navigation
