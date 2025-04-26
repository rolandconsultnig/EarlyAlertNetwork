import React from 'react';
import VoiceNavigation from './VoiceNavigation';
import ScreenReader from './ScreenReader';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Accessibility, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccessibilityControlsProps {
  pageTitle: string;
  isCollapsible?: boolean;
  onReportIncident?: () => void;
  onCreateAlert?: () => void;
  onRefreshData?: () => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  pageTitle,
  isCollapsible = true,
  onReportIncident,
  onCreateAlert,
  onRefreshData,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // If not collapsible, just render the controls
  if (!isCollapsible) {
    return (
      <div className="flex items-center space-x-4">
        <VoiceNavigation 
          onReportIncident={onReportIncident}
          onCreateAlert={onCreateAlert}
          onRefreshData={onRefreshData}
        />
        <Separator orientation="vertical" className="h-6" />
        <ScreenReader pageTitle={pageTitle} />
      </div>
    );
  }
  
  // Otherwise, render a collapsible container
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-auto rounded-lg border shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Accessibility className="h-5 w-5 mr-2 text-blue-500" />
          <h4 className="text-sm font-medium">Accessibility Controls</h4>
          <Badge variant="outline" className="ml-2 bg-blue-50">New</Badge>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle accessibility panel</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <Separator />
        <div className="p-4 space-y-4">
          <div>
            <h5 className="text-xs font-medium mb-2 text-gray-500 uppercase">Voice Navigation</h5>
            <VoiceNavigation 
              onReportIncident={onReportIncident}
              onCreateAlert={onCreateAlert}
              onRefreshData={onRefreshData}
            />
            <p className="text-xs text-gray-500 mt-2">
              Enable voice commands to navigate the system and perform actions.
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h5 className="text-xs font-medium mb-2 text-gray-500 uppercase">Screen Reader</h5>
            <ScreenReader pageTitle={pageTitle} />
            <p className="text-xs text-gray-500 mt-2">
              Have page content read aloud to you. Options for reading headings, tables, and charts.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AccessibilityControls;