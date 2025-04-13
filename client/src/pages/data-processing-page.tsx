import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageTemplate from "@/components/modules/PageTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Globe, Clock, AlertCircle, Filter, FileCheck } from "lucide-react";
import { useState } from "react";

export default function DataProcessingPage() {
  const [activeTab, setActiveTab] = useState("nlp");
  
  const toolbar = (
    <Button>
      <FileCheck className="h-4 w-4 mr-2" />
      Run Analysis
    </Button>
  );
  
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
                      <Button variant="outline" size="sm" className="w-full">
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
                      <Button variant="outline" size="sm" className="w-full">
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
                      <Button variant="outline" size="sm" className="w-full">
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
                      <Button variant="outline" size="sm" className="w-full">
                        Generate Summaries
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
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
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <Globe className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Geospatial Analysis Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will include hotspot mapping, proximity analysis, and geographical clustering of incidents across Nigeria.
                  </p>
                </div>
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