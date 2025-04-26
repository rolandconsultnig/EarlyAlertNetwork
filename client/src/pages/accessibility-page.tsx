import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { speak, cancelSpeech, getAvailableVoices } from '@/lib/speech-utils';
import { useToast } from '@/hooks/use-toast';
import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import {
  Mic,
  VolumeUp,
  HelpCircle,
  Accessibility,
  Eye,
  BookOpen,
  Keyboard,
  Languages,
  Monitor,
  RotateCw,
  ExternalLink
} from 'lucide-react';

const AccessibilityPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('voice-controls');
  
  const testSpeak = async () => {
    const voices = await getAvailableVoices();
    const voice = voices.find(v => v.lang.includes('en')) || null;
    
    speak(
      "This is a test of the text-to-speech feature. The Early Warning and Early Response System supports voice navigation and screen reading for enhanced accessibility.",
      { voice, rate: 1.0 }
    );
    
    toast({
      title: "Text-to-Speech Test",
      description: "Playing a sample of the voice synthesis feature.",
    });
  };
  
  const stopSpeaking = () => {
    cancelSpeech();
    toast({
      title: "Speech Stopped",
      description: "Voice playback has been stopped.",
    });
  };
  
  return (
    <MainLayout title="Accessibility">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accessibility Features</h1>
          <p className="text-gray-500 mt-1">
            Making the Early Warning System accessible to all users with voice control and screen reading
          </p>
        </div>
        
        <div className="flex space-x-4">
          <AccessibilityControls 
            pageTitle="Accessibility Features" 
            isCollapsible={false}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Accessibility className="h-5 w-5 mr-2 text-blue-500" />
              Accessibility Controls
            </CardTitle>
            <CardDescription>
              This panel is available throughout the system. Click or use voice commands to access these features from any page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccessibilityControls pageTitle="Accessibility Features" />
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-xl">
          <TabsTrigger value="voice-controls" className="flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            Voice Controls
          </TabsTrigger>
          <TabsTrigger value="readability" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Readability
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="flex items-center">
            <Keyboard className="h-4 w-4 mr-2" />
            Keyboard Access
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice-controls">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-blue-500" />
                  Voice Navigation
                </CardTitle>
                <CardDescription>
                  Navigate the system and access features using voice commands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The voice navigation system allows you to control the application using natural speech commands.
                  Enable voice navigation by clicking the microphone button in the accessibility panel.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Example Commands:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Say "<span className="font-medium">go to dashboard</span>" to navigate to the dashboard
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Say "<span className="font-medium">show map</span>" to open the map page
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Say "<span className="font-medium">report incident</span>" to start reporting a new incident
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Say "<span className="font-medium">help</span>" to get assistance with available commands
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <VolumeUp className="h-5 w-5 mr-2 text-blue-500" />
                  Screen Reading
                </CardTitle>
                <CardDescription>
                  Have page content read aloud using text-to-speech technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The screen reader functionality allows any content on the page to be read aloud.
                  This helps users with visual impairments or those who prefer auditory information.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Read entire page content with context and structure
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Read only headings for quick navigation
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Read data tables with row and column information
                    </li>
                    <li className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Describe charts and visualizations
                    </li>
                  </ul>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" onClick={testSpeak}>
                    <VolumeUp className="h-4 w-4 mr-2" />
                    Test Text-to-Speech
                  </Button>
                  <Button variant="outline" onClick={stopSpeaking}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Stop Speech
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2 text-blue-500" />
                Language Support
              </CardTitle>
              <CardDescription>
                Multi-language support for voice commands and text-to-speech
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our voice navigation system can understand commands in multiple languages and dialects.
                The system will automatically detect your preferred language based on your browser settings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">English</h4>
                  <p className="text-sm text-gray-600">Primary language with full feature support</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Hausa</h4>
                  <p className="text-sm text-gray-600">Basic navigation commands supported</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Yoruba</h4>
                  <p className="text-sm text-gray-600">Basic navigation commands supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="readability">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-500" />
                  Text Legibility
                </CardTitle>
                <CardDescription>
                  Features to improve text readability and legibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our system is designed with accessibility in mind, ensuring text is clear,
                  legible, and meets contrast requirements for all users.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Legibility Features:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      High contrast between text and background
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Minimum font size of 14px for body text
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Proper heading hierarchy for screen readers
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Clear focus indicators for keyboard navigation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-blue-500" />
                  Display Settings
                </CardTitle>
                <CardDescription>
                  Customize the display to improve readability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Customize the display settings to suit your preferences and accessibility needs.
                  These settings will persist across your sessions.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Display Features (Coming Soon):</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Font size adjustment
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      High contrast mode
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Reduced motion for animations
                    </li>
                    <li className="flex items-start">
                      <HelpCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Color blindness modes
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="keyboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Keyboard className="h-5 w-5 mr-2 text-blue-500" />
                Keyboard Navigation
              </CardTitle>
              <CardDescription>
                Navigate the entire system using only your keyboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The system is fully navigable using only keyboard controls, ensuring accessibility
                for users who cannot or prefer not to use a mouse.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Navigation Keys:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Tab</span>
                      <span className="ml-2">Move to next focusable element</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Shift+Tab</span>
                      <span className="ml-2">Move to previous focusable element</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Enter/Space</span>
                      <span className="ml-2">Activate buttons, links, and controls</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Esc</span>
                      <span className="ml-2">Close dialogs, dropdowns, or menus</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Form Controls:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Arrow Keys</span>
                      <span className="ml-2">Navigate within form controls</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Space</span>
                      <span className="ml-2">Toggle checkboxes and radio buttons</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Enter</span>
                      <span className="ml-2">Submit forms</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Additional Shortcuts (Coming Soon):</h4>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <p>We're developing additional keyboard shortcuts for quick navigation to common features:</p>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Alt+H</span>
                      <span className="ml-2">Go to Home/Dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Alt+M</span>
                      <span className="ml-2">Open Map</span>
                    </li>
                    <li className="flex items-start">
                      <Keyboard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      <span className="font-mono bg-gray-200 px-1 rounded">Alt+N</span>
                      <span className="ml-2">Create New Incident Report</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Resources</CardTitle>
            <CardDescription>
              Additional resources and information about our accessibility practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start" onClick={() => {}}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Accessibility Statement
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => {}}>
                <ExternalLink className="h-4 w-4 mr-2" />
                User Guide
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => {}}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Provide Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AccessibilityPage;