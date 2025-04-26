import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  Accessibility, 
  ChevronDown, 
  ChevronUp,
  Languages,
  Maximize,
  Minimize
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import VoiceNavigation from './VoiceNavigation';
import ScreenReader from './ScreenReader';
import { useLocation } from 'wouter';

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
  onRefreshData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();

  const handleNavigateToAccessibility = () => {
    navigate('/accessibility');
    setIsOpen(false);
  };

  if (isExpanded) {
    // Full expanded mode shown directly in the page
    return (
      <div className="fixed top-20 right-4 p-4 bg-white rounded-lg shadow-lg border w-72 z-50">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Accessibility className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="font-medium">Accessibility Options</h3>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsExpanded(false)}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize panel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="voice">
            <AccordionTrigger className="text-sm py-2">Voice Navigation</AccordionTrigger>
            <AccordionContent>
              <VoiceNavigation 
                onReportIncident={onReportIncident}
                onCreateAlert={onCreateAlert}
                onRefreshData={onRefreshData}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="screen-reader">
            <AccordionTrigger className="text-sm py-2">Screen Reader</AccordionTrigger>
            <AccordionContent>
              <ScreenReader pageTitle={pageTitle} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="language">
            <AccordionTrigger className="text-sm py-2">Language</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm"
                  onClick={() => {}}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  English
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm opacity-70"
                  onClick={() => {}}
                  disabled
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Hausa (Coming Soon)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-sm opacity-70"
                  onClick={() => {}}
                  disabled
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Yoruba (Coming Soon)
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-4 pt-3 border-t">
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 h-auto text-sm text-blue-500"
            onClick={handleNavigateToAccessibility}
          >
            More Accessibility Options
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isCollapsible ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              aria-label="Accessibility options"
            >
              <Accessibility className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Accessibility</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Accessibility Options</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setIsExpanded(true);
                        setIsOpen(false);
                      }}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expand panel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="voice">
                <AccordionTrigger className="text-sm py-2">Voice Navigation</AccordionTrigger>
                <AccordionContent>
                  <VoiceNavigation 
                    onReportIncident={onReportIncident}
                    onCreateAlert={onCreateAlert}
                    onRefreshData={onRefreshData}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="screen-reader">
                <AccordionTrigger className="text-sm py-2">Screen Reader</AccordionTrigger>
                <AccordionContent>
                  <ScreenReader pageTitle={pageTitle} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-4 pt-3 border-t">
              <Button 
                variant="link" 
                size="sm" 
                className="px-0 h-auto text-sm text-blue-500"
                onClick={handleNavigateToAccessibility}
              >
                More Accessibility Options
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="font-medium mb-1">Voice Navigation</h3>
            <VoiceNavigation 
              onReportIncident={onReportIncident}
              onCreateAlert={onCreateAlert}
              onRefreshData={onRefreshData}
            />
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-1">Screen Reader</h3>
            <ScreenReader pageTitle={pageTitle} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls;