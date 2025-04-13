import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ResponseActivity, 
  Alert, 
  ResponseTeam, 
  insertResponseActivitySchema 
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
  Eye
} from "lucide-react";

// Create a schema for response activity form
const responseActivityFormSchema = insertResponseActivitySchema
  .pick({
    title: true,
    description: true,
    assignedTeam: true,
    status: true,
  })
  .extend({
    status: z.enum(["pending", "in_progress", "completed"], {
      required_error: "Please select a status",
    }),
  });

type ResponseActivityFormValues = z.infer<typeof responseActivityFormSchema>;

export default function ResponsePlansPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ResponseActivity | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch response activities
  const { 
    data: activities, 
    isLoading: isLoadingActivities, 
    error: activitiesError,
    refetch: refetchActivities 
  } = useQuery<ResponseActivity[]>({
    queryKey: ["/api/response-activities"],
  });
  
  // Fetch active alerts for the select dropdown
  const { 
    data: alerts 
  } = useQuery<Alert[]>({
    queryKey: ["/api/alerts/active"],
  });
  
  // Fetch response teams for the select dropdown
  const { 
    data: teams 
  } = useQuery<ResponseTeam[]>({
    queryKey: ["/api/response-teams"],
  });
  
  // Create form using react-hook-form
  const form = useForm<ResponseActivityFormValues>({
    resolver: zodResolver(responseActivityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      assignedTeam: "",
    },
  });
  
  // Create response activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (data: ResponseActivityFormValues) => {
      const activityData = {
        ...data,
        alertId: selectedAlertId,
      };
      
      const res = await apiRequest("POST", "/api/response-activities", activityData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/response-activities"] });
      toast({
        title: "Response Activity Created",
        description: "The activity has been created successfully.",
      });
      form.reset();
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update activity status mutation
  const updateActivityStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/response-activities/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/response-activities"] });
      toast({
        title: "Activity Updated",
        description: "The activity status has been updated successfully.",
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
  function onSubmit(data: ResponseActivityFormValues) {
    createActivityMutation.mutate(data);
  }
  
  // Format date for display
  const formatDate = (dateString: Date | null) => {
    return dateString ? new Date(dateString).toLocaleString() : "Not set";
  };
  
  // Filter activities based on selected tab and search query
  const filteredActivities = activities?.filter(activity => {
    // Apply status filter
    const statusMatch = 
      (selectedTab === "active" && (activity.status === "pending" || activity.status === "in_progress")) ||
      (selectedTab === "completed" && activity.status === "completed") ||
      selectedTab === "all";
    
    // Apply search filter if search query exists
    const searchMatch = !searchQuery || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.assignedTeam && activity.assignedTeam.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && searchMatch;
  });
  
  // View activity details
  const handleViewActivity = (activity: ResponseActivity) => {
    setSelectedActivity(activity);
    setDetailsDialogOpen(true);
  };
  
  // Update activity status
  const handleUpdateStatus = (status: string) => {
    if (selectedActivity) {
      updateActivityStatusMutation.mutate({ id: selectedActivity.id, status });
    }
  };
  
  // Get the status badge for an activity
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Calculate progress percentage for activities
  const calculateProgress = () => {
    if (!activities || activities.length === 0) return 0;
    
    const completed = activities.filter(a => a.status === "completed").length;
    return Math.round((completed / activities.length) * 100);
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
              All Activities
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search activities..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchActivities()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Activity
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Total Activities</p>
                <p className="text-2xl font-semibold mt-1">
                  {activities?.length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">Pending</p>
                <p className="text-2xl font-semibold mt-1">
                  {activities?.filter(a => a.status === "pending").length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500">In Progress</p>
                <p className="text-2xl font-semibold mt-1">
                  {activities?.filter(a => a.status === "in_progress").length || 0}
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
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
                  {activities?.filter(a => a.status === "completed").length || 0}
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
              <CardTitle>Response Activities</CardTitle>
              <CardDescription>
                Manage and track intervention activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingActivities ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-neutral-500">Loading activities...</p>
                </div>
              ) : activitiesError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                  <p>Failed to load activities. Please try again.</p>
                </div>
              ) : filteredActivities && filteredActivities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>{activity.assignedTeam || "Unassigned"}</TableCell>
                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                        <TableCell>{formatDate(activity.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewActivity(activity)}
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
                  <ClipboardCheck className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
                  <p className="text-neutral-500">No activities found</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    {searchQuery ? "Try adjusting your search or filters" : "Create response activities to start tracking interventions"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Progress</CardTitle>
              <CardDescription>Overall activity completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  {teams?.slice(0, 3).map((team) => (
                    <div key={team.id}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>{team.name}</span>
                        <span className="font-medium">
                          {team.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${team.status === "active" ? "bg-green-500" : "bg-neutral-300"}`}></div>
                        <span className="text-xs text-neutral-500">{team.location || "No location"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Response Teams
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common response protocols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  Deploy Emergency Supplies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Initiate Community Dialogue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Alert Security Forces
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Schedule Security Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Activities</CardTitle>
              <CardDescription>Scheduled for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {activities?.filter(a => a.status === "pending").length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                  <p className="text-sm text-neutral-500">No upcoming activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities?.filter(a => a.status === "pending").slice(0, 3).map((activity) => (
                    <div key={activity.id} className="border border-neutral-200 rounded-md p-3">
                      <h3 className="font-medium text-sm">{activity.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {activity.assignedTeam || "Unassigned"}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleViewActivity(activity)}>
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Create Activity Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Response Activity</DialogTitle>
            <DialogDescription>
              Define a new intervention or response action
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter activity title" {...field} />
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
                        placeholder="Provide a detailed description of the activity" 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="assignedTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Team</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.name}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormItem>
                <FormLabel>Related Alert (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => setSelectedAlertId(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to an alert" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {alerts?.map((alert) => (
                      <SelectItem key={alert.id} value={String(alert.id)}>
                        {alert.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
              
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
                  disabled={createActivityMutation.isPending}
                >
                  {createActivityMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Activity
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Activity Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              View and manage response activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{selectedActivity.title}</h2>
                {getStatusBadge(selectedActivity.status)}
              </div>
              
              <p className="text-neutral-700">{selectedActivity.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-500">Assigned Team</p>
                  <p>{selectedActivity.assignedTeam || "Unassigned"}</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-500">Created</p>
                  <p>{formatDate(selectedActivity.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-500">Completed</p>
                  <p>{selectedActivity.completedAt ? formatDate(selectedActivity.completedAt) : "Not completed"}</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-500">Related Alert</p>
                  <p>{selectedActivity.alertId ? `#${selectedActivity.alertId}` : "None"}</p>
                </div>
              </div>
              
              <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                <h3 className="font-medium mb-2">Status Update</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={selectedActivity.status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus("pending")}
                    disabled={updateActivityStatusMutation.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Pending
                  </Button>
                  <Button 
                    variant={selectedActivity.status === "in_progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus("in_progress")}
                    disabled={updateActivityStatusMutation.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    In Progress
                  </Button>
                  <Button 
                    variant={selectedActivity.status === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus("completed")}
                    disabled={updateActivityStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // Here you would navigate to the edit page or open edit dialog
                toast({
                  title: "Edit functionality",
                  description: "Edit functionality would be implemented here.",
                });
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
