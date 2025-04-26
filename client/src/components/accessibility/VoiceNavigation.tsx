import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { speak, getSpeechRecognition } from '@/lib/speech-utils';

interface VoiceNavigationProps {
  onReportIncident?: () => void;
  onCreateAlert?: () => void;
  onRefreshData?: () => void;
}

// Define a type for SpeechRecognition since it's not in the standard TypeScript definitions
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
  resultIndex: number;
  error?: any;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  onReportIncident,
  onCreateAlert,
  onRefreshData
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Initialize speech recognition on component mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const result = event.results[0];
          const text = result[0].transcript.toLowerCase().trim();
          const confidenceScore = result[0].confidence;
          setTranscript(text);
          setConfidence(confidenceScore);
          processCommand(text);
        };

        recognitionRef.current.onend = () => {
          if (isListening && recognitionRef.current) {
            // Restart if we're still in listening mode
            recognitionRef.current.start();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          toast({
            title: 'Voice Recognition Error',
            description: `Error: ${event.error}. Please try again.`,
            variant: 'destructive',
          });
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        
        if (isListening) {
          recognitionRef.current.abort();
        }
      }
    };
  }, [isListening, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Recognition Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript('');
      toast({
        title: 'Voice Navigation Disabled',
        description: 'Voice commands are now turned off.',
      });
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: 'Voice Navigation Enabled',
        description: 'Say "help" to see available commands.',
      });
    }
  };

  const processCommand = (command: string) => {
    setIsProcessing(true);
    
    // Process after short delay to allow UI to update
    setTimeout(() => {
      // Navigation commands
      if (/^(go to|open|show|navigate to) (dashboard|home)$/.test(command)) {
        navigate('/');
        speakResponse('Navigating to dashboard');
      } 
      else if (/^(go to|open|show|navigate to) map$/.test(command)) {
        navigate('/map');
        speakResponse('Opening map view');
      }
      else if (/^(go to|open|show|navigate to) alerts$/.test(command)) {
        navigate('/alerts');
        speakResponse('Showing alerts');
      }
      else if (/^(go to|open|show|navigate to) incidents$/.test(command)) {
        navigate('/incidents-list');
        speakResponse('Showing incident reports');
      }
      else if (/^(go to|open|show|navigate to) analysis$/.test(command)) {
        navigate('/analysis');
        speakResponse('Opening analysis page');
      }
      else if (/^(go to|open|show|navigate to) ai( analysis)?$/.test(command)) {
        navigate('/ai-analysis');
        speakResponse('Opening AI analysis tools');
      }
      else if (/^(go to|open|show|navigate to) response plans$/.test(command)) {
        navigate('/response-plans');
        speakResponse('Showing response plans');
      }
      else if (/^(go to|open|show|navigate to) settings$/.test(command)) {
        navigate('/settings');
        speakResponse('Opening settings');
      }
      else if (/^(go to|open|show|navigate to) accessibility$/.test(command)) {
        navigate('/accessibility');
        speakResponse('Opening accessibility features');
      }
      
      // Action commands
      else if (/^(report|create|new) incident$/.test(command)) {
        if (onReportIncident) {
          onReportIncident();
          speakResponse('Starting incident report form');
        } else {
          navigate('/report-incident');
          speakResponse('Opening incident report form');
        }
      }
      else if (/^(create|new) alert$/.test(command)) {
        if (onCreateAlert) {
          onCreateAlert();
          speakResponse('Creating new alert');
        } else {
          navigate('/alerts?create=true');
          speakResponse('Opening alert creation form');
        }
      }
      else if (/^refresh( data)?$/.test(command)) {
        if (onRefreshData) {
          onRefreshData();
          speakResponse('Refreshing data');
        } else {
          window.location.reload();
          speakResponse('Refreshing page');
        }
      }
      else if (/^help$/.test(command)) {
        showHelpToast();
        speakResponse('Showing voice command help');
      }
      else {
        // Unknown command
        toast({
          title: 'Command Not Recognized',
          description: `I didn't understand "${command}". Say "help" to see available commands.`,
        });
        speakResponse(`I didn't understand that command. Say help for assistance.`);
      }
      
      setIsProcessing(false);
      setTranscript('');
    }, 500);
  };
  
  const speakResponse = (message: string) => {
    speak(message, { rate: 1.0 });
  };
  
  const showHelpToast = () => {
    toast({
      title: 'Voice Command Help',
      description: (
        <div className="space-y-1 mt-2">
          <p className="font-medium">Available commands:</p>
          <ul className="text-sm space-y-1">
            <li>"go to dashboard" - Navigate to dashboard</li>
            <li>"show map" - Open the map view</li>
            <li>"report incident" - Create a new incident report</li>
            <li>"create alert" - Create a new alert</li>
            <li>"refresh data" - Refresh current data</li>
          </ul>
        </div>
      ),
      duration: 8000,
    });
  };

  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = 
    'SpeechRecognition' in window || 
    'webkitSpeechRecognition' in window;

  if (!isSpeechRecognitionSupported) {
    return (
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="px-3 h-8"
          disabled
        >
          <MicOff className="h-4 w-4 mr-2 text-gray-500" />
          Voice Navigation Unavailable
        </Button>
        <span className="ml-2 text-xs text-gray-500">
          Your browser doesn't support voice recognition
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <Button
          variant={isListening ? "secondary" : "outline"}
          size="sm"
          className={`px-3 h-8 ${isListening ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? (
            <>
              <Mic className="h-4 w-4 mr-2 text-blue-600 animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Enable Voice Navigation
            </>
          )}
        </Button>
        
        {isListening && (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-xs">
            Active
          </Badge>
        )}
        
        {confidence > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            Confidence: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      
      {transcript && (
        <div className="flex items-center text-sm bg-gray-100 rounded-md p-2 animate-pulse">
          {isProcessing ? (
            <Loader2 className="h-3 w-3 mr-2 text-blue-600 animate-spin" />
          ) : (
            <Play className="h-3 w-3 mr-2 text-blue-600" />
          )}
          <span className="text-gray-700">"{transcript}"</span>
        </div>
      )}
    </div>
  );
};

export default VoiceNavigation;