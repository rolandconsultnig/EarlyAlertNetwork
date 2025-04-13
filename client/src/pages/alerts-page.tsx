import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, insertAlertSchema, Incident } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Mail, 
  Send,
  Smartphone,
  Radio,
  Megaphone,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  XCircle,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  MessageSquare,
  PhoneCall
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Create a schema for the alert creation form
const alertFormSchema = insertAlertSchema
  .pick({
    title: true,
    description: true,
    severity: true,
    channels: true,
  })
  .extend({
    severity: z.enum(["low", "medium", "high"], {
      required_error: "Please select a severity level",
    }),
    notificationChannels: z.array(z.string()),
    recipients: z.object({
      emails: z.array(z.string().email()).optional(),
      phoneNumbers: z.array(z.string()).optional(),
      userIds: z.array(z.number()).optional(),
      roles: z.array(z.string()).optional(),
    }).optional(),
  });

type AlertFormValues = z.infer<typeof alertFormSchema>;

export default function AlertsPage() {
  const { toast } = useToast();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  
  // Fetch alerts
  const { 
    data: alerts, 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });
  
  // Fetch incidents for the select dropdown
  const { 
    data: incidents 
  } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });
  
  // Create form using react-hook-form
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: undefined,
      notificationChannels: ["email", "dashboard"],
    },
  });
  
  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertFormValues) => {
      const alertData = {
        ...data,
        status: "active",
        incidentId: selectedIncidentId,
      };
      
      const res = await apiRequest("POST", "/api/alerts", alertData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "The alert has been created and notifications sent.",
      });
      form.reset();
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update alert status mutation
  const updateAlertStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/alerts/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Updated",
        description: "The alert status has been updated successfully.",
      });
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
  function onSubmit(data: AlertFormValues) {
    createAlertMutation.mutate(data);
  }
  
  // Format date for display
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Filter alerts based on the selected filter
  const filteredAlerts = alerts?.filter(alert => {
    // Apply status filter
    const statusMatch = alertFilter === "all" || 
      (alertFilter === "active" && alert.status === "active") ||
      (alertFilter === "resolved" && alert.status === "resolved");
    
    // Apply search filter if search query exists
    const searchMatch = !searchQuery || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });
  
  // Handle resolve alert
  const handleResolveAlert = (id: number) => {
    updateAlertStatusMutation.mutate({ id, status: "resolved" });
  };
  
  // Handle reactivate alert
  const handleReactivateAlert = (id: number) => {
    updateAlertStatusMutation.mutate({ id, status: "active" });
  };
  
  // Handle view alert details
  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setViewDialogOpen(true);
  };
  
  // Get the badge color based on severity
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get the status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "resolved":
        return <Badge className="bg-neutral-100 text-neutral-800">Resolved</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <MainLayout title="Alerts">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            <TabsTrigger 
              value="all" 
              onClick={() => setAlertFilter("all")}
              className={alertFilter === "all" ? "bg-primary text-primary-foreground" : ""}
            >
              All Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              onClick={() => setAlertFilter("active")}
              className={alertFilter === "active" ? "bg-primary text-primary-foreground" : ""}
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="resolved" 
              onClick={() => setAlertFilter("resolved")}
              className={alertFilter === "resolved" ? "bg-primary text-primary-foreground" : ""}
            >
              Resolved
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search alerts..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchAlerts()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle>Alert Management</CardTitle>
          <CardDescription>
            Monitor and manage system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingAlerts ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading alerts...</p>
            </div>
          ) : alertsError ? (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
              <p>Failed to load alerts. Please try again.</p>
            </div>
          ) : filteredAlerts && filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.title}</TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>{formatDate(alert.generatedAt)}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewAlert(alert)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status === "active" ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReactivateAlert(alert.id)}
                        >
                          <Clock className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
              <p className="text-neutral-500">No alerts found</p>
              <p className="text-neutral-400 text-sm mt-1">
                {searchQuery ? "Try adjusting your search or filters" : "Create alerts to monitor potential risks"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Alert Statistics</CardTitle>
            <CardDescription>Overview of system alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">Alerts by Severity</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">High</span>
                    </div>
                    <span className="text-sm font-medium">
                      {alerts?.filter(a => a.severity === "high").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                    <span className="text-sm font-medium">
                      {alerts?.filter(a => a.severity === "medium").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Low</span>
                    </div>
                    <span className="text-sm font-medium">
                      {alerts?.filter(a => a.severity === "low").length || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-2">Alerts by Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <span className="text-sm font-medium">
                      {alerts?.filter(a => a.status === "active").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-neutral-400 mr-2"></div>
                      <span className="text-sm">Resolved</span>
                    </div>
                    <span className="text-sm font-medium">
                      {alerts?.filter(a => a.status === "resolved").length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Configure alert distribution methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Direct Messaging */}
              <div>
                <h3 className="text-sm font-medium mb-3">Direct Communications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-neutral-500">Send alerts via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Dashboard Alerts</p>
                        <p className="text-sm text-neutral-500">Show in-app notifications</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Social Media */}
              <div>
                <h3 className="text-sm font-medium mb-3">Social Media</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Twitter className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">X (Twitter)</p>
                        <p className="text-sm text-neutral-500">Post alerts on X platform</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Facebook</p>
                        <p className="text-sm text-neutral-500">Post alerts on Facebook</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Instagram className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Instagram</p>
                        <p className="text-sm text-neutral-500">Share alerts on Instagram</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Telecoms */}
              <div>
                <h3 className="text-sm font-medium mb-3">Telecommunication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">SMS (Twilio)</p>
                        <p className="text-sm text-neutral-500">Send alerts via SMS</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-neutral-500">Send alerts via WhatsApp</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PhoneCall className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">Call Center</p>
                        <p className="text-sm text-neutral-500">Automated voice alerts</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Configure Notification Settings
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alert Templates</CardTitle>
            <CardDescription>Predefined alert message templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-md p-3 bg-neutral-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Armed Conflict Alert</h3>
                  <Badge className="bg-red-100 text-red-800">High</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Armed group movement detected in [LOCATION]. Potentially dangerous situation requiring immediate action.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Send className="h-4 w-4 mr-1" /> Use
                  </Button>
                </div>
              </div>
              
              <div className="border border-neutral-200 rounded-md p-3 bg-neutral-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Resource Scarcity Warning</h3>
                  <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Limited access to essential resources reported in [LOCATION]. Potential for community tension if unaddressed.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Send className="h-4 w-4 mr-1" /> Use
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Create New Template
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* View Alert Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              View complete information about this alert
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{selectedAlert.title}</h2>
                <div className="flex gap-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  {getStatusBadge(selectedAlert.status)}
                </div>
              </div>
              
              <p className="text-neutral-700">{selectedAlert.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-500">Generated At</p>
                  <p>{formatDate(selectedAlert.generatedAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-500">Incident ID</p>
                  <p>{selectedAlert.incidentId || "Not linked to an incident"}</p>
                </div>
              </div>
              
              <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                <h3 className="font-medium mb-2">Distribution Channels</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedAlert && selectedAlert.status === "active" ? (
              <Button
                variant="default"
                onClick={() => {
                  handleResolveAlert(selectedAlert.id);
                  setViewDialogOpen(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            ) : selectedAlert && (
              <Button
                variant="default"
                onClick={() => {
                  handleReactivateAlert(selectedAlert.id);
                  setViewDialogOpen(false);
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reactivate Alert
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Alert Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>
              Configure alert details and distribution channels
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a concise alert title" {...field} />
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
                        placeholder="Provide a detailed description of the alert" 
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
                
                <FormItem>
                  <FormLabel>Related Incident (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => setSelectedIncidentId(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Link to an incident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {incidents?.map((incident) => (
                        <SelectItem key={incident.id} value={String(incident.id)}>
                          {incident.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Notification Channels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("email")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "email"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "email"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("dashboard")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "dashboard"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "dashboard"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Bell className="h-4 w-4 inline mr-2" />
                      Dashboard
                    </label>
                  </div>
                  
                  {/* Social Media Channels */}
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("twitter")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "twitter"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "twitter"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Twitter className="h-4 w-4 inline mr-2" />
                      X (Twitter)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("facebook")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "facebook"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "facebook"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Facebook className="h-4 w-4 inline mr-2" />
                      Facebook
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("instagram")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "instagram"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "instagram"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Instagram className="h-4 w-4 inline mr-2" />
                      Instagram
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("whatsapp")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "whatsapp"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "whatsapp"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      WhatsApp
                    </label>
                  </div>
                  
                  {/* SMS Channels */}
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("sms_twilio")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "sms_twilio"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "sms_twilio"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <Smartphone className="h-4 w-4 inline mr-2" />
                      SMS (Twilio)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("sms_clickatell")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "sms_clickatell"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "sms_clickatell"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <MessageSquare className="h-4 w-4 inline mr-2" />
                      SMS (Clickatell)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      checked={form.watch("notificationChannels")?.includes("call_center")}
                      onCheckedChange={(checked) => {
                        const current = form.watch("notificationChannels") || [];
                        if (checked) {
                          form.setValue("notificationChannels", [...current, "call_center"]);
                        } else {
                          form.setValue("notificationChannels", current.filter(c => c !== "call_center"));
                        }
                      }}
                    />
                    <label className="ml-2 text-sm font-medium">
                      <PhoneCall className="h-4 w-4 inline mr-2" />
                      Call Center
                    </label>
                  </div>
                </div>
              </div>
              
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
                  disabled={createAlertMutation.isPending}
                >
                  {createAlertMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Megaphone className="h-4 w-4 mr-2" />
                      Create Alert
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
