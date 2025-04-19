import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import NigeriaMap from "@/components/maps/NigeriaMap";

export default function MapPage() {
  const [mapHeight, setMapHeight] = useState("700px");
  
  // We're not setting 'incidents' prop, which forces the NigeriaMap component
  // to use its mockIncidents data instead of fetching from the API
  return (
    <MainLayout title="Crisis Map">
      <Card className="shadow-lg">
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Nigeria Crisis Map (All Regions)</CardTitle>
              <CardDescription>
                Comprehensive view of incidents across all Nigerian regions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMapHeight(mapHeight === "700px" ? "500px" : "700px")}
              >
                {mapHeight === "700px" ? "Reduce" : "Expand"} Map
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="border rounded-md overflow-hidden">
            <NigeriaMap 
              height={mapHeight}
              showIncidents={true}
              // Don't provide incidents prop, forcing the component to use mock data
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Map Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500"></div>
            <span>High Severity Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-amber-500"></div>
            <span>Medium Severity Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-500"></div>
            <span>Low Severity Incidents</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Click on any marker to view detailed information about the incident, including severity, 
            status, location, population affected, and incident category.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}