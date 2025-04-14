import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageTemplate from "@/components/modules/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  BarChart3, 
  Globe, 
  Clock, 
  AlertCircle, 
  Filter, 
  FileCheck,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useState } from "react";

// Using direct fetch instead of apiRequest to troubleshoot
const API_URL = window.location.origin;

export default function DataProcessingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nlp");
  const [inputText, setInputText] = useState("");
  const [showNlpInput, setShowNlpInput] = useState(false);
  const [nlpTask, setNlpTask] = useState<"sentiment" | "keywords" | "classify" | "summarize" | "entities" | null>(null);
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toolbar = (
    <Button 
      onClick={() => {
        setShowNlpInput(false);
        setNlpTask(null);
        setNlpResult(null);
        setInputText("");
      }}
      type="button"
    >
      <FileCheck className="h-4 w-4 mr-2" />
      Reset Analysis
    </Button>
  );
  
  // Handle button click to open NLP input form
  const handleOpenNlpInput = (task: "sentiment" | "keywords" | "classify" | "summarize" | "entities") => {
    console.log(`Opening ${task} input`);
    setShowNlpInput(true);
    setNlpTask(task);
    setNlpResult(null);
    setInputText("");
  };
  
  // Handle NLP analysis
  const handleNlpAnalysis = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let endpoint = "";
      switch (nlpTask) {
        case "sentiment":
          endpoint = "/api/nlp/sentiment";
          break;
        case "keywords":
          endpoint = "/api/nlp/keywords";
          break;
        case "classify":
          endpoint = "/api/nlp/classify";
          break;
        case "summarize":
          endpoint = "/api/nlp/summarize";
          break;
        case "entities":
          endpoint = "/api/nlp/entities";
          break;
        default:
          throw new Error("Invalid NLP task");
      }
      
      console.log(`Sending request to ${endpoint} with text: ${inputText.substring(0, 30)}...`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('NLP result:', result);
      setNlpResult(result);
    } catch (error) {
      console.error("NLP analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Could not complete the analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <PageTemplate 
      title="Data Processing & Analysis"
      description="Process, analyze, and extract insights from collected data"
      toolbar={toolbar}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="nlp" className="py-2">
            <Brain className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">NLP</span>
            <span className="md:hidden">NLP</span>
          </TabsTrigger>
          <TabsTrigger value="geospatial" className="py-2">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Geospatial</span>
            <span className="md:hidden">Geo</span>
          </TabsTrigger>
          <TabsTrigger value="temporal" className="py-2">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Temporal</span>
            <span className="md:hidden">Time</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="py-2">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Patterns</span>
            <span className="md:hidden">Pattern</span>
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="py-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Anomaly</span>
            <span className="md:hidden">Anomaly</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="py-2">
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Validation</span>
            <span className="md:hidden">Valid</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nlp" className="space-y-6">
          {!showNlpInput ? (
            <Card>
              <CardHeader>
                <CardTitle>Natural Language Processing</CardTitle>
                <CardDescription>
                  Extract meaning, sentiment, and key insights from textual data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                      <CardDescription>Analyze emotional tone of content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Sentiment analysis measures the positive, negative, or neutral tone in text data from news reports, social media, and community feedback related to conflict events.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setShowNlpInput(true);
                            setNlpTask("sentiment");
                            setNlpResult(null);
                          }}
                        >
                          Run Sentiment Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Keyword Extraction</CardTitle>
                      <CardDescription>Identify important terms and topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Extract key terms, phrases, named entities, and topics from unstructured text to identify emerging conflict issues, involved parties, and potential crisis triggers.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setShowNlpInput(true);
                            setNlpTask("keywords");
                            setNlpResult(null);
                          }}
                        >
                          Extract Keywords
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Classification</CardTitle>
                      <CardDescription>Categorize text by content type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Automatically classify text into predefined categories such as conflict type, involved actors, and potential humanitarian impacts to organize information.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setShowNlpInput(true);
                            setNlpTask("classify");
                            setNlpResult(null);
                          }}
                        >
                          Classify Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Summarization</CardTitle>
                      <CardDescription>Generate concise overviews of text data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Create condensed summaries of lengthy reports, articles, and social media discussions to facilitate rapid information processing during crisis situations.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setShowNlpInput(true);
                            setNlpTask("summarize");
                            setNlpResult(null);
                          }}
                        >
                          Generate Summaries
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Entity Recognition</CardTitle>
                      <CardDescription>Extract named entities from text</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Identify and extract named entities such as people, organizations, locations, and events from text to understand key actors and contexts in conflict situations.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setShowNlpInput(true);
                            setNlpTask("entities");
                            setNlpResult(null);
                          }}
                        >
                          Extract Entities
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {nlpTask === "sentiment" && "Sentiment Analysis"}
                    {nlpTask === "keywords" && "Keyword Extraction"}
                    {nlpTask === "classify" && "Text Classification"}
                    {nlpTask === "summarize" && "Text Summarization"}
                    {nlpTask === "entities" && "Named Entity Recognition"}
                  </CardTitle>
                  <CardDescription>
                    Enter your text below to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter text to analyze..."
                      className="min-h-[200px]"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNlpInput(false);
                          setNlpTask(null);
                          setInputText("");
                          setNlpResult(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleNlpAnalysis}
                        disabled={isProcessing || !inputText.trim()}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {nlpResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nlpTask === "sentiment" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-md">
                          <div>
                            <p className="font-semibold">Sentiment:</p>
                            <p className="text-2xl font-bold capitalize">
                              {nlpResult.label}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Score:</p>
                            <p className="text-2xl font-bold">
                              {(nlpResult.score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">Confidence:</p>
                            <p className="text-2xl font-bold">
                              {(nlpResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sentiment scores range from -100% (negative) to 100% (positive).
                          Scores near 0% indicate neutral sentiment.
                        </p>
                      </div>
                    )}

                    {nlpTask === "keywords" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nlpResult.map((keyword: any, index: number) => (
                            <div 
                              key={index} 
                              className="p-3 bg-blue-50 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold">{keyword.text}</p>
                                <p className="text-xs text-blue-600">Type: {keyword.type}</p>
                              </div>
                              <div className="text-sm">
                                <span className="inline-block bg-blue-100 px-2 py-1 rounded-full">
                                  {(keyword.relevance * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nlpTask === "classify" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          {nlpResult.map((category: any, index: number) => (
                            <div 
                              key={index} 
                              className="p-3 bg-blue-50 rounded-md flex justify-between items-center"
                            >
                              <p className="font-semibold capitalize">{category.category}</p>
                              <span className="inline-block bg-blue-100 px-2 py-1 rounded-full">
                                {(category.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nlpTask === "summarize" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-md">
                          <p className="font-semibold">Summary:</p>
                          <p className="mt-2">{nlpResult.summary}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The summary is an extractive summary that preserves the most important sentences 
                          from the original text.
                        </p>
                      </div>
                    )}

                    {nlpTask === "entities" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                          {nlpResult.map((entity: any, index: number) => (
                            <div 
                              key={index} 
                              className="p-3 bg-blue-50 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold">{entity.text}</p>
                                <p className="text-xs text-blue-600">Type: {entity.type}</p>
                              </div>
                              <span className="inline-block bg-blue-100 px-2 py-1 rounded-full">
                                {(entity.relevance * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="geospatial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geospatial Analysis</CardTitle>
              <CardDescription>
                Analyze conflict data within geographical context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Hotspot Mapping</CardTitle>
                    <CardDescription>Identify areas with high incident concentration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualize areas with high concentrations of conflict incidents to identify patterns and prioritize response efforts.
                    </p>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Map Feature Activated",
                            description: "Conflict hotspot map for Nigeria is now available in the Visualization page.",
                          });
                          // Navigate to the visualization page
                          window.location.href = "/visualization";
                        }}
                      >
                        View Hotspot Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Proximity Analysis</CardTitle>
                    <CardDescription>Measure distance between incidents and resources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Calculate distances between conflict events and response resources to optimize deployment strategies and identify coverage gaps.
                    </p>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Proximity Analysis",
                            description: "The proximity analysis tool is available in the Visualization page.",
                          });
                          // Navigate to the visualization page
                          window.location.href = "/visualization";
                        }}
                      >
                        Run Proximity Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Spatial Clustering</CardTitle>
                    <CardDescription>Group incidents by geographic proximity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Group incidents based on spatial relationships to identify patterns and focus areas for intervention.
                    </p>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Spatial Clustering",
                            description: "Spatial clustering analysis is available in the Visualization page.",
                          });
                          // Navigate to the visualization page
                          window.location.href = "/visualization";
                        }}
                      >
                        Generate Clusters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Administrative Boundaries</CardTitle>
                    <CardDescription>Analyze incidents by political divisions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View incidents by states, local government areas, and other administrative boundaries to coordinate with relevant authorities.
                    </p>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Administrative Analysis",
                            description: "Administrative boundary analysis is available in the Visualization page.",
                          });
                          // Navigate to the visualization page
                          window.location.href = "/visualization";
                        }}
                      >
                        View Boundary Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="temporal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Analysis</CardTitle>
              <CardDescription>
                Track and analyze time-based patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Clock className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Temporal Analysis Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will support time series analysis, seasonal pattern identification, and trend analysis of conflict events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Pattern Recognition</CardTitle>
              <CardDescription>
                Identify repeating conflict patterns and behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <BarChart3 className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Pattern Recognition Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will detect recurring conflict patterns, actor relationship analysis, and conflict escalation sequences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="anomaly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                Identify unusual patterns or outliers that may indicate emerging crises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <AlertCircle className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Anomaly Detection Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will implement statistical anomaly detection, unusual event clustering, and deviation analysis for early warning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Cleaning & Validation</CardTitle>
              <CardDescription>
                Ensure data quality, accuracy, and reliability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Filter className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Data Validation Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide data cleansing tools, duplicate detection, validation workflows, and data quality scoring.
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