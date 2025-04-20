import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { speak as speechUtilSpeak, cancelSpeech, getSpeechRecognition } from '@/lib/speech-utils';

// Interface for the Web Speech API which isn't fully typed in TypeScript
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  mozSpeechRecognition: any;
  msSpeechRecognition: any;
}

// Voice commands configuration
const COMMANDS = {
  NAVIGATE: {
    DASHBOARD: ['go to dashboard', 'open dashboard', 'show dashboard', 'dashboard'],
    INCIDENTS: ['go to incidents', 'open incidents', 'show incidents', 'incidents'],
    ALERTS: ['go to alerts', 'open alerts', 'show alerts', 'alerts'],
    MAP: ['go to map', 'open map', 'show map', 'map'],
    REPORT: ['report incident', 'new incident', 'create incident', 'add incident'],
    DATA_COLLECTION: ['go to data collection', 'open data collection', 'data collection'],
    ANALYSIS: ['go to analysis', 'open analysis', 'analysis', 'show analysis'],
  },
  REPORT: {
    START: ['start report', 'begin report', 'new report', 'create report'],
    TITLE: ['title is', 'set title to', 'incident title'],
    LOCATION: ['location is', 'set location to', 'incident location', 'happened at', 'occurred at'],
    DESCRIPTION: ['description is', 'set description to', 'incident description', 'details are'],
    SEVERITY: ['severity is', 'set severity to', 'incident severity'],
    SUBMIT: ['submit report', 'save report', 'create incident', 'finish report'],
    CANCEL: ['cancel report', 'discard report', 'stop report'],
  },
  CONTROL: {
    HELP: ['help', 'show help', 'what can i say', 'commands', 'show commands'],
    STOP: ['stop listening', 'stop voice', 'disable voice', 'turn off microphone'],
    START: ['start listening', 'start voice', 'enable voice', 'turn on microphone'],
  }
};

// States for the voice reporting flow
enum ReportingState {
  IDLE = 'idle',
  TITLE = 'title',
  LOCATION = 'location',
  DESCRIPTION = 'description',
  SEVERITY = 'severity',
  CONFIRMATION = 'confirmation',
}

const VoiceControl: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [speakFeedback, setSpeakFeedback] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [reportingState, setReportingState] = useState<ReportingState>(ReportingState.IDLE);
  const [incidentData, setIncidentData] = useState({
    title: '',
    location: '',
    description: '',
    severity: 'medium', // Default severity
  });

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript.trim().toLowerCase();
        setTranscript(result);
        processVoiceCommand(result);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Ignore "no speech" errors
          return;
        }
        speak(`Voice recognition error: ${event.error}`);
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if it was supposed to be listening
          recognitionRef.current.start();
        }
      };
    } else {
      toast({
        title: "Voice Control Unavailable",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, toast]);

  // Text-to-speech feedback
  const speak = (text: string) => {
    setFeedback(text);
    
    if (speakFeedback) {
      speechUtilSpeak(text, {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    }
  };

  // Start or stop voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Control Unavailable",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      speak("Voice recognition stopped");
    } else {
      recognitionRef.current.start();
      speak("Voice recognition started. Say 'help' for available commands.");
    }
    
    setIsListening(!isListening);
  };

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    // First check if we're in reporting mode
    if (reportingState !== ReportingState.IDLE) {
      processReportingCommand(command);
      return;
    }
    
    // Navigation commands
    if (COMMANDS.NAVIGATE.DASHBOARD.some(cmd => command.includes(cmd))) {
      speak("Navigating to dashboard");
      navigate('/');
      return;
    }
    
    if (COMMANDS.NAVIGATE.INCIDENTS.some(cmd => command.includes(cmd))) {
      speak("Navigating to incidents");
      navigate('/incidents');
      return;
    }
    
    if (COMMANDS.NAVIGATE.ALERTS.some(cmd => command.includes(cmd))) {
      speak("Navigating to alerts");
      navigate('/alerts');
      return;
    }
    
    if (COMMANDS.NAVIGATE.MAP.some(cmd => command.includes(cmd))) {
      speak("Navigating to map");
      navigate('/map');
      return;
    }
    
    if (COMMANDS.NAVIGATE.REPORT.some(cmd => command.includes(cmd)) || 
        COMMANDS.REPORT.START.some(cmd => command.includes(cmd))) {
      startIncidentReport();
      return;
    }
    
    if (COMMANDS.NAVIGATE.DATA_COLLECTION.some(cmd => command.includes(cmd))) {
      speak("Navigating to data collection");
      navigate('/data-collection');
      return;
    }
    
    if (COMMANDS.NAVIGATE.ANALYSIS.some(cmd => command.includes(cmd))) {
      speak("Navigating to analysis");
      navigate('/analysis');
      return;
    }
    
    // Control commands
    if (COMMANDS.CONTROL.HELP.some(cmd => command.includes(cmd))) {
      showHelp();
      return;
    }
    
    if (COMMANDS.CONTROL.STOP.some(cmd => command.includes(cmd))) {
      speak("Stopping voice recognition");
      setIsListening(false);
      recognitionRef.current?.stop();
      return;
    }
    
    // If no command matched
    speak("Command not recognized. Say 'help' to see available commands.");
  };

  // Process commands during incident reporting flow
  const processReportingCommand = (command: string) => {
    // Check for cancel command first
    if (COMMANDS.REPORT.CANCEL.some(cmd => command.includes(cmd))) {
      speak("Cancelling incident report");
      setReportingState(ReportingState.IDLE);
      setIncidentData({
        title: '',
        location: '',
        description: '',
        severity: 'medium',
      });
      return;
    }
    
    // Process based on the current reporting state
    switch (reportingState) {
      case ReportingState.TITLE:
        // Check if this is a command to move to another field
        if (COMMANDS.REPORT.LOCATION.some(cmd => command.includes(cmd))) {
          setReportingState(ReportingState.LOCATION);
          speak("Please state the location of the incident.");
        } else {
          // Extract title after any prefixes like "title is"
          let title = command;
          for (const prefix of COMMANDS.REPORT.TITLE) {
            if (command.includes(prefix)) {
              title = command.substring(command.indexOf(prefix) + prefix.length).trim();
              break;
            }
          }
          setIncidentData(prev => ({ ...prev, title }));
          speak(`Title set to: ${title}. Now, please provide the location.`);
          setReportingState(ReportingState.LOCATION);
        }
        break;
        
      case ReportingState.LOCATION:
        // Check if this is a command to move to another field
        if (COMMANDS.REPORT.DESCRIPTION.some(cmd => command.includes(cmd))) {
          setReportingState(ReportingState.DESCRIPTION);
          speak("Please describe the incident.");
        } else {
          // Extract location after any prefixes
          let location = command;
          for (const prefix of COMMANDS.REPORT.LOCATION) {
            if (command.includes(prefix)) {
              location = command.substring(command.indexOf(prefix) + prefix.length).trim();
              break;
            }
          }
          setIncidentData(prev => ({ ...prev, location }));
          speak(`Location set to: ${location}. Now, please describe the incident.`);
          setReportingState(ReportingState.DESCRIPTION);
        }
        break;
        
      case ReportingState.DESCRIPTION:
        // Check if this is a command to move to another field
        if (COMMANDS.REPORT.SEVERITY.some(cmd => command.includes(cmd))) {
          setReportingState(ReportingState.SEVERITY);
          speak("Please state the severity: low, medium, or high.");
        } else {
          // Extract description after any prefixes
          let description = command;
          for (const prefix of COMMANDS.REPORT.DESCRIPTION) {
            if (command.includes(prefix)) {
              description = command.substring(command.indexOf(prefix) + prefix.length).trim();
              break;
            }
          }
          setIncidentData(prev => ({ ...prev, description }));
          speak(`Description recorded. Now, please state the severity: low, medium, or high.`);
          setReportingState(ReportingState.SEVERITY);
        }
        break;
        
      case ReportingState.SEVERITY:
        // Check for severity level in the command
        let severity = 'medium'; // default
        if (command.includes('low')) {
          severity = 'low';
        } else if (command.includes('medium')) {
          severity = 'medium';
        } else if (command.includes('high')) {
          severity = 'high';
        }
        
        setIncidentData(prev => ({ ...prev, severity }));
        setReportingState(ReportingState.CONFIRMATION);
        
        speak(`Severity set to ${severity}. Review your report: Title: ${incidentData.title}. Location: ${incidentData.location}. Description: ${incidentData.description}. Severity: ${severity}. Say 'submit report' to save or 'cancel report' to discard.`);
        break;
        
      case ReportingState.CONFIRMATION:
        if (COMMANDS.REPORT.SUBMIT.some(cmd => command.includes(cmd))) {
          submitIncidentReport();
        }
        break;
        
      default:
        speak("I didn't understand that. Please try again or say 'cancel report' to stop.");
    }
  };

  // Start the incident reporting process
  const startIncidentReport = () => {
    speak("Starting incident report. Please state the title of the incident.");
    setReportingState(ReportingState.TITLE);
    setIncidentData({
      title: '',
      location: '',
      description: '',
      severity: 'medium',
    });
  };

  // Submit the incident report
  const submitIncidentReport = async () => {
    speak("Submitting incident report...");
    
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: incidentData.title,
          location: incidentData.location,
          description: incidentData.description,
          severity: incidentData.severity,
          status: 'active',
          category: 'voice_reported',
        }),
      });
      
      if (response.ok) {
        speak("Incident report submitted successfully.");
        toast({
          title: "Success",
          description: "Incident reported successfully via voice command.",
        });
        
        // Reset state
        setReportingState(ReportingState.IDLE);
        setIncidentData({
          title: '',
          location: '',
          description: '',
          severity: 'medium',
        });
        
        // Navigate to incidents page
        navigate('/incidents');
      } else {
        const errorData = await response.json();
        speak(`Failed to submit report: ${errorData.message || 'Unknown error'}`);
        toast({
          title: "Error",
          description: `Failed to submit incident report: ${errorData.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      speak("Failed to submit report due to a network error. Please try again.");
      toast({
        title: "Error",
        description: "Failed to submit incident report due to a network error.",
        variant: "destructive",
      });
    }
  };

  // Show help with available commands
  const showHelp = () => {
    const helpText = `
      Available commands:
      Navigation: "go to dashboard", "go to incidents", "go to alerts", "go to map"
      Reporting: "report incident", "new incident"
      Control: "stop listening", "start listening", "help"
    `;
    
    speak("Here are the available voice commands. " + helpText);
    toast({
      title: "Voice Commands Help",
      description: helpText,
      duration: 10000,
    });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Control {isListening && <Badge className="ml-2 bg-green-500">Active</Badge>}</span>
          <Button 
            variant={isListening ? "destructive" : "default"} 
            size="icon" 
            onClick={toggleListening}
            className="h-8 w-8"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>
          Control the system using voice commands
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reportingState !== ReportingState.IDLE && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium text-sm mb-2">Voice Incident Reporting - {reportingState}</h4>
            <div className="text-xs space-y-1">
              <div><strong>Title:</strong> {incidentData.title || '(Not set)'}</div>
              <div><strong>Location:</strong> {incidentData.location || '(Not set)'}</div>
              <div><strong>Description:</strong> {incidentData.description || '(Not set)'}</div>
              <div><strong>Severity:</strong> {incidentData.severity}</div>
            </div>
          </div>
        )}
        
        <div className="mb-4 text-sm">
          <p className="font-medium">Last heard:</p>
          <p className="text-muted-foreground italic">{transcript || "(Nothing yet)"}</p>
        </div>
        
        <div className="mb-4 text-sm">
          <p className="font-medium">System response:</p>
          <p className="text-primary">{feedback || "Waiting for commands..."}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            id="speakFeedback" 
            checked={speakFeedback} 
            onCheckedChange={setSpeakFeedback} 
          />
          <Label htmlFor="speakFeedback" className="flex items-center">
            <Volume2 className="h-4 w-4 mr-1" /> Voice Feedback
          </Label>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={showHelp}
        >
          Help
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceControl;