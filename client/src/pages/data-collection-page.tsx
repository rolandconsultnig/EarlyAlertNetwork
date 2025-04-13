import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIncidentSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Database, Radio, Users } from "lucide-react";

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

export default function DataCollectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  return (
    <MainLayout title="Data Collection">
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
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">News Aggregation API</h3>
                        <p className="text-sm text-neutral-500">Collect data from news sources</p>
                      </div>
                      <Button variant="outline" className="ml-auto">Configure</Button>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">Social Media Monitor</h3>
                        <p className="text-sm text-neutral-500">Track social media activity</p>
                      </div>
                      <Button variant="outline" className="ml-auto">Configure</Button>
                    </div>
                    
                    <div className="flex items-center p-3 rounded-md border border-neutral-200 bg-neutral-50">
                      <Database className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium">Satellite Imagery</h3>
                        <p className="text-sm text-neutral-500">Imagery and geographic data</p>
                      </div>
                      <Button variant="outline" className="ml-auto">Configure</Button>
                    </div>
                  </div>
                  
                  <Button variant="link" className="mt-4">
                    + Add new data source
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data Source Status</CardTitle>
                  <CardDescription>
                    Monitor the health and activity of your data connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">News API</span>
                        <span className="text-sm text-success">Active</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-success w-4/5 rounded-full"></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Last sync: 5 minutes ago</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Social Media Feed</span>
                        <span className="text-sm text-warning">Degraded</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-warning w-1/2 rounded-full"></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Limited access, rate limiting in effect</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Satellite Data</span>
                        <span className="text-sm text-error">Offline</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-error w-1/5 rounded-full"></div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">API Key expired, renew subscription</p>
                    </div>
                  </div>
                  
                  <Button className="mt-6 w-full">
                    Refresh Data Sources
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
                        <span className="text-sm ml-2">+1234567890</span>
                        <Button variant="ghost" size="sm" className="ml-auto">Edit</Button>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">SMS Format Template:</p>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 text-sm font-mono">
                          REPORT [Location] [Type] [Description]
                        </div>
                      </div>
                      
                      <Button variant="outline">Configure SMS Gateway</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Community Informants</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Manage your network of trusted community informants.
                    </p>
                    
                    <div className="border border-neutral-200 rounded-md divide-y">
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
                    
                    <Button className="mt-4">Manage Informant Network</Button>
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
