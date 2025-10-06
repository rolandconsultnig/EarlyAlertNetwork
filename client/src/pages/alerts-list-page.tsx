import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert } from "@shared/schema.ts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Eye, 
  Bell, 
  Calendar, 
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Mail,
  Radio,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AlertsListPage() {
  const { toast } = useToast();
  const [alertFilter, setAlertFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fetch alerts from API
  const { 
    data: alerts, 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"]
  });

  // Handle error display
  React.useEffect(() => {
    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      toast({
        title: "Failed to load alerts",
        description: alertsError instanceof Error ? alertsError.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [alertsError, toast]);

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

  // Filter alerts based on the selected filters
  const filteredAlerts = alerts?.filter(alert => {
    // Apply status filter
    const statusMatch = alertFilter === "all" || 
      (alertFilter === "active" && alert.status === "active") ||
      (alertFilter === "resolved" && alert.status === "resolved");
    
    // Apply channel filter
    const channelMatch = channelFilter === "all" || 
      (alert.channels && alert.channels.includes(channelFilter));
    
    // Apply search filter
    const searchMatch = !searchQuery || 
      (alert.title && alert.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alert.description && alert.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && channelMatch && searchMatch;
  });

  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

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
    switch (severity?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "resolved":
        return <Badge className="bg-neutral-100 text-neutral-800">Resolved</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "twitter":
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case "tiktok":
        return <MessageCircle className="h-4 w-4 text-black" />;
      case "sms":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-purple-600" />;
      case "phone":
        return <Radio className="h-4 w-4 text-amber-600" />;
      case "dashboard":
      default:
        return <Bell className="h-4 w-4 text-neutral-600" />;
    }
  };

  return (
    <MainLayout title="All Alerts">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
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
          </div>
          
          {/* Channel Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Channel</label>
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setChannelFilter("all")}
                className={channelFilter === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All Channels
              </TabsTrigger>
              <TabsTrigger 
                value="twitter" 
                onClick={() => setChannelFilter("twitter")}
                className={channelFilter === "twitter" ? "bg-primary text-primary-foreground" : ""}
              >
                <Twitter className="h-4 w-4 mr-1" />
                Twitter
              </TabsTrigger>
              <TabsTrigger 
                value="sms" 
                onClick={() => setChannelFilter("sms")}
                className={channelFilter === "sms" ? "bg-primary text-primary-foreground" : ""}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                onClick={() => setChannelFilter("email")}
                className={channelFilter === "email" ? "bg-primary text-primary-foreground" : ""}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </TabsTrigger>
            </TabsList>
          </div>
          
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
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle>Alerts Management</CardTitle>
          <CardDescription>
            Monitor and manage system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingAlerts ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-neutral-500">Loading alerts...</p>
            </div>
          ) : alertsError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load alerts</h3>
              <p className="text-muted-foreground mb-4">
                We encountered a problem while retrieving alert data.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchAlerts()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredAlerts && filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channels</TableHead>
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
                    <TableCell>
                      <div className="flex space-x-1">
                        {alert.channels && alert.channels.length > 0 ? (
                          alert.channels.slice(0, 3).map((channel, idx) => (
                            <div key={idx} className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center" title={channel}>
                              {getChannelIcon(channel)}
                            </div>
                          ))
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-neutral-600" />
                          </div>
                        )}
                        {alert.channels && alert.channels.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600">
                            +{alert.channels.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span>{formatDate(alert.generatedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewAlert(alert)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {alert.status === "active" ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Resolve</span>
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleReactivateAlert(alert.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Reactivate</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Bell className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                No alerts match your current filter criteria. Try changing your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      {selectedAlert && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAlert.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={`${selectedAlert.severity === 'high' ? 'bg-red-100 text-red-800' : (selectedAlert.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')}`}>
                    Severity: {selectedAlert.severity}
                  </Badge>
                  <Badge className={`${selectedAlert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
                    Status: {selectedAlert.status}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm leading-6">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Alert Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Location:</span>
                      <span>{selectedAlert.location || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Region:</span>
                      <span>{selectedAlert.region || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Generated:</span>
                      <span>{formatDate(selectedAlert.generatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Related Incident:</span>
                      <span>
                        {selectedAlert.incidentId ? `ID: ${selectedAlert.incidentId}` : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Distribution Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.channels && selectedAlert.channels.length > 0 ? (
                      selectedAlert.channels.map((channel, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                          {getChannelIcon(channel)}
                          <span className="capitalize">{channel}</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-neutral-500">No channels specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              
              <div className="flex gap-2">
                {selectedAlert.status === "active" ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleReactivateAlert(selectedAlert.id);
                      setViewDialogOpen(false);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate Alert
                  </Button>
                )}
                
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Resend Alert
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}