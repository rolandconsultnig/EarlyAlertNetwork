import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ResponsePlan, 
  ResponseTeam, 
  Incident, 
  RiskAnalysis 
} from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  AlertTriangle,
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  FileText, 
  Search, 
  Filter,
  RefreshCw,
  Building,
  BuildingGovernment,
  Users2,
  UserPlus,
  UserCog,
  Send,
  Loader2,
  FileBarChart2,
  ClipboardList,
  FileCheck,
  Phone
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InterAgencyPortalPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ResponsePlan | null>(null);
  
  // Fetch response plans
  const { 
    data: plans, 
    isLoading: isLoadingPlans, 
    error: plansError,
    refetch: refetchPlans 
  } = useQuery<ResponsePlan[]>({
    queryKey: ["/api/response-plans"]
  });
  
  // Handle error display
  React.useEffect(() => {
    if (plansError) {
      console.error("Error fetching response plans:", plansError);
      toast({
        title: "Failed to load response plans",
        description: plansError instanceof Error ? plansError.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [plansError, toast]);
  
  // Fetch response teams for the dropdown
  const { 
    data: teams 
  } = useQuery<ResponseTeam[]>({
    queryKey: ["/api/response-teams"],
  });
  
  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
  
  // Mock data for partner agencies
  const agenciesData = [
    {
      id: "nema",
      name: "National Emergency Management Agency (NEMA)",
      logo: "/nema-logo.png",
      type: "Government",
      primaryContact: "John Doe",
      email: "contact@nema.gov.ng",
      phone: "+234-1-2345678",
      expertise: ["Disaster Management", "Emergency Response"]
    },
    {
      id: "ndlea",
      name: "National Drug Law Enforcement Agency (NDLEA)",
      logo: "/ndlea-logo.png",
      type: "Government",
      primaryContact: "Jane Smith",
      email: "info@ndlea.gov.ng",
      phone: "+234-1-8765432",
      expertise: ["Drug Enforcement", "Security"]
    },
    {
      id: "nscdc",
      name: "Nigeria Security and Civil Defence Corps (NSCDC)",
      logo: "/nscdc-logo.png",
      type: "Government",
      primaryContact: "Michael Johnson",
      email: "contact@nscdc.gov.ng",
      phone: "+234-1-5555555",
      expertise: ["Civil Defense", "Critical Infrastructure Protection"]
    },
    {
      id: "unicef",
      name: "UNICEF Nigeria",
      logo: "/unicef-logo.png",
      type: "International",
      primaryContact: "Sarah Parker",
      email: "info@unicef.org.ng",
      phone: "+234-1-4444444",
      expertise: ["Child Protection", "Humanitarian Aid"]
    },
    {
      id: "msf",
      name: "Doctors Without Borders (MSF)",
      logo: "/msf-logo.png",
      type: "International",
      primaryContact: "Dr. Robert Chen",
      email: "nigeria@msf.org",
      phone: "+234-1-3333333",
      expertise: ["Medical Emergency Response", "Healthcare"]
    },
    {
      id: "redcross",
      name: "Nigerian Red Cross Society",
      logo: "/redcross-logo.png",
      type: "Non-Governmental",
      primaryContact: "Alice Williams",
      email: "info@redcross.org.ng",
      phone: "+234-1-2222222",
      expertise: ["First Aid", "Humanitarian Services"]
    }
  ];
  
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
  
  // Toggle agency selection
  const toggleAgencySelection = (agencyId: string) => {
    if (selectedAgencies.includes(agencyId)) {
      setSelectedAgencies(selectedAgencies.filter(id => id !== agencyId));
    } else {
      setSelectedAgencies([...selectedAgencies, agencyId]);
    }
  };
  
  // Handle assignment submission
  const handleAssignAgencies = () => {
    if (!selectedPlan) return;
    
    // In a real app, this would be an API call to associate agencies with the plan
    toast({
      title: "Agencies Assigned",
      description: `${selectedAgencies.length} agencies assigned to "${selectedPlan.title}"`,
    });
    
    setAssignDialogOpen(false);
    setSelectedAgencies([]);
  };

  return (
    <MainLayout title="Inter-Agency Portal">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area - 8 columns on large screens */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="p-6 pb-2">
              <CardTitle>Inter-Agency Response Coordination</CardTitle>
              <CardDescription>
                Manage and coordinate crisis response efforts across multiple agencies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingPlans ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-neutral-500">Loading response plans...</p>
                </div>
              ) : plansError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load response plans</h3>
                  <p className="text-muted-foreground mb-4">
                    We encountered a problem while retrieving response plan data.
                  </p>
                  <div className="text-sm text-left max-w-md mx-auto mb-6">
                    <p className="font-medium mb-1">Troubleshooting tips:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check your internet connection and try again.</li>
                      <li>The server might be temporarily unavailable.</li>
                      <li>If the problem persists, contact technical support.</li>
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchPlans()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : filteredPlans && filteredPlans.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Region/Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Agencies</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.title}</TableCell>
                          <TableCell>{plan.region}{plan.location ? ` / ${plan.location}` : ''}</TableCell>
                          <TableCell>{getResponseTypeBadge(plan.category)}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {/* Display avatars for the assigned agencies - mocked up to 3 */}
                              {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, idx) => (
                                <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {agenciesData[idx % agenciesData.length].name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedPlan(plan);
                                setAssignDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
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
        
        {/* Agencies Panel - 4 columns on large screens */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Partner Agencies</CardTitle>
                <Badge>{agenciesData.length}</Badge>
              </div>
              <CardDescription>
                Government and NGO partners for emergency response
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {agenciesData.map((agency) => (
                    <Card key={agency.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{agency.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-base">{agency.name}</CardTitle>
                          </div>
                          <Badge>{agency.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="text-sm space-y-2">
                          <div className="flex items-start">
                            <Users2 className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-xs">Contact Person</p>
                              <p>{agency.primaryContact}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-xs">Phone</p>
                              <p>{agency.phone}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agency.expertise.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Contact
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Agency
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Agency Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Agencies to Response Plan</DialogTitle>
            <DialogDescription>
              Select agencies to collaborate on {selectedPlan?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="text-sm font-medium mb-3">Available Agencies</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {agenciesData.map((agency) => (
                <div 
                  key={agency.id} 
                  className="flex items-center space-x-3 border rounded-md p-3"
                >
                  <Checkbox 
                    id={agency.id}
                    checked={selectedAgencies.includes(agency.id)} 
                    onCheckedChange={() => toggleAgencySelection(agency.id)}
                  />
                  <div className="flex flex-1 items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{agency.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <label 
                        htmlFor={agency.id} 
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {agency.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {agency.expertise.join(", ")}
                      </p>
                    </div>
                  </div>
                  <Badge>{agency.type}</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedAgencies([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAgencies}
              disabled={selectedAgencies.length === 0}
            >
              Assign {selectedAgencies.length} {selectedAgencies.length === 1 ? 'Agency' : 'Agencies'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}