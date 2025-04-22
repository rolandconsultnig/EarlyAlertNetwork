import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, RotateCcw, Brain, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Message type definition
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  className?: string;
}

const AiChat: React.FC<AiChatProps> = ({ className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Add a new message
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    addMessage('user', inputMessage);
    
    // Clear input field
    setInputMessage('');
    
    // Process with AI
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the OpenAI API
      // For now, we'll simulate a response after a delay
      setTimeout(() => {
        processAiResponse(inputMessage);
      }, 1500);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  // Process AI response (simulated)
  const processAiResponse = (userMessage: string) => {
    // This would normally be replaced with an actual API call
    let responseText = '';
    
    if (userMessage.toLowerCase().includes('risk')) {
      responseText = 'Based on our analysis of recent incidents in Nigeria, there are elevated risks in the northeastern region due to ongoing conflicts. The risk assessment indicates a 68% probability of further security incidents in the next 30 days.';
    } else if (userMessage.toLowerCase().includes('pattern') || userMessage.toLowerCase().includes('trend')) {
      responseText = 'I\'ve analyzed recent incident data and detected several patterns: 1) Increased frequency of incidents on market days in border communities, 2) Correlation between resource scarcity and intercommunal tensions, and 3) Seasonal patterns showing higher conflict rates during dry seasons.';
    } else if (userMessage.toLowerCase().includes('recommend') || userMessage.toLowerCase().includes('suggest')) {
      responseText = 'Based on current conflict indicators, I recommend: 1) Increasing community engagement in the Northeastern region, 2) Implementing early warning networks in vulnerable communities, and 3) Coordinating resource sharing agreements between farmer and herder communities prior to the dry season.';
    } else {
      responseText = 'I\'m your AI assistant for conflict analysis and early warning. I can help you analyze risk patterns, detect emerging threats, and provide recommendations for conflict prevention. How can I assist with your peace and security initiatives today?';
    }
    
    // Add AI response to messages
    addMessage('assistant', responseText);
    setIsProcessing(false);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    // Focus on input after clearing
    inputRef.current?.focus();
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardTitle className="text-xl flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          AI Assistant
        </CardTitle>
        <CardDescription className="text-purple-100">
          Interactive peace and security advisor powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[420px] p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">AI Peace & Security Assistant</h3>
              <p className="text-gray-500 text-sm mb-4 max-w-md">
                Ask me anything about conflict analysis, risk assessment, or incident patterns. I can help you understand security trends and provide recommendations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                <Button 
                  variant="outline" 
                  className="text-left justify-start text-sm h-auto py-2"
                  onClick={() => setInputMessage("What are the current risk patterns in Nigeria?")}
                >
                  <span>What are the current risk patterns?</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start text-sm h-auto py-2"
                  onClick={() => setInputMessage("Analyze recent conflict trends in the Northeast")}
                >
                  <span>Analyze recent conflict trends</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start text-sm h-auto py-2"
                  onClick={() => setInputMessage("What recommendations do you have for reducing tensions?")}
                >
                  <span>Recommendations for reducing tensions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start text-sm h-auto py-2"
                  onClick={() => setInputMessage("Generate a briefing on current security status")}
                >
                  <span>Generate a security briefing</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.role === 'user'
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                      {message.role === 'assistant' ? (
                        <>
                          <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg p-3 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                      <div
                        className={`mt-1 text-xs text-gray-500 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-gray-50 gap-2">
        <div className="relative w-full flex items-center">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isProcessing}
            className="pr-24"
          />
          <div className="absolute right-2 flex gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8"
                title="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="h-8 w-8 p-0"
              title="Send message"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AiChat;