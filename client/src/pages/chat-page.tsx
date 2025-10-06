import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatLayout from '@/components/layout/ChatLayout';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search, 
  Paperclip, 
  Smile, 
  Mic,
  ArrowLeft,
  MessageCircle,
  Users,
  Settings,
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Emergency Response Teams and Units
const responseTeams = [
  {
    id: 1,
    name: "Emergency Response Team",
    lastMessage: "CRITICAL: Armed conflict reported in Maiduguri",
    timestamp: "2 min ago",
    unreadCount: 3,
    isOnline: true,
    avatar: null,
    status: "Deployed",
    role: "emergency",
    priority: "critical",
    location: "Maiduguri, Borno State"
  },
  {
    id: 2,
    name: "Security Operations Center",
    lastMessage: "Patrol completed in Abuja - All clear",
    timestamp: "15 min ago",
    unreadCount: 0,
    isOnline: true,
    avatar: null,
    status: "Monitoring",
    role: "security",
    priority: "high",
    location: "Abuja, FCT"
  },
  {
    id: 3,
    name: "Data Collection Unit",
    lastMessage: "Satellite imagery shows displacement in Benue",
    timestamp: "1 hour ago",
    unreadCount: 1,
    isOnline: false,
    avatar: null,
    status: "Processing",
    role: "data",
    priority: "medium",
    location: "Remote Analysis"
  },
  {
    id: 4,
    name: "Risk Analysis Team",
    lastMessage: "Risk assessment: HIGH threat level in Plateau State",
    timestamp: "2 hours ago",
    unreadCount: 0,
    isOnline: false,
    avatar: null,
    status: "Analyzing",
    role: "analysis",
    priority: "high",
    location: "Analysis Center"
  },
  {
    id: 5,
    name: "Field Coordinators",
    lastMessage: "Team deployed to Kaduna - Establishing safe zones",
    timestamp: "3 hours ago",
    unreadCount: 2,
    isOnline: true,
    avatar: null,
    status: "On Ground",
    role: "field",
    priority: "critical",
    location: "Kaduna State"
  },
  {
    id: 6,
    name: "Medical Response Unit",
    lastMessage: "Medical supplies en route to affected areas",
    timestamp: "30 min ago",
    unreadCount: 1,
    isOnline: true,
    avatar: null,
    status: "Mobilized",
    role: "medical",
    priority: "high",
    location: "Multiple Locations"
  }
];

const emergencyMessages = {
  1: [
    {
      id: 1,
      sender: "Emergency Response Team",
      content: "CRITICAL ALERT: Armed conflict reported in Maiduguri. Multiple casualties. Requesting immediate backup.",
      timestamp: "10:30 AM",
      isOwn: false,
      type: "alert"
    },
    {
      id: 2,
      sender: "You",
      content: "What's the casualty count and threat level?",
      timestamp: "10:31 AM",
      isOwn: true,
      type: "text"
    },
    {
      id: 3,
      sender: "Emergency Response Team",
      content: "5 confirmed casualties, 12 injured. Threat level: CRITICAL. Armed groups still active in area.",
      timestamp: "10:32 AM",
      isOwn: false,
      type: "alert"
    },
    {
      id: 4,
      sender: "You",
      content: "Deploying medical response unit and security reinforcements. ETA 15 minutes.",
      timestamp: "10:33 AM",
      isOwn: true,
      type: "text"
    }
  ],
  2: [
    {
      id: 1,
      sender: "Security Operations Center",
      content: "Patrol completed in Abuja. All areas secure. No threats detected.",
      timestamp: "10:15 AM",
      isOwn: false,
      type: "status"
    }
  ],
  5: [
    {
      id: 1,
      sender: "Field Coordinators",
      content: "Team deployed to Kaduna. Establishing safe zones and evacuation routes.",
      timestamp: "09:45 AM",
      isOwn: false,
      type: "status"
    },
    {
      id: 2,
      sender: "You",
      content: "What's the current situation on ground?",
      timestamp: "09:46 AM",
      isOwn: true,
      type: "text"
    },
    {
      id: 3,
      sender: "Field Coordinators",
      content: "Civilians being evacuated from conflict zones. Safe zones established at 3 locations.",
      timestamp: "09:47 AM",
      isOwn: false,
      type: "status"
    }
  ]
};

interface ResponseTeam {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar: string | null;
  status: string;
  role: string;
  priority: string;
  location: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'alert' | 'status' | 'image' | 'file';
}

export default function ChatPage() {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<ResponseTeam | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [teams] = useState<ResponseTeam[]>(responseTeams);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load messages when team is selected
  useEffect(() => {
    if (selectedTeam) {
      const teamMessages = emergencyMessages[selectedTeam.id as keyof typeof emergencyMessages] || [];
      setMessages(teamMessages as Message[]);
    }
  }, [selectedTeam]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedTeam) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        sender: selectedTeam.name,
        content: "Message received. Coordinating response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        type: 'status'
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);

    toast({
      title: "Message sent",
      description: `Message sent to ${selectedTeam.name}`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      case 'medium':
        return <Activity className="h-3 w-3 text-yellow-500" />;
      case 'low':
        return <Shield className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-600 bg-red-100';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <ChatLayout title="Emergency Communications">
      <div className="flex h-full bg-gray-100">
        {/* Sidebar - Response Teams */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Response Teams</h1>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teams or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Response Teams List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors border-l-4",
                  selectedTeam?.id === team.id
                    ? getPriorityColor(team.priority)
                    : "hover:bg-gray-50 border-l-transparent"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={team.avatar || undefined} />
                    <AvatarFallback>
                      {team.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {team.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {team.name}
                      </h3>
                      {getPriorityIcon(team.priority)}
                    </div>
                    <span className="text-xs text-gray-500">{team.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{team.lastMessage}</p>
                    {team.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {team.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <div className={cn(
                        "h-2 w-2 rounded-full mr-2",
                        team.isOnline ? "bg-green-500" : "bg-gray-400"
                      )}></div>
                      <span className="text-xs text-gray-500">{team.status}</span>
                    </div>
                    <span className="text-xs text-gray-400 truncate max-w-32">{team.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        </div>

        {/* Emergency Communications Area */}
      <div className="flex-1 flex flex-col">
        {selectedTeam ? (
          <>
            {/* Team Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden mr-2"
                    onClick={() => setSelectedTeam(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedTeam.avatar || undefined} />
                      <AvatarFallback>
                        {selectedTeam.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedTeam.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedTeam.name}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedTeam.status} • {selectedTeam.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        msg.isOwn
                          ? "bg-blue-500 text-white"
                          : msg.type === 'alert'
                          ? "bg-red-100 text-red-900 border border-red-200"
                          : msg.type === 'status'
                          ? "bg-green-100 text-green-900 border border-green-200"
                          : "bg-gray-200 text-gray-900"
                      )}
                    >
                      {msg.type === 'alert' && (
                        <div className="flex items-center mb-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span className="text-xs font-semibold">ALERT</span>
                        </div>
                      )}
                      {msg.type === 'status' && (
                        <div className="flex items-center mb-1">
                          <Activity className="h-3 w-3 mr-1" />
                          <span className="text-xs font-semibold">STATUS</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.isOwn ? "text-blue-100" : "text-gray-500"
                      )}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type emergency message or status update..."
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Team Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a response team to begin communication
              </h3>
              <p className="text-gray-500">
                Choose a response team from the sidebar to coordinate emergency operations
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </ChatLayout>
  );
}
