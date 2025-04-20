import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatusCard from "@/components/dashboard/StatusCard";
import AlertBanner from "@/components/dashboard/AlertBanner";
import MapView from "@/components/dashboard/Map";
import TrendChart from "@/components/dashboard/TrendChart";
import AlertsList from "@/components/dashboard/AlertsList";
import ResponseActivities from "@/components/dashboard/ResponseActivities";
import DataSources from "@/components/dashboard/DataSources";
import VoiceControl from "@/components/voice/VoiceControl";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Bell, Users, Database, TrendingUp, AlertTriangle, CheckCircle2, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DashboardPage() {
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const { data: incidents } = useQuery({
    queryKey: ["/api/incidents"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/active"],
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/response-teams"],
  });

  const { data: sources } = useQuery({
    queryKey: ["/api/data-sources"],
  });

  const handleTakeAction = (alertId: number) => {
    setSelectedAlertId(alertId);
    setAlertDialogOpen(true);
  };

  // Sample chart data
  const trendData = [
    { name: 'Mon', incidents: 10, displacement: 15 },
    { name: 'Tue', incidents: 20, displacement: 13 },
    { name: 'Wed', incidents: 15, displacement: 18 },
    { name: 'Thu', incidents: 25, displacement: 20 },
    { name: 'Fri', incidents: 30, displacement: 25 },
    { name: 'Sat', incidents: 35, displacement: 22 },
    { name: 'Sun', incidents: 25, displacement: 25 },
  ];

  // Sample map risk points
  const riskPoints = [
    { id: 1, position: [10, 30], title: "Armed group movement", risk: 'high' as const },
    { id: 2, position: [0, 0], title: "Resource scarcity", risk: 'medium' as const },
    { id: 3, position: [15, -20], title: "Political tension", risk: 'medium' as const },
    { id: 4, position: [-15, 15], title: "Displacement indicators", risk: 'low' as const },
  ];

  const selectedAlert = alerts?.find(alert => alert.id === selectedAlertId);

  // State for voice control popover
  const [voicePopoverOpen, setVoicePopoverOpen] = useState(false);

  return (
    <MainLayout title="Dashboard">
      {/* Voice Control Button */}
      <div className="absolute top-4 right-4 z-10">
        <Popover open={voicePopoverOpen} onOpenChange={setVoicePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-md hover:bg-blue-50">
              <Mic className="h-5 w-5 text-blue-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <VoiceControl />
          </PopoverContent>
        </Popover>
      </div>

      {showAlertBanner && (
        <AlertBanner 
          title="Potential conflict in North Region"
          description="Multiple indicators suggest increased tension at border towns. 3 new reports in the last 24 hours."
          onClose={() => setShowAlertBanner(false)}
          onViewDetails={() => setAlertDialogOpen(true)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatusCard
          title="Active Incidents"
          value={incidents?.length || 0}
          icon={<ClipboardList className="text-2xl h-6 w-6" />}
          iconClass="bg-primary/10 text-primary"
          statusElement={
            <>
              <span className="text-error flex items-center text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="ml-1">5 new</span>
              </span>
              <span className="text-neutral-500 text-sm ml-2">since yesterday</span>
            </>
          }
        />

        <StatusCard
          title="Active Alerts"
          value={alerts?.length || 0}
          icon={<Bell className="text-2xl h-6 w-6" />}
          iconClass="bg-secondary/10 text-secondary"
          statusElement={
            <>
              <span className="text-secondary flex items-center text-sm font-medium">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="ml-1">2 high priority</span>
              </span>
              <span className="text-neutral-500 text-sm ml-2">require attention</span>
            </>
          }
        />

        <StatusCard
          title="Response Teams"
          value={teams?.length || 0}
          icon={<Users className="text-2xl h-6 w-6" />}
          iconClass="bg-success/10 text-success"
          statusElement={
            <>
              <span className="text-success flex items-center text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="ml-1">All operational</span>
              </span>
              <span className="text-neutral-500 text-sm ml-2">across regions</span>
            </>
          }
        />

        <StatusCard
          title="Data Sources"
          value={sources?.length || 0}
          icon={<Database className="text-2xl h-6 w-6" />}
          iconClass="bg-info/10 text-info"
          statusElement={
            <>
              <span className="text-info flex items-center text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="ml-1">All synced</span>
              </span>
              <span className="text-neutral-500 text-sm ml-2">last updated 5 min ago</span>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MapView riskPoints={riskPoints} center={[0, 0]} zoom={2} />
          <TrendChart data={trendData} />
        </div>

        <div className="space-y-6">
          <AlertsList onTakeAction={handleTakeAction} />
          <ResponseActivities />
          <DataSources />
        </div>
      </div>

      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              {selectedAlert ? (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg">{selectedAlert.title}</h3>
                  <p className="mt-2">{selectedAlert.description}</p>
                  <div className="mt-4">
                    <span className="text-sm font-medium">Severity: </span>
                    <span className={`text-sm ${
                      selectedAlert.severity.toLowerCase() === 'high' ? 'text-error' :
                      selectedAlert.severity.toLowerCase() === 'medium' ? 'text-warning' :
                      'text-info'
                    }`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Generated: </span>
                    <span className="text-sm">
                      {new Date(selectedAlert.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2">Alert information is not available.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              // Navigate to the full alert details
              setAlertDialogOpen(false);
            }}>
              Take Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
