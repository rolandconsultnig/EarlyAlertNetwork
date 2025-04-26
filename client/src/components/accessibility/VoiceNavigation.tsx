import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { speak, cancelSpeech, getSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/speech-utils';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define navigation commands and their corresponding routes
const NAVIGATION_COMMANDS: Record<string, string> = {
  'go to home': '/',
  'go to dashboard': '/dashboard',
  'show incidents': '/incidents',
  'open map': '/map',
  'show map': '/map',
  'view alerts': '/alerts',
  'show alerts': '/alerts',
  'open reporting': '/reporting',
  'report incident': '/report-incident',
  'show analysis': '/analysis',
  'open analysis': '/analysis',
  'ai analysis': '/ai-analysis',
  'show ai analysis': '/ai-analysis',
  'go to ai search': '/ai-search',
  'open ai search': '/ai-search',
  'view risk assessment': '/risk-assessment',
  'show risk assessment': '/risk-assessment',
  'view response plans': '/response-plans',
  'open response plans': '/response-plans',
  'go to settings': '/settings',
  'open settings': '/settings',
  'go to user management': '/user-management',
  'show users': '/user-management',
};

// Define general informational commands
const INFO_COMMANDS: Record<string, string> = {
  'help': 'Here are some commands you can use: go to dashboard, show incidents, open map, show alerts, report incident, and more. You can also say "list commands" to hear all available commands.',
  'list commands': Object.keys(NAVIGATION_COMMANDS).join(', '),
  'what can I say': 'You can navigate to different pages, report incidents, and control the interface with voice commands. Try saying: "go to dashboard" or "report incident".',
  'what is this': 'This is the Early Warning and Early Response System for the Institute for Peace and Conflict Resolution. It helps monitor and respond to security incidents across Nigeria.',
  'who made this': 'This system was developed for the Institute for Peace and Conflict Resolution (IPCR) Nigeria.',
};

// Define action commands that would trigger specific UI interactions
const ACTION_COMMANDS: string[] = [
  'report incident',
  'create alert',
  'refresh data',
  'submit form',
  'cancel',
  'confirm',
];

interface VoiceNavigationProps {
  onReportIncident?: () => void;
  onCreateAlert?: () => void;
  onRefreshData?: () => void;
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  onReportIncident,
  onCreateAlert,
  onRefreshData,
}) => {
  const [location, navigate] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return null;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();
      setTranscript(command);
      processCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        // This is a normal event when no speech is detected
        return;
      }
      
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      // Only restart if we're still supposed to be listening
      if (isListening) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [isListening, toast]);

  // Process voice commands
  const processCommand = useCallback((command: string) => {
    if (!isMuted) {
      // Check for navigation commands
      for (const [phrase, route] of Object.entries(NAVIGATION_COMMANDS)) {
        if (command.includes(phrase)) {
          speak(`Navigating to ${phrase.replace('go to ', '').replace('show ', '').replace('open ', '').replace('view ', '')}`);
          navigate(route);
          return;
        }
      }

      // Check for informational commands
      for (const [phrase, response] of Object.entries(INFO_COMMANDS)) {
        if (command.includes(phrase)) {
          speak(response);
          return;
        }
      }

      // Check for action commands
      if (command.includes('report incident') && onReportIncident) {
        speak('Opening incident report form');
        onReportIncident();
        return;
      } else if (command.includes('create alert') && onCreateAlert) {
        speak('Opening alert creation form');
        onCreateAlert();
        return;
      } else if ((command.includes('refresh') || command.includes('reload')) && onRefreshData) {
        speak('Refreshing data');
        onRefreshData();
        return;
      }

      // Unknown command feedback
      if (command.length > 3 && !command.includes('the') && !command.includes('and')) {
        speak(`I didn't recognize the command: ${command}. Say "help" for assistance.`);
      }
    }
  }, [isMuted, navigate, onReportIncident, onCreateAlert, onRefreshData]);

  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      toast({
        title: "Voice Navigation Disabled",
        description: "Voice command recognition has been turned off.",
      });
    } else {
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        toast({
          title: "Voice Navigation Enabled",
          description: "Listening for voice commands. Say 'help' for assistance.",
        });
      }
    }
  }, [isListening, initSpeechRecognition, toast]);

  // Toggle voice feedback
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    
    if (isMuted) {
      speak("Voice feedback enabled");
    } else {
      speak("Voice feedback disabled");
      // We need to wait for the announcement to complete before canceling
      setTimeout(() => cancelSpeech(), 1000);
    }
    
    toast({
      title: isMuted ? "Voice Feedback Enabled" : "Voice Feedback Disabled",
      description: isMuted ? "The system will now provide voice feedback." : "Voice feedback has been muted.",
    });
  }, [isMuted]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      cancelSpeech();
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleListening}
              className={isListening ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800" : ""}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isListening ? "Voice Navigation Active" : "Enable Voice Navigation"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleMute}
              className={!isMuted ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800" : ""}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMuted ? "Enable Voice Feedback" : "Disable Voice Feedback"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setHelpDialogOpen(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Voice Navigation Help
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isListening && transcript && (
        <div className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
          "{transcript}"
        </div>
      )}

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Voice Navigation Commands</DialogTitle>
            <DialogDescription>
              Use these voice commands to navigate and control the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 max-h-96 overflow-y-auto pr-2">
            <div>
              <h3 className="font-semibold mb-2">Navigation Commands</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(NAVIGATION_COMMANDS).map(([command, route]) => (
                  <div key={command} className="flex items-start space-x-2">
                    <span className="font-medium">"{command}"</span>
                    <span className="text-sm text-gray-500">→ {route}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Information Commands</h3>
              <div className="space-y-2">
                {Object.keys(INFO_COMMANDS).map((command) => (
                  <div key={command} className="flex items-start space-x-2">
                    <span className="font-medium">"{command}"</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Action Commands</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {ACTION_COMMANDS.map((command) => (
                  <div key={command} className="flex items-start space-x-2">
                    <span className="font-medium">"{command}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceNavigation;