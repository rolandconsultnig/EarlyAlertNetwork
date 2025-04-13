import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ResponsePlan, 
  Incident, 
  RiskAnalysis, 
  ResponseTeam, 
  insertResponsePlanSchema 
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  AlertCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  FileText, 
  Search, 
  Filter,
  RefreshCw,
  CalendarClock,
  Calendar,
  Truck,
  MessageSquare,
  PhoneCall,
  Eye,
  FileBarChart2,
  ShieldCheck
} from "lucide-react";

// Create a schema for response plan form
const responsePlanFormSchema = insertResponsePlanSchema
  .pick({
    title: true,
    description: true,
    region: true,
    location: true,
    status: true,
    responseType: true,
  })
  .extend({
    status: z.enum(["draft", "active", "completed"], {
      required_error: "Please select a status",
    }),
    category: z.enum(["emergency", "preventive", "recovery"], {
      required_error: "Please select a response type",
    }),
    selectedTeams: z.array(z.string()).optional(),
  });

type ResponsePlanFormValues = z.infer<typeof responsePlanFormSchema>;

export default function ResponsePlansPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ResponsePlan | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch response plans
  const { 
    data: plans, 
    isLoading: isLoadingPlans, 
    error: plansError,
    refetch: refetchPlans 
  } = useQuery<ResponsePlan[]>({
    queryKey: ["/api/response-plans"],
  });
  
  // Fetch incidents for the select dropdown
  const { 
    data: incidents 
  } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });
  
  // Fetch risk analyses for the select dropdown
  const { 
    data: analyses 
  } = useQuery<RiskAnalysis[]>({
    queryKey: ["/api/risk-analyses"],
  });
  
  // Fetch response teams for the select dropdown
  const { 
    data: teams 
  } = useQuery<ResponseTeam[]>({
    queryKey: ["/api/response-teams"],
  });
  
  // Create form using react-hook-form
  const form = useForm<ResponsePlanFormValues>({
    resolver: zodResolver(responsePlanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      region: "",
      location: "",
      status: "draft",
      responseType: "preventive",
      selectedTeams: [],
    },
  });
  
  // Create response plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: ResponsePlanFormValues) => {
      const planData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTeams: data.selectedTeams?.join(',') || '',
      };
      
      // Remove the selectedTeams field since it's not part of the schema
      delete planData.selectedTeams;
      
      const res = await apiRequest("POST", "/api/response-plans", planData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/response-plans"] });
      toast({
        title: "Response Plan Created",
        description: "The plan has been created successfully.",
      });
      form.reset();
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update plan status mutation
  const updatePlanStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/response-plans/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/response-plans"] });
      toast({
        title: "Plan Updated",
        description: "The plan status has been updated successfully.",
      });
      setDetailsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(data: ResponsePlanFormValues) {
    createPlanMutation.mutate(data);
  }
  
  // Format date for display
  const formatDate = (dateString: Date | null) => {
    return dateString ? new Date(dateString).toLocaleString() : "Not set";
  };
  
  // Filter plans based on selected tab and search query
  const filteredPlans = plans?.filter(plan => {
    // Apply status filter
    const statusMatch = 
      (selectedTab === "active" && plan.status === "active") ||
      (selectedTab === "draft" && plan.status === "draft") ||
      (selectedTab === "completed" && plan.status === "completed") ||
      selectedTab === "all";
    
    // Apply search filter if search query exists
    const searchMatch = !searchQuery || 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.region && plan.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plan.location && plan.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && searchMatch;
  });
  
  // View plan details
  const handleViewPlan = (plan: ResponsePlan) => {
    setSelectedPlan(plan);
    setDetailsDialogOpen(true);
  };
  
  // Update plan status
  const handleUpdateStatus = (status: string) => {
    if (selectedPlan) {
      updatePlanStatusMutation.mutate({ id: selectedPlan.id, status });
    }
  };
  
  // Get the status badge for a plan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-neutral-100 text-neutral-800">Draft</Badge>;
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get the response type badge
  const getResponseTypeBadge = (type: string) => {
    switch (type) {
      case "emergency":
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      case "preventive":
        return <Badge className="bg-amber-100 text-amber-800">Preventive</Badge>;
      case "recovery":
        return <Badge className="bg-indigo-100 text-indigo-800">Recovery</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <MainLayout title="Response Plans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            <TabsTrigger 
              value="active" 
              onClick={() => setSelectedTab("active")}
              className={selectedTab === "active" ? "bg-primary text-primary-foreground" : ""}
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="draft" 
              onClick={() => setSelectedTab("draft")}
              className={selectedTab === "draft" ? "bg-primary text-primary-foreground" : ""}
            >
              Draft
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={() => setSelectedTab("completed")}
              className={selectedTab === "completed" ? "bg-primary text-primary-foreground" : ""}
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              onClick={() => setSelectedTab("all")}
              className={selectedTab === "all" ? "bg-primary text-primary-foreground" : ""}
            >
              All Plans
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search plans..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchPlans()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Total Plans</p>
                <p className="text-2xl font-semibold mt-1">
                  {plans?.length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <FileBarChart2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Draft</p>
                <p className="text-2xl font-semibold mt-1">
                  {plans?.filter(p => p.status === "draft").length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-neutral-100">
                <FileText className="h-5 w-5 text-neutral-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Active</p>
                <p className="text-2xl font-semibold mt-1">
                  {plans?.filter(p => p.status === "active").length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Completed</p>
                <p className="text-2xl font-semibold mt-1">
                  {plans?.filter(p => p.status === "completed").length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-6 pb-2">
              <CardTitle>Response Plans</CardTitle>
              <CardDescription>
                Manage and coordinate response strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingPlans ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-neutral-500">Loading response plans...</p>
                </div>
              ) : plansError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                  <p>Failed to load response plans. Please try again.</p>
                </div>
              ) : filteredPlans && filteredPlans.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Region/Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.title}</TableCell>
                        <TableCell>{plan.region}{plan.location ? ` / ${plan.location}` : ''}</TableCell>
                        <TableCell>{getResponseTypeBadge(plan.responseType)}</TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell>{formatDate(plan.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewPlan(plan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileBarChart2 className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
                  <p className="text-neutral-500">No response plans found</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    {searchQuery ? "Try adjusting your search or filters" : "Create response plans to coordinate interventions"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Types</CardTitle>
              <CardDescription>Distribution by response category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Emergency</span>
                    </div>
                    <span className="text-sm font-medium">
                      {plans?.filter(p => p.responseType === "emergency").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm">Preventive</span>
                    </div>
                    <span className="text-sm font-medium">
                      {plans?.filter(p => p.responseType === "preventive").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                      <span className="text-sm">Recovery</span>
                    </div>
                    <span className="text-sm font-medium">
                      {plans?.filter(p => p.responseType === "recovery").length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Regional Coverage</CardTitle>
              <CardDescription>Plans by Nigerian region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['North Central', 'North East', 'North West', 'South East', 'South South', 'South West'].map((region) => (
                  <div key={region} className="flex items-center justify-between">
                    <span className="text-sm">{region}</span>
                    <span className="text-sm font-medium">
                      {plans?.filter(p => p.region === region).length || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Response Plan</DialogTitle>
            <DialogDescription>
              Create a new response plan to coordinate crisis intervention activities.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter response plan title" {...field} />
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
                        placeholder="Describe the response plan objectives and scope" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="North Central">North Central</SelectItem>
                            <SelectItem value="North East">North East</SelectItem>
                            <SelectItem value="North West">North West</SelectItem>
                            <SelectItem value="South East">South East</SelectItem>
                            <SelectItem value="South South">South South</SelectItem>
                            <SelectItem value="South West">South West</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city, town, or area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="responseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Type</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="recovery">Recovery</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="selectedTeams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Teams</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => {
                          const currentValues = field.value || [];
                          if (!currentValues.includes(value)) {
                            field.onChange([...currentValues, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teams" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams?.map(team => (
                            <SelectItem key={team.id} value={team.name}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map(team => (
                        <Badge 
                          key={team}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            field.onChange(field.value?.filter(t => t !== team));
                          }}
                        >
                          {team} <XCircle className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⊝</span>
                      Creating...
                    </>
                  ) : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Plan Details Dialog */}
      {selectedPlan && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedPlan.title}</DialogTitle>
              <DialogDescription>
                Response Plan Details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedPlan.status)}
                {getResponseTypeBadge(selectedPlan.responseType)}
                <Badge variant="outline">{selectedPlan.region}</Badge>
                {selectedPlan.location && <Badge variant="outline">{selectedPlan.location}</Badge>}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-neutral-600">{selectedPlan.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Created</h4>
                  <p className="text-sm text-neutral-600">{formatDate(selectedPlan.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                  <p className="text-sm text-neutral-600">{formatDate(selectedPlan.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned Teams</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.assignedTeams ? 
                    selectedPlan.assignedTeams.split(',').map(team => (
                      <Badge key={team} variant="secondary">{team}</Badge>
                    )) : 
                    <span className="text-sm text-neutral-500">No teams assigned</span>
                  }
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Change Status</h4>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={selectedPlan.status === "draft" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("draft")}
                    disabled={updatePlanStatusMutation.isPending}
                  >
                    Draft
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedPlan.status === "active" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("active")}
                    disabled={updatePlanStatusMutation.isPending}
                  >
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedPlan.status === "completed" ? "default" : "outline"}
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={updatePlanStatusMutation.isPending}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setDetailsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}