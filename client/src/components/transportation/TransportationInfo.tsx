import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MapPin, Car, Train, Anchor, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Transportation information component
export function TransportationInfo() {
  const { toast } = useToast();
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('hubs');

  // Get transportation hubs
  const { 
    data: hubsData, 
    isLoading: hubsLoading, 
    error: hubsError 
  } = useQuery({
    queryKey: ['/api/integration/transportation/hubs'],
    queryFn: async () => {
      const response = await fetch('/api/integration/transportation/hubs');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load transportation hubs');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  // Get transportation routes
  const { 
    data: routesData, 
    isLoading: routesLoading, 
    error: routesError 
  } = useQuery({
    queryKey: ['/api/integration/transportation/routes'],
    queryFn: async () => {
      const response = await fetch('/api/integration/transportation/routes');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load transportation routes');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  // Get transportation disruptions
  const { 
    data: disruptionsData, 
    isLoading: disruptionsLoading, 
    error: disruptionsError 
  } = useQuery({
    queryKey: ['/api/integration/transportation/disruptions'],
    queryFn: async () => {
      const response = await fetch('/api/integration/transportation/disruptions');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load transportation disruptions');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes - shorter for disruptions
  });

  // Get evacuation routes based on search
  const { 
    data: evacuationData, 
    isLoading: evacuationLoading, 
    error: evacuationError,
    refetch: refetchEvacuation
  } = useQuery({
    queryKey: ['/api/integration/transportation/evacuation-routes', locationSearch],
    queryFn: async () => {
      if (!locationSearch || locationSearch.length < 2) {
        return null;
      }
      const response = await fetch(`/api/integration/transportation/evacuation-routes?location=${encodeURIComponent(locationSearch)}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load evacuation routes');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    enabled: locationSearch.length >= 2, // Only run when search is valid
  });

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationSearch.length >= 2) {
      refetchEvacuation();
      setActiveTab('evacuation');
    } else {
      toast({
        title: 'Invalid search',
        description: 'Please enter at least 2 characters to search for evacuation routes',
        variant: 'destructive',
      });
    }
  };

  // Get risk level badge
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-500">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High Risk</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critical Risk</Badge>;
      default:
        return <Badge>{riskLevel}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500">Operational</Badge>;
      case 'caution':
        return <Badge className="bg-yellow-500">Caution</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'closed':
        return <Badge className="bg-red-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get icon for transportation type
  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'road':
        return <Car className="h-4 w-4 mr-1" />;
      case 'rail':
        return <Train className="h-4 w-4 mr-1" />;
      case 'water':
        return <Anchor className="h-4 w-4 mr-1" />;
      default:
        return <MapPin className="h-4 w-4 mr-1" />;
    }
  };

  // Get severity badge for disruptions
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  // Render content for the hubs tab
  const renderHubsTab = () => {
    if (hubsLoading) {
      return <div className="py-4 text-center">Loading transportation hubs...</div>;
    }

    if (hubsError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {hubsError instanceof Error ? hubsError.message : 'Failed to load transportation hubs'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {hubsData?.map((hub: any) => (
          <Card key={hub.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{hub.name}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> 
                {hub.transportationTypes.join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Facilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {hub.facilities.map((facility: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center">
                        {getTransportIcon(facility.type)}
                        {facility.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render content for the routes tab
  const renderRoutesTab = () => {
    if (routesLoading) {
      return <div className="py-4 text-center">Loading transportation routes...</div>;
    }

    if (routesError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {routesError instanceof Error ? routesError.message : 'Failed to load transportation routes'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4 py-4">
        {routesData?.map((route: any) => (
          <Card key={route.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <div className="flex space-x-2">
                  {getStatusBadge(route.status)}
                  {getRiskBadge(route.riskLevel)}
                </div>
              </div>
              <CardDescription className="flex items-center">
                {getTransportIcon(route.type)}
                {route.type} • {route.distance} km
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  From: {route.start.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  To: {route.end.name}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render content for the disruptions tab
  const renderDisruptionsTab = () => {
    if (disruptionsLoading) {
      return <div className="py-4 text-center">Loading transportation disruptions...</div>;
    }

    if (disruptionsError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {disruptionsError instanceof Error ? disruptionsError.message : 'Failed to load transportation disruptions'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4 py-4">
        {disruptionsData?.map((disruption: any) => (
          <Card key={disruption.id} className="overflow-hidden border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  {disruption.type}
                </CardTitle>
                {getSeverityBadge(disruption.severity)}
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {disruption.location.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{disruption.description}</p>
              
              {disruption.alternateRoutes && disruption.alternateRoutes.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold">Alternate Routes:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {disruption.alternateRoutes.map((route: any, index: number) => (
                      <li key={index} className="flex items-center">
                        {getTransportIcon(route.type)}
                        {route.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render content for the evacuation tab
  const renderEvacuationTab = () => {
    return (
      <div className="space-y-4 py-4">
        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
          <Input
            placeholder="Enter city or region (e.g., Lagos, Abuja)"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={evacuationLoading}>
            {evacuationLoading ? 'Searching...' : 'Find Routes'}
          </Button>
        </form>

        {evacuationLoading && (
          <div className="py-4 text-center">Loading evacuation routes...</div>
        )}

        {evacuationError && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {evacuationError instanceof Error ? evacuationError.message : 'Failed to load evacuation routes'}
            </AlertDescription>
          </Alert>
        )}

        {evacuationData && Array.isArray(evacuationData) && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Evacuation Routes for {locationSearch}</h3>
            {evacuationData.map((route: any) => (
              <Card key={route.id} className="overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  <CardDescription>
                    <Badge className="mr-2">{route.transportType}</Badge>
                    <Badge variant="outline">Est. Time: {route.estimatedEvacuationTime}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Path: </span>
                      {route.path}
                    </div>

                    <div>
                      <span className="font-semibold">Checkpoints: </span>
                      <ul className="list-disc list-inside mt-1">
                        {route.checkpoints.map((checkpoint: any, index: number) => (
                          <li key={index}>{checkpoint.name}</li>
                        ))}
                      </ul>
                    </div>

                    {route.alternateRoutes && route.alternateRoutes.length > 0 && (
                      <div>
                        <span className="font-semibold">Alternate Routes: </span>
                        <ul className="list-disc list-inside mt-1">
                          {route.alternateRoutes.map((alt: any, index: number) => (
                            <li key={index}>{alt.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center">
                      <span className="font-semibold mr-2">Congestion Level: </span>
                      <Badge 
                        className={
                          route.congestionLevel === 'low' ? 'bg-green-500' : 
                          route.congestionLevel === 'medium' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }
                      >
                        {route.congestionLevel}
                      </Badge>
                    </div>

                    {route.securityConcerns && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Security Concerns</AlertTitle>
                        <AlertDescription>
                          Security level: {route.securityConcerns}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {evacuationData && !Array.isArray(evacuationData) && (
          <div className="mt-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>
                {evacuationData.message}
              </AlertDescription>
            </Alert>

            {evacuationData.generalAdvice && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-md">General Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {evacuationData.generalAdvice.map((advice: string, index: number) => (
                      <li key={index}>{advice}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {evacuationData.emergencyContacts && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evacuationData.emergencyContacts.map((contact: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>{contact.name}</span>
                        <Badge variant="outline">{contact.phone}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {locationSearch.length >= 2 && !evacuationData && !evacuationLoading && !evacuationError && (
          <Alert className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>
              No evacuation routes found for {locationSearch}. Try another location.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transportation Information</CardTitle>
        <CardDescription>
          View transportation hubs, routes, disruptions, and evacuation information for Nigeria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="hubs" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hubs">Hubs</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="disruptions">Disruptions</TabsTrigger>
            <TabsTrigger value="evacuation">Evacuation</TabsTrigger>
          </TabsList>

          <TabsContent value="hubs">
            {renderHubsTab()}
          </TabsContent>

          <TabsContent value="routes">
            {renderRoutesTab()}
          </TabsContent>

          <TabsContent value="disruptions">
            {renderDisruptionsTab()}
          </TabsContent>

          <TabsContent value="evacuation">
            {renderEvacuationTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TransportationInfo;