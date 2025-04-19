import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, Incident } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Mail,
  Smartphone,
  RefreshCw,
  Eye,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Info,
  Loader2,
  BarChart3,
  PieChart,
  MapPin,
  Zap,
  AlertOctagon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AlertsPage() {
  const { toast } = useToast();
  const [alertFilter, setAlertFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sosExpanded, setSosExpanded] = useState(false);
  
  // Fetch alerts from API
  const { 
    data: alerts, 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    refetch: refetchAlerts 
  } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"]
  });
  
  // Fetch incidents for the SOS panel
  const { 
    data: incidents 
  } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
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
  
  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Filter alerts based on the selected filter
  const filteredAlerts = alerts?.filter(alert => {
    // Apply status filter
    const statusMatch = alertFilter === "all" || 
      (alertFilter === "active" && alert.status === "active") ||
      (alertFilter === "resolved" && alert.status === "resolved");
    
    // Apply source filter
    const sourceMatch = sourceFilter === "all" || 
      (sourceFilter === "twitter" && alert.channels?.includes("twitter")) ||
      (sourceFilter === "facebook" && alert.channels?.includes("facebook")) ||
      (sourceFilter === "instagram" && alert.channels?.includes("instagram")) ||
      (sourceFilter === "tiktok" && alert.channels?.includes("tiktok")) ||
      (sourceFilter === "sms" && alert.channels?.includes("sms")) ||
      (sourceFilter === "email" && alert.channels?.includes("email")) ||
      (sourceFilter === "dashboard" && alert.channels?.includes("dashboard")) ||
      (sourceFilter === "phone" && alert.channels?.includes("phone")) ||
      (sourceFilter === "system" && (!alert.channels || alert.channels.length === 0));
    
    // Apply search filter if search query exists
    const searchMatch = !searchQuery || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && sourceMatch && searchMatch;
  });
  
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
  
  // Mock SOS messages for the demo
  const sosMockData = [
    {
      id: 1,
      sender: "+2347012345678",
      imei: "352099001761481",
      message: "SOS: Armed conflict in progress at Wuse market. Multiple casualties reported.",
      location: "9.0765,7.4915",
      timestamp: new Date().getTime() - 1200000, // 20 minutes ago
      priority: "critical"
    },
    {
      id: 2,
      sender: "+2348023456789",
      imei: "356938035643809",
      message: "HELP: Flooding in Makurdi area, water levels rising quickly. Need immediate evacuation assistance.",
      location: "7.7322,8.5391",
      timestamp: new Date().getTime() - 3600000, // 1 hour ago
      priority: "high"
    },
    {
      id: 3,
      sender: "+2349034567890",
      imei: "490154203237518",
      message: "URGENT: Suspected terrorist activity in Kano central area. Suspicious individuals with weapons sighted.",
      location: "12.0022,8.5920",
      timestamp: new Date().getTime() - 7200000, // 2 hours ago
      priority: "critical"
    }
  ];

  return (
    <MainLayout title="Alerts & Notifications">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Alerts Panel - 8 columns on large screens */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
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
              
              {/* Source Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
                <TabsList>
                  <TabsTrigger 
                    value="all" 
                    onClick={() => setSourceFilter("all")}
                    className={sourceFilter === "all" ? "bg-primary text-primary-foreground" : ""}
                  >
                    All Sources
                  </TabsTrigger>
                  <TabsTrigger 
                    value="social" 
                    onClick={() => setSourceFilter("twitter")}
                    className={sourceFilter === "twitter" ? "bg-primary text-primary-foreground" : ""}
                  >
                    <Twitter className="h-4 w-4 mr-1" />
                    Twitter
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sms" 
                    onClick={() => setSourceFilter("sms")}
                    className={sourceFilter === "sms" ? "bg-primary text-primary-foreground" : ""}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    SMS
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
          </div>
        
          <Card>
            <CardHeader className="p-6 pb-2">
              <CardTitle>Alert Management Dashboard</CardTitle>
              <CardDescription>
                Monitor and manage system alerts and notifications from all sources
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
                  <div className="text-sm text-left max-w-md mx-auto mb-6">
                    <p className="font-medium mb-1">Troubleshooting tips:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check your internet connection and try again.</li>
                      <li>The data source might be temporarily unavailable.</li>
                      <li>If the problem persists, contact technical support.</li>
                    </ul>
                  </div>
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
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Source</TableHead>
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
                              {alert.channels?.includes("twitter") && <Twitter className="h-4 w-4 text-blue-500" />}
                              {alert.channels?.includes("facebook") && <Facebook className="h-4 w-4 text-blue-600" />}
                              {alert.channels?.includes("instagram") && <Instagram className="h-4 w-4 text-pink-500" />}
                              {alert.channels?.includes("sms") && <MessageSquare className="h-4 w-4 text-green-500" />}
                              {alert.channels?.includes("phone") && <PhoneCall className="h-4 w-4 text-red-500" />}
                              {alert.channels?.includes("email") && <Mail className="h-4 w-4 text-gray-500" />}
                              {(!alert.channels || alert.channels.length === 0) && <Info className="h-4 w-4 text-gray-400" />}
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>{getStatusBadge(alert.status)}</TableCell>
                          <TableCell>{formatDate(alert.generatedAt)}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {alert.status === "active" ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                              >
                                <Clock className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
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
          
          {/* Graphical Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Alert Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[200px] flex items-center">
                  <div className="w-full space-y-4">
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
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.severity === "high").length / alerts.length) * 100 : 0} 
                        className="h-2 bg-red-100" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span className="text-sm">Medium</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.severity === "medium").length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.severity === "medium").length / alerts.length) * 100 : 0} 
                        className="h-2 bg-amber-100" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm">Low</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.severity === "low").length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.severity === "low").length / alerts.length) * 100 : 0}
                        className="h-2 bg-blue-100" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Alerts by Source</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[200px] flex items-center">
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">X (Twitter)</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.channels?.includes("twitter")).length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.channels?.includes("twitter")).length / alerts.length) * 100 : 0}
                        className="h-2 bg-blue-100" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Facebook className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm">Facebook</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.channels?.includes("facebook")).length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.channels?.includes("facebook")).length / alerts.length) * 100 : 0}
                        className="h-2 bg-blue-200" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">SMS</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.channels?.includes("sms")).length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.channels?.includes("sms")).length / alerts.length) * 100 : 0}
                        className="h-2 bg-green-100" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm">Email</span>
                        </div>
                        <span className="text-sm font-medium">
                          {alerts?.filter(a => a.channels?.includes("email")).length || 0}
                        </span>
                      </div>
                      <Progress 
                        value={alerts ? 
                          (alerts.filter(a => a.channels?.includes("email")).length / alerts.length) * 100 : 0}
                        className="h-2 bg-gray-100" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* SOS Emergency Panel - 4 columns on large screens */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertOctagon className="h-5 w-5 text-red-600 mr-2" />
                  <CardTitle className="text-lg text-red-800">SOS Emergency Alerts</CardTitle>
                </div>
                <Badge className="bg-red-600">LIVE</Badge>
              </div>
              <CardDescription className="text-red-700">
                Priority messages requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {sosMockData.map((sos) => (
                  <Card key={sos.id} className={`border-l-4 ${sos.priority === 'critical' ? 'border-l-red-600' : 'border-l-amber-500'}`}>
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Zap className={`h-4 w-4 ${sos.priority === 'critical' ? 'text-red-600' : 'text-amber-500'} mr-2`} />
                          <p className="text-sm font-medium">{sos.sender}</p>
                        </div>
                        <Badge className={sos.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                          {sos.priority === 'critical' ? 'CRITICAL' : 'HIGH'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        IMEI: {sos.imei} • {new Date(sos.timestamp).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-sm">{sos.message}</p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>GPS: {sos.location}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        View on Map
                      </Button>
                      <Button size="sm" className="text-xs h-7">
                        Respond
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-red-200 text-red-800 hover:bg-red-100"
                onClick={() => setSosExpanded(!sosExpanded)}
              >
                {sosExpanded ? "Show Less" : "View All SOS Messages"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Sources Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Twitter className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">X (Twitter)</p>
                      <p className="text-xs text-muted-foreground">Monitoring Nigerian topics</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-xs text-muted-foreground">Public posts in Nigeria</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">SMS Gateway</p>
                      <p className="text-xs text-muted-foreground">Emergency text messages</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <PhoneCall className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Emergency Calls</p>
                      <p className="text-xs text-muted-foreground">Call center integration</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}