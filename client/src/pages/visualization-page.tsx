import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageTemplate from "@/components/modules/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Clock, BarChart3, AlertTriangle, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function VisualizationPage() {
  const [activeTab, setActiveTab] = useState("maps");
  
  const toolbar = (
    <Button>
      <LayoutDashboard className="h-4 w-4 mr-2" />
      Customize Dashboard
    </Button>
  );
  
  return (
    <PageTemplate 
      title="Visualization & Dashboard"
      description="Interactive visualization tools and customizable dashboards"
      toolbar={toolbar}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1">
          <TabsTrigger value="maps" className="py-2">
            <Map className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Interactive Maps</span>
            <span className="md:hidden">Maps</span>
          </TabsTrigger>
          <TabsTrigger value="timelines" className="py-2">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Conflict Timelines</span>
            <span className="md:hidden">Timelines</span>
          </TabsTrigger>
          <TabsTrigger value="heatmaps" className="py-2">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Heatmaps & Risk Zones</span>
            <span className="md:hidden">Heatmaps</span>
          </TabsTrigger>
          <TabsTrigger value="indicators" className="py-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Warning Indicators</span>
            <span className="md:hidden">Indicators</span>
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="py-2">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Custom Dashboards</span>
            <span className="md:hidden">Dashboard</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Maps (GIS)</CardTitle>
              <CardDescription>
                Geospatial visualization of conflict data across Nigeria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Nigeria Incident Map</CardTitle>
                    <CardDescription>Geographic distribution of conflict incidents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-blue-50 rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-600">Interactive map showing recent incidents across Nigerian states</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        Filter Data
                      </Button>
                      <Button size="sm">
                        Full Screen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Risk Distribution Map</CardTitle>
                    <CardDescription>Regional conflict risk assessment visualization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-blue-50 rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-600">Visualized risk levels across Nigerian territories</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        Risk Layers
                      </Button>
                      <Button size="sm">
                        Full Screen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Map Layers & Controls</CardTitle>
                    <CardDescription>Customize map visualization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="justify-start h-auto py-2">
                        <div className="flex flex-col items-start">
                          <span className="text-sm">Political Boundaries</span>
                          <span className="text-xs text-muted-foreground">States & LGAs</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto py-2">
                        <div className="flex flex-col items-start">
                          <span className="text-sm">Incidents</span>
                          <span className="text-xs text-muted-foreground">Conflict events</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto py-2">
                        <div className="flex flex-col items-start">
                          <span className="text-sm">Risk Levels</span>
                          <span className="text-xs text-muted-foreground">Threat assessment</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto py-2">
                        <div className="flex flex-col items-start">
                          <span className="text-sm">Resources</span>
                          <span className="text-xs text-muted-foreground">Response assets</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Timelines</CardTitle>
              <CardDescription>
                Temporal visualization of conflict evolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Clock className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Conflict Timeline Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide interactive timeline visualization, conflict progression tracking, and temporal pattern analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="heatmaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Heatmaps & Risk Zones</CardTitle>
              <CardDescription>
                Visual representation of conflict density and risk areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <BarChart3 className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Heatmap & Risk Zone Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will feature conflict density mapping, risk zone delineation, and trend visualization across Nigerian regions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="indicators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Early Warning Indicators Display</CardTitle>
              <CardDescription>
                Visual monitoring of early warning indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <AlertTriangle className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Warning Indicators Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will include indicator dashboard visualization, threshold monitoring, and trend indicators with visual alerting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customizable Dashboards by User Role</CardTitle>
              <CardDescription>
                Role-specific dashboard configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <LayoutDashboard className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Custom Dashboard Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide dashboard customization tools, role-based views, and widget configuration for different stakeholders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}