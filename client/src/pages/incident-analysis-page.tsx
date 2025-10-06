import React, { useState, Component, ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PatternDetection from "@/components/analysis/PatternDetection";
import { useQuery } from "@tanstack/react-query";
import { Incident } from "@shared/schema.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChart3, Calendar, Filter, Loader2, MapPin, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Error boundary component to catch errors in rendering
class ErrorBoundary extends Component<{ 
  children: ReactNode;
  fallback: ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Pattern detection error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function IncidentAnalysisPage() {
  const [activeTab, setActiveTab] = useState("patterns");
  const [timeFrame, setTimeFrame] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch incidents
  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  // Calculate severity distribution
  const severityDistribution = React.useMemo(() => {
    if (!incidents) return { high: 0, medium: 0, low: 0 };
    
    return incidents.reduce(
      (acc: {high: number, medium: number, low: number}, incident: Incident) => {
        const severity = incident.severity?.toLowerCase() || 'unknown';
        if (severity === 'high') acc.high += 1;
        else if (severity === 'medium') acc.medium += 1;
        else if (severity === 'low') acc.low += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
  }, [incidents]);

  // Calculate region distribution
  const regionDistribution = React.useMemo(() => {
    if (!incidents) return {};
    
    const regions: Record<string, number> = {};
    incidents.forEach((incident: Incident) => {
      const region = incident.region || 'Unknown';
      regions[region] = (regions[region] || 0) + 1;
    });
    
    return regions;
  }, [incidents]);

  // Calculate category distribution
  const categoryDistribution = React.useMemo(() => {
    if (!incidents) return {};
    
    const categories: Record<string, number> = {};
    incidents.forEach((incident: Incident) => {
      const category = incident.category?.replace('_', ' ') || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  }, [incidents]);

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <MainLayout title="Incident Analysis">
      <div className="flex flex-col space-y-4">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Analysis Filters
            </CardTitle>
            <CardDescription>
              Filter incidents for in-depth analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="time-frame">Time Frame</Label>
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                  <SelectTrigger id="time-frame">
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="year">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north-central">North Central</SelectItem>
                    <SelectItem value="north-east">North East</SelectItem>
                    <SelectItem value="north-west">North West</SelectItem>
                    <SelectItem value="south-east">South East</SelectItem>
                    <SelectItem value="south-south">South South</SelectItem>
                    <SelectItem value="south-west">South West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="terrorism">Terrorism</SelectItem>
                    <SelectItem value="kidnapping">Kidnapping</SelectItem>
                    <SelectItem value="civil_unrest">Civil Unrest</SelectItem>
                    <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Incidents */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Total Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-3xl font-bold">{incidents?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          {/* Severity Breakdown */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
                Severity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-red-100 text-red-800">
                    High: {severityDistribution.high}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-800">
                    Medium: {severityDistribution.medium}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    Low: {severityDistribution.low}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                Top Affected Region
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div>
                  {Object.entries(regionDistribution).length > 0 ? (
                    <div className="text-lg font-semibold">
                      {Object.entries(regionDistribution)
                        .sort((a, b) => b[1] - a[1])[0][0]}
                      <span className="text-sm font-normal ml-2 text-muted-foreground">
                        ({Object.entries(regionDistribution)
                          .sort((a, b) => b[1] - a[1])[0][1]} incidents)
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No data available</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="patterns" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="patterns" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Pattern Detection
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              Statistical Analysis
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Correlation Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns">
            <ErrorBoundary fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Pattern Detection</CardTitle>
                  <CardDescription>Advanced pattern analysis for security incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <div className="inline-flex rounded-full bg-blue-100 p-4 mb-4">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Pattern Detection</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      Our AI-powered pattern detection analyzes incident data to identify temporal, 
                      spatial, and actor-based patterns that may indicate emerging threats.
                    </p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                      Analyze Patterns
                    </Button>
                  </div>
                </CardContent>
              </Card>
            }>
              <PatternDetection className="shadow-md" />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Incident Categories</CardTitle>
                  <CardDescription>
                    Distribution of incidents by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : Object.keys(categoryDistribution).length > 0 ? (
                    <div className="space-y-3 mt-2">
                      {Object.entries(categoryDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count], index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="capitalize text-sm">{category}</span>
                              <span className="text-sm text-muted-foreground">{count} incidents</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (count / Math.max(...Object.values(categoryDistribution))) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Regional Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Regional Distribution</CardTitle>
                  <CardDescription>
                    Distribution of incidents across regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : Object.keys(regionDistribution).length > 0 ? (
                    <div className="space-y-3 mt-2">
                      {Object.entries(regionDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([region, count], index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{region}</span>
                              <span className="text-sm text-muted-foreground">{count} incidents</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-2 bg-green-500 rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (count / Math.max(...Object.values(regionDistribution))) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No regional data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlation">
            <Card>
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
                <CardDescription>
                  Identifying relationships between different factors in incident data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-4 text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Advanced correlation analysis</h3>
                  <p className="max-w-md mx-auto mb-4">
                    Our AI-powered correlation engine identifies meaningful connections 
                    between incidents, actors, locations, and timestamps.
                  </p>
                  <Button disabled={isLoading}>
                    Generate Correlation Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}