import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import VoiceControl from './VoiceControl';

interface VoiceIncidentReportingProps {
  onSubmit?: (incident: any) => void;
}

const VoiceIncidentReporting: React.FC<VoiceIncidentReportingProps> = ({ onSubmit }) => {
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5" />
          Voice Incident Reporting
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Report incidents using your voice. Start by saying "report incident" or 
                  "new incident" and follow the prompts. You can say "help" at any time 
                  for available commands.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Use voice commands to easily report incidents without typing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showVoiceControl ? (
          <VoiceControl />
        ) : (
          <div className="text-center py-8">
            <p className="mb-4 text-muted-foreground">
              Click the button below to activate voice control and start reporting an incident using your voice.
            </p>
            <Button 
              onClick={() => setShowVoiceControl(true)}
              className="flex items-center"
            >
              <Mic className="mr-2 h-4 w-4" />
              Activate Voice Control
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Make sure your microphone is enabled and you're in a quiet environment for best results.
        </p>
      </CardFooter>
    </Card>
  );
};

export default VoiceIncidentReporting;