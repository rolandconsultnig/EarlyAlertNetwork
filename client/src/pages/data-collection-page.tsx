import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncidentSchema, DataSource, insertDataSourceSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Database, Radio, Users, RefreshCw, Shield, AlertTriangle, MessageCircle, UserCheck, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Create a schema for incident reporting
const incidentSchema = insertIncidentSchema
  .pick({
    title: true,
    description: true,
    location: true,
    severity: true,
  })
  .extend({
    location: z.string().min(3, "Location must be at least 3 characters"),
    severity: z.enum(["low", "medium", "high"], {
      required_error: "Please select a severity level",
    }),
  });

type IncidentFormValues = z.infer<typeof incidentSchema>;

// Create a schema for data source configuration
const dataSourceSchema = insertDataSourceSchema
  .pick({
    name: true,
    type: true,
    apiEndpoint: true,
    apiKey: true,
    region: true,
    frequency: true,
    dataFormat: true,
  })
  .extend({
    description: z.string().min(3, "Description must be at least 3 characters"),
    type: z.enum(["social_media", "news_media", "satellite", "government_report", "ngo_report", "sensor_network", "field_report"], {
      required_error: "Please select a source type",
    }),
    frequency: z.enum(["hourly", "daily", "weekly", "real-time"], {
      required_error: "Please select a frequency",
    }),
    dataFormat: z.enum(["json", "xml", "csv", "geojson"], {
      required_error: "Please select a data format",
    }),
  });

type DataSourceFormValues = z.infer<typeof dataSourceSchema>;

export default function DataCollectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for data sources
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<Partial<DataSource>>({
    id: 0,
    name: "",
    type: "",
    region: "Nigeria",
  });
  const [refetchLoading, setRefetchLoading] = useState(false);
  
  // Data source form
  const sourceForm = useForm<DataSourceFormValues>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      name: "",
      type: "news_media",
      description: "",
      apiEndpoint: "",
      apiKey: "",
      region: "Nigeria",
      frequency: "daily",
      dataFormat: "json",
    }
  });
  
  // Fetch existing data sources
  const { 
    data: sources, 
    isLoading: isLoadingSources,
    refetch: refetchSources
  } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });
  
  // Effect to update the form when a source is selected for configuration
  React.useEffect(() => {
    if (currentSource && configureDialogOpen) {
      sourceForm.reset({
        name: currentSource.name || "",
        type: currentSource.type as any || "news_media",
        description: currentSource.description || "",
        apiEndpoint: currentSource.apiEndpoint || "",
        apiKey: currentSource.apiKey || "",
        region: currentSource.region || "Nigeria",
        frequency: currentSource.frequency as any || "daily",
        dataFormat: currentSource.dataFormat as any || "json",
      });
    }
  }, [currentSource, configureDialogOpen]);
  
  // Create or update data source mutation
  const saveDataSourceMutation = useMutation({
    mutationFn: async (data: DataSourceFormValues) => {
      // If currentSource.id is positive, we're updating an existing source
      if (currentSource.id && currentSource.id > 0) {
        const res = await apiRequest("PUT", `/api/data-sources/${currentSource.id}`, data);
        return await res.json();
      } else {
        // Otherwise we're creating a new source
        const res = await apiRequest("POST", "/api/data-sources", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({
        title: currentSource.id && currentSource.id > 0 ? "Data Source Updated" : "Data Source Created",
        description: `The data source has been ${currentSource.id && currentSource.id > 0 ? 'updated' : 'created'} successfully.`,
      });
      sourceForm.reset();
      setConfigureDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save data source",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Helper function to handle form submission
  function onSubmitDataSource(data: DataSourceFormValues) {
    saveDataSourceMutation.mutate(data);
  }
  
  // Helper function to format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Helper function to format source type for display
  const formatSourceType = (type: string): string => {
    switch (type) {
      case 'news_media':
        return 'News Media';
      case 'social_media':
        return 'Social Media';
      case 'satellite':
        return 'Satellite';
      case 'government_report':
        return 'Government';
      case 'ngo_report':
        return 'NGO';
      case 'sensor_network':
        return 'Sensor Network';
      case 'field_report':
        return 'Field Report';
      default:
        return capitalizeFirstLetter(type.replace('_', ' '));
    }
  };
  
  // Incident form setup
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      severity: undefined,
    },
  });

  const reportIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormValues) => {
      // Add the required reportedBy field (current user's ID)
      const incidentData = {
        ...data,
        reportedBy: user!.id,
        status: "active",
      };
      
      const res = await apiRequest("POST", "/api/incidents", incidentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Reported",
        description: "Your incident report has been submitted successfully.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: IncidentFormValues) {
    reportIncidentMutation.mutate(data);
  }

  // Handle refreshing data sources
  const handleRefresh = async () => {
    setRefetchLoading(true);
    await refetchSources();
    setRefetchLoading(false);
    
    toast({
      title: "Data Sources Refreshed",
      description: "The data source list has been updated.",
    });
  };
  
  // State for fetch data loading and processing status
  const [fetchingData, setFetchingData] = useState(false);
  const [processingStats, setProcessingStats] = useState<{
    total: number;
    unprocessed: number;
    processed: number;
    errors: number;
  } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Function to fetch data from active sources
  const fetchFromAllSources = async () => {
    try {
      setFetchingData(true);
      const res = await apiRequest("POST", "/api/data-sources/fetch-all", {});
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }
      
      const result = await res.json();
      
      toast({
        title: "Data Collection Initiated",
        description: `Collection started from ${result.sourcesCount || 0} active data sources.`,
      });
      
      // Refetch the data sources to update their status
      await queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      
      // Start polling for data processing status
      pollDataProcessingStatus();
    } catch (error) {
      toast({
        title: "Data Collection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };
  
  // Function to fetch data from a specific source
  const fetchFromSource = async (sourceId: number) => {
    try {
      setFetchingData(true);
      const res = await apiRequest("POST", `/api/data-sources/${sourceId}/fetch`, {});
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }
      
      const result = await res.json();
      
      toast({
        title: "Data Collection Initiated",
        description: `Started collecting data from source #${sourceId}.`,
      });
      
      // Refetch the data sources to update their status
      await queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      
      // Start polling for data processing status
      pollDataProcessingStatus();
    } catch (error) {
      toast({
        title: "Data Collection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };
  
  // Function to poll data processing status
  const pollDataProcessingStatus = async () => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Create a new polling interval
    const interval = setInterval(async () => {
      try {
        const res = await apiRequest("GET", "/api/collected-data/status", null);
        
        if (!res.ok) {
          throw new Error("Failed to fetch processing status");
        }
        
        const data = await res.json();
        
        if (data.success && data.stats) {
          setProcessingStats(data.stats);
          
          // If all data is processed or there are no unprocessed items, stop polling
          if (data.stats.unprocessed === 0 || 
              (data.stats.processed + data.stats.errors === data.stats.total)) {
            clearInterval(interval);
            setPollingInterval(null);
            
            // Show completion toast
            toast({
              title: "Data Processing Complete",
              description: `Processed ${data.stats.processed} items with ${data.stats.errors} errors.`,
            });
          }
        }
      } catch (error) {
        console.error("Error polling data status:", error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };
  
  return (
    <MainLayout title="Data Collection">
      {/* Data Source Configuration Dialog */}
      <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentSource.id && currentSource.id > 0 
                ? "Edit Data Source" 
                : "Add New Data Source"}
            </DialogTitle>
            <DialogDescription>
              Configure external data source connection details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...sourceForm}>
            <form onSubmit={sourceForm.handleSubmit(onSubmitDataSource)} className="space-y-6">
              <FormField
                control={sourceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nigerian News API" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={sourceForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="news_media">News Media</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="satellite">Satellite Imagery</SelectItem>
                          <SelectItem value="government_report">Government Reports</SelectItem>
                          <SelectItem value="ngo_report">NGO Reports</SelectItem>
                          <SelectItem value="sensor_network">Sensor Network</SelectItem>
                          <SelectItem value="field_report">Field Reports</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Status field without using form controller since it's not in our schema */}
                <div className="form-item">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    onValueChange={(value) => {
                      // We handle this manually since it's not in our form schema
                      setCurrentSource(prev => ({
                        ...prev,
                        status: value
                      }));
                    }} 
                    defaultValue={currentSource.status || "active"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <FormField
                control={sourceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the data source and what kind of data it provides" 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={sourceForm.control}
                name="apiEndpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Endpoint URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://api.example.com/v1/data" 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      The base URL for API requests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={sourceForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your API key" 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      Securely stored and used for authentication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={sourceForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sourceForm.control}
                  name="dataFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Format</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="geojson">GeoJSON</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={sourceForm.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input defaultValue="Nigeria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setConfigureDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={saveDataSourceMutation.isPending}
                >
                  {saveDataSourceMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⊝</span>
                      Saving...
                    </>
                  ) : currentSource.id && currentSource.id > 0 ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="external">External Sources</TabsTrigger>
            <TabsTrigger value="community">Community Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Report an Incident</CardTitle>
                  <CardDescription>
                    Submit a new incident or risk observation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incident Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief title of the incident" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide details about the incident" 
                                className="min-h-32"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Town, District, Region" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="severity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Severity Level</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={reportIncidentMutation.isPending}
                      >
                        {reportIncidentMutation.isPending ? "Submitting..." : "Submit Report"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reporting Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span>Be specific and factual in your description</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span>Include time and exact location when possible</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span>Indicate the number of people affected</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span>Report objectively, avoid assumptions</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span>Specify sources of information if applicable</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">You have not submitted any reports recently</p>
                    <Button variant="link" className="px-0 text-primary">View your report history</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Data Files</CardTitle>
                <CardDescription>
                  Import structured data from files (CSV, JSON, Excel)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-12 text-center w-full max-w-xl">
                  <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drag & Drop Files Here</h3>
                  <p className="text-neutral-500 text-sm mb-6">or</p>
                  <Button>Browse Files</Button>
                  <p className="text-neutral-400 text-xs mt-4">
                    Supported formats: CSV, JSON, Excel, XML
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="external">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>External Data Sources</CardTitle>
                  <CardDescription>
                    Configure connections to external data providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* News Aggregation API */}
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">News Aggregation API</h3>
                        <p className="text-sm text-neutral-500">Collect data from news sources</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => {
                          setCurrentSource({
                            id: 0,
                            name: "News Aggregation API",
                            type: "news_media",
                            description: "Collect and process news articles from major Nigerian outlets",
                            apiEndpoint: "https://newsapi.org/v2/top-headlines",
                            region: "Nigeria",
                            frequency: "hourly",
                            dataFormat: "json"
                          });
                          setConfigureDialogOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                    
                    {/* Social Media Monitor */}
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">Social Media Monitor</h3>
                        <p className="text-sm text-neutral-500">Track social media activity</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => {
                          setCurrentSource({
                            id: 0,
                            name: "Social Media Monitor",
                            type: "social_media",
                            description: "Track social media activity related to conflicts in Nigeria",
                            apiEndpoint: "https://api.social-monitor.com/stream",
                            region: "Nigeria",
                            frequency: "real-time",
                            dataFormat: "json"
                          });
                          setConfigureDialogOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                    
                    {/* Satellite Imagery */}
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">Satellite Imagery</h3>
                        <p className="text-sm text-neutral-500">Imagery and geographic data</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => {
                          setCurrentSource({
                            id: 0,
                            name: "Satellite Imagery",
                            type: "satellite",
                            description: "Satellite imagery for monitoring infrastructure, movements, and environmental changes",
                            apiEndpoint: "https://api.satellite-data.com/v1/imagery",
                            region: "Nigeria",
                            frequency: "daily",
                            dataFormat: "geojson"
                          });
                          setConfigureDialogOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="link" 
                    className="mt-4"
                    onClick={() => {
                      setCurrentSource({
                        id: 0,
                        name: "",
                        type: "",
                        description: "",
                        apiEndpoint: "",
                        region: "Nigeria",
                        frequency: "",
                        dataFormat: ""
                      });
                      setConfigureDialogOpen(true);
                    }}
                  >
                    + Add new data source
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Data Source Status</CardTitle>
                    <CardDescription>
                      Monitor the health and activity of your data connections
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={fetchFromAllSources}
                    disabled={fetchingData}
                    className="ml-2"
                  >
                    {fetchingData ? (
                      <>
                        <span className="animate-spin mr-2">⊝</span>
                        Collecting...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Collect Now
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Data Processing Status */}
                  {processingStats && (
                    <div className="mb-6 p-4 border border-border rounded-md bg-card">
                      <h4 className="text-md font-medium mb-2">Data Processing Status</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Processed</span>
                            <span className="text-sm">{processingStats.processed} / {processingStats.total}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ 
                                width: `${processingStats.total ? (processingStats.processed / processingStats.total) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        {processingStats.errors > 0 && (
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Errors</span>
                              <span className="text-sm text-destructive">{processingStats.errors} / {processingStats.total}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-destructive rounded-full" 
                                style={{ 
                                  width: `${processingStats.total ? (processingStats.errors / processingStats.total) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{processingStats.unprocessed} items remaining</span>
                          {pollingInterval && <span>Processing data...</span>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-8">
                    {isLoadingSources ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : sources && sources.length > 0 ? (
                      sources.map((source) => (
                        <div key={source.id} className="border rounded-md p-3 hover:bg-accent/5">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{source.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${
                                source.status === 'active' ? 'text-success' : 
                                source.status === 'degraded' ? 'text-warning' : 'text-error'
                              }`}>
                                {capitalizeFirstLetter(source.status)}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={source.status !== 'active' || fetchingData}
                                onClick={() => fetchFromSource(source.id)}
                              >
                                {fetchingData ? (
                                  <span className="animate-spin">⊝</span>
                                ) : (
                                  <Database className="h-3 w-3" />
                                )}
                                <span className="ml-1 text-xs">Fetch</span>
                              </Button>
                            </div>
                          </div>
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              source.status === 'active' ? 'bg-success w-4/5' : 
                              source.status === 'degraded' ? 'bg-warning w-1/2' : 'bg-error w-1/5'
                            }`}></div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-neutral-500">
                              Last updated: {formatDate(source.lastUpdated)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Type: {formatSourceType(source.type)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-500">No configured data sources</p>
                        <p className="text-sm text-neutral-400">Configure a data source to start collecting data</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="mt-6 w-full"
                    onClick={handleRefresh}
                    disabled={refetchLoading}
                  >
                    {refetchLoading ? (
                      <>
                        <span className="animate-spin mr-2">⊝</span>
                        Refreshing...
                      </>
                    ) : "Refresh Data Sources"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
                <CardDescription>
                  Collect reports and observations from community members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">SMS Data Collection</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Configure SMS-based reporting for community members without internet access.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Radio className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium">SMS Number:</span>
                        <span className="text-sm ml-2">+2348123456789</span>
                        <Button variant="ghost" size="sm" className="ml-auto">Edit</Button>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">SMS Format Template:</p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 text-sm font-mono">
                          REPORT [Location] [Type] [Description]
                        </div>
                      </div>
                      
                      <div className="mb-4 border rounded-md p-3">
                        <h4 className="font-medium mb-2">SMS Gateway Configuration</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Gateway Type:</p>
                              <p className="text-sm text-muted-foreground">Twilio SMS</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Fallback Gateway:</p>
                              <p className="text-sm text-muted-foreground">Clickatell</p>
                            </div>
                            <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200">
                              Standby
                            </Badge>
                          </div>
                          
                          <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full">
                              Configure SMS Gateway
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Community Informants</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Manage your network of trusted community informants.
                    </p>
                    
                    <div className="border border-neutral-200 rounded-md divide-y mb-4">
                      <div className="flex items-center p-3">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium">Total Informants:</span>
                        <span className="text-sm ml-2">32</span>
                      </div>
                      
                      <div className="flex items-center p-3">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium">Active in Last 30 Days:</span>
                        <span className="text-sm ml-2">24</span>
                      </div>
                      
                      <div className="flex items-center p-3">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium">Geographic Coverage:</span>
                        <span className="text-sm ml-2">12 regions</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 mb-4">
                      <h4 className="font-medium mb-2">Recent Informant Activities</h4>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-neutral-50 rounded">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New Report Submitted</p>
                            <p className="text-xs text-neutral-500">Abuja North - 2 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-2 bg-neutral-50 rounded">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">New Informant Registration</p>
                            <p className="text-xs text-neutral-500">Lagos Area - 5 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-2 bg-neutral-50 rounded">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                            <BadgeCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Informant Verification Complete</p>
                            <p className="text-xs text-neutral-500">Port Harcourt - 1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1">Manage Informant Network</Button>
                      <Button variant="outline" className="flex-1">Add New Informant</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
