import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import PageTemplate from "@/components/modules/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, FileDown, FileUp, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("api");
  
  const toolbar = (
    <Button>
      <Link className="h-4 w-4 mr-2" />
      New Integration
    </Button>
  );
  
  const integrations = [
    { 
      name: "UN OCHA HDX", 
      description: "Humanitarian Data Exchange integration for crisis data", 
      status: "Active",
      logo: "🌐"
    },
    { 
      name: "ACLED", 
      description: "Armed Conflict Location & Event Data Project integration", 
      status: "Active",
      logo: "📊"
    },
    { 
      name: "UNHCR Refugee Data", 
      description: "Displaced population and refugee data integration", 
      status: "Inactive",
      logo: "🏠"
    },
    { 
      name: "Nigeria National Bureau of Statistics", 
      description: "Official Nigerian government statistics", 
      status: "Active",
      logo: "🇳🇬"
    },
    { 
      name: "WHO Health Emergency Data", 
      description: "Health-related emergency data integration", 
      status: "Pending",
      logo: "🏥"
    },
    { 
      name: "World Bank Development Indicators", 
      description: "Socioeconomic indicators for conflict analysis", 
      status: "Inactive",
      logo: "💰"
    },
  ];
  
  return (
    <PageTemplate 
      title="Integration & Interoperability"
      description="Connect with external data sources and systems"
      toolbar={toolbar}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="api" className="py-2">
            <Code className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">API Access & Webhooks</span>
            <span className="md:hidden">API</span>
          </TabsTrigger>
          <TabsTrigger value="platforms" className="py-2">
            <Link className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Third-party Platforms</span>
            <span className="md:hidden">Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="py-2">
            <FileDown className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Data Import & Export</span>
            <span className="md:hidden">Data</span>
          </TabsTrigger>
          <TabsTrigger value="standards" className="py-2">
            <FileUp className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Open Standards</span>
            <span className="md:hidden">Standards</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Access & Webhooks</CardTitle>
              <CardDescription>
                Programmatic access to EWERS data and functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">REST API</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <CardDescription>RESTful API endpoints for data access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      The EWERS REST API provides secure access to conflict data, alerts, and response information through standardized HTTP endpoints.
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium">API Enabled</span>
                      <Switch checked={true} />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      API Documentation
                    </Button>
                    <Button size="sm">
                      Manage Keys
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Webhooks</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">Configuration</Badge>
                    </div>
                    <CardDescription>Event-driven notifications for system changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      EWERS webhooks notify external systems when significant events occur, including new alerts, incident updates, and risk assessment changes.
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium">Webhooks Enabled</span>
                      <Switch checked={false} />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      Example Payloads
                    </Button>
                    <Button size="sm">
                      Configure
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Security & Usage</CardTitle>
                    <CardDescription>Manage API access and monitor usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Rate Limiting</h4>
                          <p className="text-xs text-muted-foreground">Control API request frequency</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Authentication</h4>
                          <p className="text-xs text-muted-foreground">API authentication methods</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Usage Analytics</h4>
                          <p className="text-xs text-muted-foreground">Monitor API consumption</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-party Platform Integration</CardTitle>
              <CardDescription>
                Connect with external humanitarian and conflict monitoring platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                  <Card key={integration.name} className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{integration.logo}</span>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                        </div>
                        <Badge className={
                          integration.status === "Active" ? "bg-green-100 text-green-800" :
                          integration.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-neutral-100 text-neutral-800"
                        }>
                          {integration.status}
                        </Badge>
                      </div>
                      <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Integration Status</span>
                        <Switch checked={integration.status === "Active"} />
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button size="sm">
                        Test Connection
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export & Import Tools</CardTitle>
              <CardDescription>
                Import external data and export system data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <FileDown className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Data Import & Export Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide data import wizards, export functionality for various formats, and scheduled data synchronization features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="standards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Standards Compliance</CardTitle>
              <CardDescription>
                Support for humanitarian and conflict data standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <FileUp className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Open Standards Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will implement support for humanitarian exchange language (HXL), common alerting protocol (CAP), and other relevant open standards.
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