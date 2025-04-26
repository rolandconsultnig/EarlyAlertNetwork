import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import VoiceNavigation from '@/components/accessibility/VoiceNavigation';
import ScreenReader from '@/components/accessibility/ScreenReader';
import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import { useState } from 'react';

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState<number[]>([16]);
  const [contrast, setContrast] = useState<number[]>([100]);
  const [enableCaptions, setEnableCaptions] = useState(false);
  const [enableKeyboardShortcuts, setEnableKeyboardShortcuts] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Apply font size globally
  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize[0]}px`;
    
    // Cleanup function to restore default font size when component unmounts
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);
  
  // Apply contrast globally
  React.useEffect(() => {
    if (contrast[0] !== 100) {
      document.documentElement.style.filter = `contrast(${contrast[0]}%)`;
    } else {
      document.documentElement.style.filter = '';
    }
    
    // Cleanup function to restore default contrast when component unmounts
    return () => {
      document.documentElement.style.filter = '';
    };
  }, [contrast]);

  return (
    <MainLayout title="Accessibility Settings">
      <div className="space-y-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>
              Configure accessibility options to improve your experience using the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="general">General Settings</TabsTrigger>
                <TabsTrigger value="voice">Voice Navigation</TabsTrigger>
                <TabsTrigger value="screen-reader">Screen Reader</TabsTrigger>
                <TabsTrigger value="keyboard">Keyboard Controls</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="font-size">Font Size ({fontSize[0]}px)</Label>
                      <span className="text-sm text-gray-500">
                        {fontSize[0] < 16 ? 'Small' : fontSize[0] < 20 ? 'Medium' : fontSize[0] < 24 ? 'Large' : 'Extra Large'}
                      </span>
                    </div>
                    <Slider
                      id="font-size"
                      value={fontSize}
                      min={12}
                      max={28}
                      step={1}
                      onValueChange={setFontSize}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="contrast">Contrast ({contrast[0]}%)</Label>
                      <span className="text-sm text-gray-500">
                        {contrast[0] < 100 ? 'Lower' : contrast[0] === 100 ? 'Normal' : 'Higher'}
                      </span>
                    </div>
                    <Slider
                      id="contrast"
                      value={contrast}
                      min={75}
                      max={125}
                      step={5}
                      onValueChange={setContrast}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="captions">Enable Captions</Label>
                      <div className="text-sm text-gray-500">Show captions for video and audio content</div>
                    </div>
                    <Switch
                      id="captions"
                      checked={enableCaptions}
                      onCheckedChange={setEnableCaptions}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="motion">Reduce Motion</Label>
                      <div className="text-sm text-gray-500">Minimize animations and transitions</div>
                    </div>
                    <Switch
                      id="motion"
                      checked={reduceMotion}
                      onCheckedChange={setReduceMotion}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="voice">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Voice Navigation</CardTitle>
                      <CardDescription>
                        Control the platform using voice commands
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VoiceNavigation />
                      
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Voice Command Examples</h4>
                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                          <div className="grid grid-cols-2 text-sm">
                            <div className="font-medium">"go to dashboard"</div>
                            <div>Navigate to the dashboard page</div>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <div className="font-medium">"show map"</div>
                            <div>Open the map view</div>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <div className="font-medium">"report incident"</div>
                            <div>Start incident reporting process</div>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <div className="font-medium">"create alert"</div>
                            <div>Create a new alert</div>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <div className="font-medium">"refresh data"</div>
                            <div>Refresh the current data</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="screen-reader">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Screen Reader Options</CardTitle>
                      <CardDescription>
                        Configure how content is read aloud
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScreenReader pageTitle="Accessibility Settings" />
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="auto-read">Auto-read Important Alerts</Label>
                            <div className="text-sm text-gray-500">Automatically read critical alerts when they appear</div>
                          </div>
                          <Switch
                            id="auto-read"
                            checked={true}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="detailed">Detailed Descriptions</Label>
                            <div className="text-sm text-gray-500">Include more detailed descriptions when reading content</div>
                          </div>
                          <Switch
                            id="detailed"
                            checked={true}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="keyboard">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Keyboard Navigation</CardTitle>
                      <CardDescription>
                        Configure keyboard shortcuts and navigation options
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="keyboard-shortcuts">Enable Keyboard Shortcuts</Label>
                          <div className="text-sm text-gray-500">Allow keyboard shortcuts for common actions</div>
                        </div>
                        <Switch
                          id="keyboard-shortcuts"
                          checked={enableKeyboardShortcuts}
                          onCheckedChange={setEnableKeyboardShortcuts}
                        />
                      </div>
                      
                      {enableKeyboardShortcuts && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Available Shortcuts</h4>
                          <div className="bg-gray-50 p-3 rounded-md space-y-2">
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + H</div>
                              <div>Go to Home/Dashboard</div>
                            </div>
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + M</div>
                              <div>Open Map View</div>
                            </div>
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + I</div>
                              <div>Report New Incident</div>
                            </div>
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + A</div>
                              <div>View Alerts</div>
                            </div>
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + S</div>
                              <div>Open Settings</div>
                            </div>
                            <div className="grid grid-cols-2 text-sm">
                              <div className="font-medium">Alt + F</div>
                              <div>Focus Search</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Voice Control Demo</CardTitle>
              <CardDescription>
                Try voice commands directly to experience the functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Enable voice navigation and try saying one of these commands:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>"Go to map"</li>
                  <li>"Show alerts"</li>
                  <li>"Report incident"</li>
                  <li>"Open settings"</li>
                </ul>
              </div>
              <AccessibilityControls pageTitle="Accessibility Settings" isCollapsible={false} />
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Accessibility Statement</CardTitle>
              <CardDescription>
                Our commitment to making the platform accessible to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  The Institute for Peace and Conflict Resolution (IPCR) is committed to ensuring that our Early Warning & Early Response System is accessible to all users, including those with disabilities.
                </p>
                <p>
                  We are continuously working to improve the accessibility and usability of our platform in accordance with international standards and best practices for accessibility.
                </p>
                <p>
                  Our accessibility features include:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Voice navigation for hands-free control</li>
                  <li>Screen reader compatibility</li>
                  <li>Keyboard navigation</li>
                  <li>Adjustable text sizes and contrast settings</li>
                  <li>Reduced motion options</li>
                  <li>Alternative text for images</li>
                </ul>
                <p>
                  If you encounter any accessibility issues or have suggestions for improvement, please contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}