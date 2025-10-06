# Team Chat System

## Overview
A WhatsApp-style chat interface integrated with the Early Alert Network system. The chat system maintains persistent sidebar navigation, allowing users to seamlessly switch between contacts and other system modules.

## Key Features

### ✅ Persistent Sidebar Navigation
- The sidebar remains visible at all times
- Quick access to all system modules
- Mobile-responsive design with collapsible sidebar

### ✅ Real-time Messaging
- Instant message delivery
- Typing indicators
- Message timestamps
- Read receipts
- Auto-scroll to latest messages

### ✅ Team Management
- Organized contact lists with role-based priorities
- Online/offline status indicators
- Unread message counters
- Search functionality

### ✅ Priority System
- **High Priority (Red)**: Emergency Response Team
- **Medium Priority (Yellow)**: Security Operations, Analysis Team
- **Low Priority (Green)**: Data Collection Unit

## File Structure

```
client/src/
├── pages/
│   ├── chat-page.tsx           # Main chat interface
│   └── chat-demo-page.tsx      # Demo/explanation page
├── components/layout/
│   ├── ChatLayout.tsx          # Layout wrapper with sidebar
│   └── Sidebar.tsx             # Updated with chat link
└── App.tsx                     # Routes configuration
```

## Usage

### Access the Chat System
1. Navigate to `/chat` in your application
2. Or click "Team Chat" in the sidebar under Communications

### Demo Page
Visit `/chat-demo` to see a detailed explanation of the chat system features.

## Technical Implementation

### Layout Structure
```tsx
<ChatLayout title="Team Chat">
  <div className="flex h-full bg-gray-100">
    {/* Contact List Sidebar */}
    <div className="w-1/3 bg-white border-r">
      {/* Contact list with search */}
    </div>
    
    {/* Chat Area */}
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      {/* Messages area */}
      {/* Message input */}
    </div>
  </div>
</ChatLayout>
```

### Key Components

#### ChatLayout
- Wraps the chat interface with persistent sidebar
- Maintains navigation consistency
- Handles mobile responsiveness

#### Contact List
- Displays all team contacts
- Shows priority indicators
- Includes search functionality
- Shows online/offline status

#### Chat Interface
- Real-time message display
- Message input with send functionality
- Typing indicators
- Auto-scroll behavior

## Customization

### Adding New Contacts
Update the `mockContacts` array in `chat-page.tsx`:

```tsx
const mockContacts = [
  {
    id: 6,
    name: "New Team",
    lastMessage: "Latest message",
    timestamp: "1 min ago",
    unreadCount: 0,
    isOnline: true,
    avatar: null,
    status: "Active",
    role: "new_team",
    priority: "medium"
  }
];
```

### Adding New Message Types
Extend the `Message` interface:

```tsx
interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'file' | 'location';
  // Add new properties as needed
}
```

### Styling Customization
The chat system uses Tailwind CSS classes. Key classes:
- `bg-blue-50` - Selected contact background
- `border-l-4` - Priority indicator border
- `text-red-500` - High priority color
- `text-yellow-500` - Medium priority color
- `text-green-500` - Low priority color

## Integration with Backend

The chat system is designed to integrate with your existing backend:

1. **WebSocket Connection**: For real-time messaging
2. **API Endpoints**: For message history and contact management
3. **Authentication**: Uses existing auth system
4. **Database**: Stores messages and contacts

## Mobile Responsiveness

- Sidebar collapses on mobile devices
- Touch-friendly interface
- Responsive message layout
- Mobile-optimized input area

## Future Enhancements

- [ ] Real WebSocket integration
- [ ] File sharing capabilities
- [ ] Voice messages
- [ ] Video calls
- [ ] Message encryption
- [ ] Group chats
- [ ] Message reactions
- [ ] Message search
- [ ] Message archiving

## Troubleshooting

### Sidebar Not Showing
- Ensure you're using `ChatLayout` instead of `MainLayout`
- Check that the sidebar component is properly imported

### Messages Not Sending
- Verify the `handleSendMessage` function is working
- Check console for any JavaScript errors

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes

## Support

For issues or questions about the chat system, refer to the main application documentation or contact the development team.
