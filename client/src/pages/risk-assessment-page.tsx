import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageTemplate from "@/components/modules/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, MapPin, Workflow, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function RiskAssessmentPage() {
  const [activeTab, setActiveTab] = useState("modeling");
  
  const toolbar = (
    <Button>
      <LineChart className="h-4 w-4 mr-2" />
      Run Assessment
    </Button>
  );
  
  const riskScores = [
    { region: "North Central", score: 75, status: "High" },
    { region: "North East", score: 85, status: "Critical" },
    { region: "North West", score: 70, status: "High" },
    { region: "South East", score: 45, status: "Medium" },
    { region: "South South", score: 40, status: "Medium" },
    { region: "South West", score: 30, status: "Low" },
  ];
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };
  
  return (
    <PageTemplate 
      title="Risk Assessment & Conflict Prediction"
      description="Assess conflict risks and predict potential crisis situations"
      toolbar={toolbar}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1">
          <TabsTrigger value="modeling" className="py-2">
            <LineChart className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Risk Modeling</span>
            <span className="md:hidden">Model</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Trend Analysis</span>
            <span className="md:hidden">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="mapping" className="py-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Vulnerability Mapping</span>
            <span className="md:hidden">Map</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="py-2">
            <Workflow className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Scenario Simulation</span>
            <span className="md:hidden">Sim</span>
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="py-2">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Threshold Alerts</span>
            <span className="md:hidden">Alert</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="modeling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Risk Modeling</CardTitle>
              <CardDescription>
                Statistical and machine learning models for conflict risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Current Risk Assessment for Nigeria</h3>
                  <div className="space-y-3">
                    {riskScores.map((region) => (
                      <div key={region.region} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{region.region}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            region.status === "Critical" ? "bg-red-100 text-red-800" :
                            region.status === "High" ? "bg-orange-100 text-orange-800" :
                            region.status === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {region.status}
                          </span>
                        </div>
                        <Progress value={region.score} className={getStatusColor(region.status)} />
                        <p className="text-xs text-muted-foreground">Risk Score: {region.score}/100</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Statistical Models</CardTitle>
                      <CardDescription>Bayesian and time series analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Statistical models analyze historical conflict data using time series forecasting, Bayesian networks, and regression techniques to identify risk patterns.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          Configure Models
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Machine Learning Models</CardTitle>
                      <CardDescription>AI-powered risk assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Advanced machine learning techniques including neural networks and ensemble methods to detect complex patterns and improve prediction accuracy.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          Train Models
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis & Forecasting</CardTitle>
              <CardDescription>
                Analyze conflict trends and forecast potential developments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <TrendingUp className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Trend Analysis Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide trend identification, seasonal analysis, and long-term forecasting tools for conflict patterns across Nigeria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability and Resilience Mapping</CardTitle>
              <CardDescription>
                Map areas of vulnerability and community resilience factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <MapPin className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Vulnerability Mapping Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will feature vulnerability indexing, community resilience assessment, and geo-referenced risk mapping across Nigerian territories.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Simulation Tools</CardTitle>
              <CardDescription>
                Simulate potential conflict scenarios and test response strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Workflow className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Scenario Simulation Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will offer conflict scenario development, response strategy testing, and impact assessment simulations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="thresholds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Alerts (Trigger Mechanisms)</CardTitle>
              <CardDescription>
                Set up automated alerts based on risk thresholds and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Bell className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Threshold Alerts Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will include threshold configuration, multi-variable triggers, and escalation level automation for emergency response.
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