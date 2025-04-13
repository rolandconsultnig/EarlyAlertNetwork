import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTemplate from "@/components/modules/PageTemplate";
import { Folder, CheckSquare, PenSquare, Link as LinkIcon, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export default function CaseManagementPage() {
  const [activeTab, setActiveTab] = useState("followup");
  
  const toolbar = (
    <>
      <Button variant="outline">
        <Folder className="h-4 w-4 mr-2" />
        Import Cases
      </Button>
      <Button>
        <PenSquare className="h-4 w-4 mr-2" />
        New Case
      </Button>
    </>
  );
  
  // Sample data for cases
  const cases = [
    { 
      id: 1, 
      title: "Farmer-Herder Dispute in Benue", 
      status: "Open", 
      priority: "High", 
      assignedTo: "John Okafor", 
      updatedAt: "2023-03-15T14:30:00" 
    },
    { 
      id: 2, 
      title: "Community Displacement in Borno", 
      status: "In Progress", 
      priority: "Critical", 
      assignedTo: "Amina Ibrahim", 
      updatedAt: "2023-03-14T10:15:00" 
    },
    { 
      id: 3, 
      title: "Oil Resource Dispute in Rivers", 
      status: "In Progress", 
      priority: "Medium", 
      assignedTo: "Emeka Eze", 
      updatedAt: "2023-03-13T16:45:00" 
    },
    { 
      id: 4, 
      title: "Religious Tensions in Kaduna", 
      status: "Resolved", 
      priority: "High", 
      assignedTo: "Fatima Mohammed", 
      updatedAt: "2023-03-10T09:30:00" 
    },
    { 
      id: 5, 
      title: "Political Violence in Lagos", 
      status: "Closed", 
      priority: "Medium", 
      assignedTo: "Oluwaseun Adeleke", 
      updatedAt: "2023-03-05T13:20:00" 
    },
  ];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Open":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Open</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Resolved</Badge>;
      case "Closed":
        return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 hover:bg-neutral-50">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "High":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };
  
  return (
    <PageTemplate 
      title="Case Management"
      description="Track, document, and resolve conflict cases"
      toolbar={toolbar}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="followup" className="py-2">
            <CheckSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Follow-up Logs</span>
            <span className="md:hidden">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="py-2">
            <PenSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Status Tracking</span>
            <span className="md:hidden">Status</span>
          </TabsTrigger>
          <TabsTrigger value="attachments" className="py-2">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Notes & Attachments</span>
            <span className="md:hidden">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="linked" className="py-2">
            <LinkIcon className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Linked Cases</span>
            <span className="md:hidden">Linked</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="followup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Follow-up Logs</CardTitle>
              <CardDescription>
                Track and document conflict case follow-up activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.title}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-7 w-7 mr-2">
                            <AvatarFallback className="text-xs">
                              {caseItem.assignedTo.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{caseItem.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(caseItem.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Update</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Cases</CardTitle>
                <CardDescription>Cases requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {cases.filter(c => c.status === "Open").length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {cases.filter(c => c.status === "Open" && c.priority === "High").length} high priority
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">In Progress</CardTitle>
                <CardDescription>Cases currently being addressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {cases.filter(c => c.status === "In Progress").length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {cases.filter(c => c.status === "In Progress" && c.priority === "Critical").length} critical priority
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolved</CardTitle>
                <CardDescription>Successfully resolved cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {cases.filter(c => c.status === "Resolved" || c.status === "Closed").length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  In the past 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Tracking & Resolution Reports</CardTitle>
              <CardDescription>
                Track case status changes and document resolutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <PenSquare className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Status Tracking Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide case status workflow tracking, resolution documentation, and performance metrics reporting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Notes and Attachments</CardTitle>
              <CardDescription>
                Add notes, reports, and file attachments to cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Notes & Attachments Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will offer collaborative note-taking, file attachment management, and document organization features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="linked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked Cases and Conflict Chains</CardTitle>
              <CardDescription>
                Identify relationships between cases and track conflict evolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div>
                  <LinkIcon className="h-20 w-20 text-blue-400 mx-auto mb-4 opacity-70" />
                  <h3 className="text-lg font-medium">Linked Cases Module</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This module will provide case linking, conflict chain visualization, and relationship mapping between related incidents.
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