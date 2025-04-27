import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';

// UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, Plane, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Form schema
const flightSearchSchema = z.object({
  originCode: z.string().length(3, "Origin airport code must be 3 characters"),
  destinationCode: z.string().length(3, "Destination airport code must be 3 characters"),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  returnDate: z.date().optional(),
  adults: z.coerce.number().int().min(1, "At least 1 passenger required").max(9, "Maximum 9 passengers allowed").default(1),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY')
});

type FlightSearchValues = z.infer<typeof flightSearchSchema>;

interface FlightSearchProps {
  onFlightSelected?: (flight: any) => void;
}

export function FlightSearch({ onFlightSelected }: FlightSearchProps) {
  const { toast } = useToast();
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Get Nigerian airports for selection
  const { data: nigerianAirports, isLoading: airportsLoading } = useQuery({
    queryKey: ['/api/integration/nigerian-airports'],
    queryFn: async () => {
      const response = await fetch('/api/integration/nigerian-airports');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load airports');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Get Nigerian airlines for display
  const { data: nigerianAirlines, isLoading: airlinesLoading } = useQuery({
    queryKey: ['/api/integration/nigerian-airlines'],
    queryFn: async () => {
      const response = await fetch('/api/integration/nigerian-airlines');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load airlines');
      }
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Form for flight search
  const form = useForm<FlightSearchValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      originCode: 'LOS', // Lagos by default
      destinationCode: 'ABV', // Abuja by default
      departureDate: new Date(),
      adults: 1,
      travelClass: 'ECONOMY'
    },
  });

  // Search flights mutation
  const searchFlightsMutation = useMutation({
    mutationFn: async (values: FlightSearchValues) => {
      // Format the dates for the API
      const formattedValues = {
        ...values,
        departureDate: format(values.departureDate, 'yyyy-MM-dd'),
        returnDate: values.returnDate ? format(values.returnDate, 'yyyy-MM-dd') : undefined
      };
      
      const res = await apiRequest('POST', '/api/integration/flights/search', formattedValues);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search flights');
      }
      
      return data.data;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      toast({
        title: 'Flights found',
        description: `${data.length} flights found for your search criteria.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: FlightSearchValues) => {
    if (tripType === 'oneWay' && values.returnDate) {
      // Remove returnDate for one-way trips
      const { returnDate, ...oneWayValues } = values;
      searchFlightsMutation.mutate(oneWayValues);
    } else {
      searchFlightsMutation.mutate(values);
    }
  };

  // Handle selecting a flight
  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight);
    if (onFlightSelected) {
      onFlightSelected(flight);
    }
  };

  // Format flight price for display
  const formatPrice = (price: string, currency: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    });
    
    return formatter.format(parseFloat(price));
  };

  // Get airline info by code
  const getAirlineInfo = (code: string) => {
    if (!nigerianAirlines) return { name: code, logo: '' };
    const airline = nigerianAirlines.find(airline => airline.code === code);
    return airline || { name: code, logo: '' };
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Flight Search</CardTitle>
        <CardDescription>
          Search for flights between Nigerian airports for evacuation and transportation planning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="oneWay" className="w-full" onValueChange={(value) => setTripType(value as 'oneWay' | 'roundTrip')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="oneWay">One Way</TabsTrigger>
            <TabsTrigger value="roundTrip">Round Trip</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin airport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {airportsLoading ? (
                            <SelectItem value="loading" disabled>Loading airports...</SelectItem>
                          ) : (
                            nigerianAirports?.map(airport => (
                              <SelectItem key={airport.code} value={airport.code}>
                                {airport.city} ({airport.code}) - {airport.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select departure airport
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="destinationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination airport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {airportsLoading ? (
                            <SelectItem value="loading" disabled>Loading airports...</SelectItem>
                          ) : (
                            nigerianAirports?.map(airport => (
                              <SelectItem key={airport.code} value={airport.code}>
                                {airport.city} ({airport.code}) - {airport.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select arrival airport
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {tripType === 'roundTrip' && (
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Return Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => 
                                date < new Date() || 
                                (form.getValues().departureDate && date < form.getValues().departureDate)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passengers</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={9} 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>
                        Number of passengers (1-9)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="travelClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ECONOMY">Economy</SelectItem>
                          <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                          <SelectItem value="FIRST">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select travel class
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={searchFlightsMutation.isPending}
              >
                {searchFlightsMutation.isPending 
                  ? 'Searching...' 
                  : 'Search Flights'
                }
              </Button>
            </form>
          </Form>
        </Tabs>
        
        {/* Results Section */}
        {searchFlightsMutation.isPending && (
          <div className="mt-8 text-center">
            <div className="animate-pulse">Searching for flights...</div>
          </div>
        )}
        
        {searchFlightsMutation.isError && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {searchFlightsMutation.error?.message || 'Failed to search flights. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        {searchResults.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((flight, index) => {
                const airline = getAirlineInfo(flight.validatingAirlineCodes[0]);
                const price = flight.price.total;
                const currency = flight.price.currency;
                
                // Extract the first segment for display
                const firstSegment = flight.itineraries[0].segments[0];
                const departureTime = new Date(firstSegment.departure.at);
                const arrivalTime = new Date(firstSegment.arrival.at);
                const duration = firstSegment.duration;
                
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedFlight === flight ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectFlight(flight)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {airline.logo ? (
                            <img src={airline.logo} alt={airline.name} className="h-8 w-8 object-contain" />
                          ) : (
                            <Plane className="h-6 w-6" />
                          )}
                          <div>
                            <div className="font-medium">{airline.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Flight {firstSegment.number}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold">
                          {formatPrice(price, currency)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            {format(departureTime, 'HH:mm')}
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {firstSegment.departure.iataCode}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground">
                            {duration.replace('PT', '').toLowerCase()}
                          </div>
                          <div className="relative w-24 h-0.5 bg-muted my-2">
                            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Direct
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {format(arrivalTime, 'HH:mm')}
                          </div>
                          <div className="flex items-center text-sm justify-end">
                            <MapPin className="h-3 w-3 mr-1" />
                            {firstSegment.arrival.iataCode}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {searchResults.length === 0 && searchFlightsMutation.isSuccess && (
          <Alert className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No flights found</AlertTitle>
            <AlertDescription>
              No flights match your search criteria. Try different dates or airports.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      {selectedFlight && (
        <CardFooter className="flex-col border-t p-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm font-medium">Selected Flight</div>
            <div className="text-lg font-bold">
              {formatPrice(selectedFlight.price.total, selectedFlight.price.currency)}
            </div>
          </div>
          <Separator className="my-2" />
          <Button 
            className="w-full" 
            onClick={() => {
              toast({
                title: 'Flight booking initiated',
                description: 'Flight booking process would start here in a real implementation.',
              });
            }}
          >
            Continue to Booking
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default FlightSearch;