import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Sparkles, 
  Brain, 
  Globe, 
  LineChart, 
  Clock, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Search,
  Loader2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function AiAnalysisPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("risk-analysis");
  const [region, setRegion] = useState("North East");
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Fetch data for analysis
  const { 
    data: incidents, 
    isLoading: isLoadingIncidents,
  } = useQuery({
    queryKey: ["/api/incidents"],
  });
  
  const { 
    data: riskIndicators, 
    isLoading: isLoadingIndicators, 
  } = useQuery({
    queryKey: ["/api/risk-indicators"],
  });
  
  // Function to generate AI analysis
  const handleGenerateAnalysis = () => {
    // In a real implementation, this would call the AI service
    setIsGeneratingAnalysis(true);
    
    // Simulate AI analysis with a timeout
    setTimeout(() => {
      // Example analysis result
      const result = {
        title: `Risk Analysis for ${region} Region of Nigeria`,
        timestamp: new Date().toISOString(),
        severity: "medium",
        riskLevel: 67,
        description: "Based on the analysis of recent incidents and risk indicators, the region is experiencing moderate security challenges that require monitoring.",
        keyFindings: [
          "Increased small arms proliferation in border communities",
          "Rising community tensions over resource allocation",
          "Sporadic incidents of violence between herders and farmers",
          "Limited government presence in remote areas"
        ],
        recommendations: [
          "Enhance security presence in identified hotspots",
          "Initiate community dialogue forums to address resource disputes",
          "Implement early response mechanisms for farmer-herder conflicts",
          "Improve coordination between security agencies and local communities"
        ],
        risingSectors: ["Resource Competition", "Community Violence", "Small Arms"],
        improvingSectors: ["Political Stability", "Inter-religious Relations"],
        historicalTrend: "increasing",
        incidentsAnalyzed: 24,
        indicatorsConsidered: 18,
        confidenceScore: 0.83
      };
      
      setAnalysisResult(result);
      setIsGeneratingAnalysis(false);
      
      toast({
        title: "Analysis Complete",
        description: "AI-powered risk analysis has been generated successfully.",
      });
    }, 3000);
  };
  
  // Helper function to render a risk badge
  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low Risk</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <MainLayout title="AI Analysis">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Analysis</h1>
        <p className="text-gray-500 mt-1">
          Leverage artificial intelligence to analyze conflict data and generate insights
        </p>
      </div>
      
      <Tabs 
        defaultValue="risk-analysis" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-[500px]">
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="incident-analysis">Incident Analysis</TabsTrigger>
          <TabsTrigger value="pattern-detection">Pattern Detection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                  AI Risk Analysis
                </CardTitle>
                <CardDescription>
                  Generate comprehensive risk analysis for specific regions based on incident data and risk indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Region</label>
                      <Select 
                        value={region} 
                        onValueChange={setRegion}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="North East">North East Nigeria</SelectItem>
                          <SelectItem value="North West">North West Nigeria</SelectItem>
                          <SelectItem value="North Central">North Central Nigeria</SelectItem>
                          <SelectItem value="South West">South West Nigeria</SelectItem>
                          <SelectItem value="South East">South East Nigeria</SelectItem>
                          <SelectItem value="South South">South South Nigeria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timeframe</label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="90">Last 90 days</SelectItem>
                          <SelectItem value="180">Last 6 months</SelectItem>
                          <SelectItem value="365">Last 1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {isLoadingIncidents || isLoadingIndicators ? 
                          <span className="flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Loading data...
                          </span> : 
                          `${incidents?.length || 0} incidents and ${riskIndicators?.length || 0} indicators available for analysis`
                        }
                      </span>
                    </div>
                    
                    <Button onClick={handleGenerateAnalysis} disabled={isGeneratingAnalysis}>
                      {isGeneratingAnalysis ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Analysis
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {analysisResult && (
                    <div className="mt-6 space-y-4 border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold">{analysisResult.title}</h3>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(analysisResult.severity)}
                          <Badge variant="outline" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(analysisResult.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-700">{analysisResult.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Key Findings</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {analysisResult.keyFindings.map((finding: string, index: number) => (
                              <li key={index} className="text-gray-700">{finding}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {analysisResult.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-gray-700">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">Risk Level</p>
                          <p className="text-2xl font-bold text-blue-700">{analysisResult.riskLevel}%</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="text-2xl font-bold text-blue-700">{(analysisResult.confidenceScore * 100).toFixed(0)}%</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">Incidents</p>
                          <p className="text-2xl font-bold text-blue-700">{analysisResult.incidentsAnalyzed}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs text-gray-500">Indicators</p>
                          <p className="text-2xl font-bold text-blue-700">{analysisResult.indicatorsConsidered}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button size="sm">
                          Create Alert
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-500" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <h3 className="font-medium text-sm mb-1 flex items-center">
                        <LineChart className="h-4 w-4 mr-1 text-blue-600" />
                        Trend Analysis
                      </h3>
                      <p className="text-xs text-gray-600">Analyze historical data to identify conflict patterns and trends</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-md">
                      <h3 className="font-medium text-sm mb-1 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1 text-blue-600" />
                        Risk Scoring
                      </h3>
                      <p className="text-xs text-gray-600">Quantify risk levels based on multiple factors and indicators</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-md">
                      <h3 className="font-medium text-sm mb-1 flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-blue-600" />
                        Spatial Analysis
                      </h3>
                      <p className="text-xs text-gray-600">Identify geographic hotspots and conflict clusters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Analyses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-md p-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">North East Analysis</p>
                        <Badge className="bg-amber-100 text-amber-800 text-xs">Medium</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Generated 2 days ago</p>
                    </div>
                    
                    <div className="border rounded-md p-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">South East Analysis</p>
                        <Badge className="bg-red-100 text-red-800 text-xs">High</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Generated 5 days ago</p>
                    </div>
                    
                    <div className="border rounded-md p-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">North Central Analysis</p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Low</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Generated 1 week ago</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Analyses
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="incident-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Incident Analysis</CardTitle>
              <CardDescription>Analyze specific incidents to understand causality and potential escalation factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Incident</h3>
                <p className="text-gray-500 mb-4">Choose a specific incident to analyze its details, related events, and potential outcomes</p>
                <div className="w-full max-w-md">
                  <Input placeholder="Search incidents by title or ID..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pattern-detection">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Detection</CardTitle>
              <CardDescription>Use AI to detect emerging conflict patterns across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Under Development</h3>
                <p className="text-gray-500 mb-4">The pattern detection module is currently being developed and will be available soon</p>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Again Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}