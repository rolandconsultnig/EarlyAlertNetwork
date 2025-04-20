import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Filter, MapPin, Phone, Search, Plus, UserPlus } from "lucide-react";

// Define the schema for community informant
const informantSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  location: z.string().min(2, { message: "Location is required" }),
  region: z.string().min(1, { message: "Region is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  notes: z.string().optional(),
});

type InformantFormValues = z.infer<typeof informantSchema>;

// Sample data for demonstration
const DEMO_INFORMANTS = [
  { 
    id: 1, 
    name: "Adebayo Ogunlesi", 
    phone: "+234 803 456 7890", 
    location: "Lagos", 
    region: "South West", 
    role: "Community Leader", 
    status: "active", 
    reports: 15 
  },
  { 
    id: 2, 
    name: "Fatima Ibrahim", 
    phone: "+234 702 123 4567", 
    location: "Kano", 
    region: "North West", 
    role: "Religious Leader", 
    status: "active", 
    reports: 23 
  },
  { 
    id: 3, 
    name: "Chioma Nwosu", 
    phone: "+234 805 987 6543", 
    location: "Owerri", 
    region: "South East", 
    role: "Youth Organizer", 
    status: "inactive", 
    reports: 8 
  },
  { 
    id: 4, 
    name: "Emmanuel Okafor", 
    phone: "+234 701 234 5678", 
    location: "Enugu", 
    region: "South East", 
    role: "Teacher", 
    status: "active", 
    reports: 19 
  },
  { 
    id: 5, 
    name: "Aisha Mohammed", 
    phone: "+234 809 876 5432", 
    location: "Kaduna", 
    region: "North Central", 
    role: "Health Worker", 
    status: "active", 
    reports: 27 
  },
];

export function CommunityInformants() {
  const [informants, setInformants] = useState(DEMO_INFORMANTS);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<InformantFormValues>({
    resolver: zodResolver(informantSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      region: "",
      role: "",
      notes: "",
    },
  });

  // Filter informants based on search query
  const filteredInformants = informants.filter(
    (informant) =>
      informant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      informant.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      informant.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      informant.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Number of active informants
  const activeInformants = informants.filter(
    (informant) => informant.status === "active"
  ).length;

  // Form submission handler
  function onSubmit(values: InformantFormValues) {
    // Add the new informant to the state
    const newInformant = {
      id: informants.length + 1,
      name: values.name,
      phone: values.phone,
      location: values.location,
      region: values.region,
      role: values.role,
      status: "active",
      reports: 0,
    };

    setInformants([...informants, newInformant]);
    form.reset();
    setAddDialogOpen(false);

    toast({
      title: "Informant Added",
      description: "The new informant has been successfully added.",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community Informants</h2>
          <p className="text-muted-foreground">
            Manage your network of verified community reporters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            {activeInformants} Active
          </Badge>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Informant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Community Informant</DialogTitle>
                <DialogDescription>
                  Enter the details of the new community informant. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+234 800 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="City/Town/Village" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="North Central">North Central</SelectItem>
                              <SelectItem value="North East">North East</SelectItem>
                              <SelectItem value="North West">North West</SelectItem>
                              <SelectItem value="South East">South East</SelectItem>
                              <SelectItem value="South South">South South</SelectItem>
                              <SelectItem value="South West">South West</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Community Leader">Community Leader</SelectItem>
                            <SelectItem value="Religious Leader">Religious Leader</SelectItem>
                            <SelectItem value="Youth Organizer">Youth Organizer</SelectItem>
                            <SelectItem value="Teacher">Teacher</SelectItem>
                            <SelectItem value="Health Worker">Health Worker</SelectItem>
                            <SelectItem value="Local Official">Local Official</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional information about this informant" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button type="submit">
                      Add Informant
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Informant Directory</CardTitle>
              <CardDescription>
                Complete list of registered informants across all regions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search informants..." 
                  className="pl-8 w-64" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInformants.map((informant) => (
                <TableRow key={informant.id}>
                  <TableCell className="font-medium">{informant.name}</TableCell>
                  <TableCell>{informant.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{informant.location}</span>
                      <span className="text-xs text-muted-foreground">{informant.region}</span>
                    </div>
                  </TableCell>
                  <TableCell>{informant.role}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        informant.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {informant.status.charAt(0).toUpperCase() + informant.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{informant.reports}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}