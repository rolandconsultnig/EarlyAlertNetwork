import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Ban, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { speak, cancelSpeech, getSpeechRecognition } from '@/lib/speech-utils';

interface VoiceIncidentReportingProps {
  onSubmit?: (incident: any) => void;
}

// States for the voice reporting flow
enum ReportingState {
  IDLE = 'idle',
  TITLE = 'title',
  LOCATION = 'location',
  DESCRIPTION = 'description',
  SEVERITY = 'severity',
  CONFIRMATION = 'confirmation',
}

const VoiceIncidentReporting: React.FC<VoiceIncidentReportingProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reportingState, setReportingState] = useState<ReportingState>(ReportingState.IDLE);
  const [incidentData, setIncidentData] = useState({
    title: '',
    location: '',
    description: '',
    severity: 'medium', // Default severity
  });
  const recognitionRef = useRef<any>(null);

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
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
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
      cancelSpeech();
    };
  }, [isListening, toast]);

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
      speak("Voice reporting stopped");
      
      // Reset if in the middle of a report
      if (reportingState !== ReportingState.IDLE) {
        setReportingState(ReportingState.IDLE);
        setIncidentData({
          title: '',
          location: '',
          description: '',
          severity: 'medium',
        });
      }
    } else {
      recognitionRef.current.start();
      speak("Voice reporting activated. Say 'report incident' to begin.");
      setReportingState(ReportingState.IDLE);
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
    
    // Check for start reporting command
    if (command.includes('report incident') || 
        command.includes('new incident') ||
        command.includes('create incident') ||
        command.includes('start report')) {
      startIncidentReport();
    }
  };

  // Process commands during incident reporting flow
  const processReportingCommand = (command: string) => {
    // Check for cancel command first
    if (command.includes('cancel') || command.includes('stop report')) {
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
        setIncidentData(prev => ({ ...prev, title: command }));
        speak(`Title set to: ${command}. Now, please provide the location.`);
        setReportingState(ReportingState.LOCATION);
        break;
        
      case ReportingState.LOCATION:
        setIncidentData(prev => ({ ...prev, location: command }));
        speak(`Location set to: ${command}. Now, please describe the incident.`);
        setReportingState(ReportingState.DESCRIPTION);
        break;
        
      case ReportingState.DESCRIPTION:
        setIncidentData(prev => ({ ...prev, description: command }));
        speak(`Description recorded. Now, please state the severity: low, medium, or high.`);
        setReportingState(ReportingState.SEVERITY);
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
        if (command.includes('submit') || command.includes('save report')) {
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
    
    if (onSubmit) {
      // Format data for the API if needed
      const formattedData = {
        ...incidentData,
        status: 'active',
        category: 'conflict',
        reportedAt: new Date().toISOString(),
        reporterInfo: {
          name: 'Voice Reporter',
          email: '',
          phone: ''
        }
      };
      
      onSubmit(formattedData);
      
      // Reset state after submission
      setReportingState(ReportingState.IDLE);
      setIncidentData({
        title: '',
        location: '',
        description: '',
        severity: 'medium',
      });
      
      // Stop listening
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    } else {
      speak("Unable to submit report. Please try again later.");
      toast({
        title: "Submission Error",
        description: "No submit handler provided for voice reporting.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-md mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>Voice Incident Reporting</span>
          <Button 
            variant={isListening ? "destructive" : "secondary"} 
            size="sm" 
            onClick={toggleListening}
            className="text-white"
          >
            {isListening ? (
              <><MicOff className="h-4 w-4 mr-1" /> Stop</>
            ) : (
              <><Mic className="h-4 w-4 mr-1" /> Start Recording</>
            )}
          </Button>
        </CardTitle>
        <CardDescription className="text-white opacity-90">
          Report incidents using your voice
        </CardDescription>
      </CardHeader>
      
      {reportingState !== ReportingState.IDLE && (
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Reporting Status:</span>
              <Badge className="bg-blue-500">{reportingState}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <span className="font-medium">Title:</span>
                <p className="text-muted-foreground">{incidentData.title || '(Not set)'}</p>
              </div>
              
              <div className="space-y-1">
                <span className="font-medium">Location:</span>
                <p className="text-muted-foreground">{incidentData.location || '(Not set)'}</p>
              </div>
              
              <div className="col-span-2 space-y-1">
                <span className="font-medium">Description:</span>
                <p className="text-muted-foreground">{incidentData.description || '(Not set)'}</p>
              </div>
              
              <div className="space-y-1">
                <span className="font-medium">Severity:</span>
                <p className="text-muted-foreground">{incidentData.severity}</p>
              </div>
            </div>
            
            {reportingState === ReportingState.CONFIRMATION && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => {
                    setReportingState(ReportingState.IDLE);
                    setIncidentData({
                      title: '',
                      location: '',
                      description: '',
                      severity: 'medium',
                    });
                    speak("Incident report cancelled");
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex items-center"
                  onClick={submitIncidentReport}
                >
                  <Check className="h-4 w-4 mr-1" /> Submit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {reportingState === ReportingState.IDLE && isListening && (
        <CardContent className="text-center py-8">
          <Mic className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
          <p className="mt-4 text-sm text-muted-foreground">
            Listening... Say "report incident" to begin
          </p>
          <p className="mt-2 text-xs">
            Last heard: <span className="italic">{transcript || "(Nothing yet)"}</span>
          </p>
        </CardContent>
      )}
      
      {reportingState === ReportingState.IDLE && !isListening && (
        <CardContent className="text-center py-8">
          <div className="text-sm text-muted-foreground">
            Click the "Start Recording" button to report an incident using your voice.
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default VoiceIncidentReporting;