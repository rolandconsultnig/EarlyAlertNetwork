import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { Incident } from "@shared/schema.ts";
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
  Filter, 
  RefreshCw, 
  Eye, 
  Info, 
  MapPin, 
  Calendar, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import IncidentDetailModal from "@/components/incident/IncidentDetailModal";

export default function IncidentsListPage() {
  const [incidentFilter, setIncidentFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch incidents from API
  const { 
    data: incidents, 
    isLoading: isLoadingIncidents, 
    error: incidentsError,
    refetch: refetchIncidents 
  } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"]
  });

  // Filter incidents based on the selected filters
  const filteredIncidents = Array.isArray(incidents) ? incidents.filter(incident => {
    // Apply status filter
    const statusMatch = incidentFilter === "all" || 
      (incidentFilter === "active" && incident.status === "active") ||
      (incidentFilter === "pending" && incident.status === "pending") ||
      (incidentFilter === "resolved" && incident.status === "resolved");
    
    // Apply region filter
    const regionMatch = regionFilter === "all" || 
      (incident.region && incident.region.toLowerCase().includes(regionFilter.toLowerCase()));
    
    // Apply search filter
    const searchMatch = !searchQuery || 
      (incident.title && incident.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (incident.description && incident.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (incident.location && incident.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && regionMatch && searchMatch;
  });

  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Handle view incident details
  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailModalOpen(true);
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
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-neutral-100 text-neutral-800">Resolved</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "terrorism":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "violence":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "infrastructure":
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  // List of Nigeria regions for the filter
  const nigerianRegions = [
    "All Regions",
    "North Central",
    "North East",
    "North West",
    "South East",
    "South South",
    "South West",
    "Federal Capital Territory"
  ];

  return (
    <MainLayout title="All Incidents">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setIncidentFilter("all")}
                className={incidentFilter === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All Incidents
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                onClick={() => setIncidentFilter("active")}
                className={incidentFilter === "active" ? "bg-primary text-primary-foreground" : ""}
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                onClick={() => setIncidentFilter("pending")}
                className={incidentFilter === "pending" ? "bg-primary text-primary-foreground" : ""}
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="resolved" 
                onClick={() => setIncidentFilter("resolved")}
                className={incidentFilter === "resolved" ? "bg-primary text-primary-foreground" : ""}
              >
                Resolved
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Region Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Region</label>
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setRegionFilter("all")}
                className={regionFilter === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All Regions
              </TabsTrigger>
              <TabsTrigger 
                value="north" 
                onClick={() => setRegionFilter("north")}
                className={regionFilter === "north" ? "bg-primary text-primary-foreground" : ""}
              >
                Northern
              </TabsTrigger>
              <TabsTrigger 
                value="south" 
                onClick={() => setRegionFilter("south")}
                className={regionFilter === "south" ? "bg-primary text-primary-foreground" : ""}
              >
                Southern
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search incidents..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchIncidents()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/map">
            <Button variant="default" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle>Incidents List</CardTitle>
          <CardDescription>
            Comprehensive view of all reported incidents across Nigeria
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingIncidents ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-neutral-500">Loading incidents...</p>
            </div>
          ) : incidentsError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load incidents</h3>
              <p className="text-muted-foreground mb-4">
                We encountered a problem while retrieving incident data.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchIncidents()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredIncidents && filteredIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(incident.category || "")}
                        <span className="capitalize">{incident.category?.replace('_', ' ') || 'Unclassified'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-neutral-500" />
                        <span>{incident.location || incident.region || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span>{formatDate(incident.reportedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewIncident(incident)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
              <p className="text-muted-foreground">
                No incidents match your current filter criteria. Try changing your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </MainLayout>
  );
}