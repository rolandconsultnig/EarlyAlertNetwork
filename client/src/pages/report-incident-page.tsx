import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertIncidentSchema } from "@shared/schema";
import { Link } from "wouter";

// Import components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, FileText, MapPin, AlertTriangle, User, Mic } from "lucide-react";
import VoiceIncidentReporting from "@/components/voice/VoiceIncidentReporting";

// Import the IPCR logo
import ipcr_logo from "@assets/Institute-For-Peace-And-Conflict-Resolution.jpg";

// Create a citizen incident report schema
const publicIncidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide a detailed description"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  region: z.string().min(2, "Please select a region"),
  actorType: z.enum(["state", "non-state"], {
    required_error: "Please select an actor type",
  }),
  actorName: z.string().min(2, "Actor name must be at least 2 characters"),
  contactName: z.string().min(2, "Your name must be at least 2 characters"),
  contactEmail: z.string().email("Please provide a valid email").optional(),
  contactPhone: z.string().min(8, "Please provide a valid phone number"),
});

type PublicIncidentFormValues = z.infer<typeof publicIncidentSchema>;

export default function ReportIncidentPage() {
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<PublicIncidentFormValues>({
    resolver: zodResolver(publicIncidentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      region: "North Central",
      actorType: undefined,
      actorName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  // Mutation for submitting the incident
  const reportIncidentMutation = useMutation({
    mutationFn: async (data: PublicIncidentFormValues) => {
      // Format the data for the API
      const incidentData = {
        ...data,
        status: "pending", // Incidents from public start as pending until verified
        category: "conflict",
        reportedAt: new Date().toISOString(),
        locationMetadata: {
          coordinates: data.location,
          region: data.region
        },
        verificationStatus: "unverified",
        actors: {
          type: data.actorType,
          name: data.actorName
        },
        reporterInfo: {
          name: data.contactName,
          email: data.contactEmail || "",
          phone: data.contactPhone
        }
      };
      
      const res = await apiRequest("POST", "/api/public/incidents", incidentData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Incident Reported",
        description: "Thank you for your report. Officials will review it shortly.",
      });
      form.reset();
      // Show success state
      setIsSubmitSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit report",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // State to track if form has been successfully submitted
  const [isSubmitSuccess, setIsSubmitSuccess] = React.useState(false);

  function onSubmit(data: PublicIncidentFormValues) {
    reportIncidentMutation.mutate(data);
  }

  // Nigeria regions
  const nigeriaRegions = [
    "North Central",
    "North East",
    "North West",
    "South East",
    "South South",
    "South West",
    "Federal Capital Territory"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <img src={ipcr_logo} alt="IPCR Logo" className="h-16 w-16" />
            <div>
              <h1 className="text-xl font-bold text-blue-600">Institute For Peace And Conflict Resolution</h1>
              <p className="text-sm text-gray-500">Early Warning & Early Response System</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {!isSubmitSuccess ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Incident</h1>
                <p className="text-gray-600">
                  Help us build peace by reporting incidents of conflict or violence. Your information will be kept confidential.
                </p>
              </div>
              
              {/* Voice Incident Reporting Component */}
              <VoiceIncidentReporting onSubmit={(incident) => {
                // Handle voice-submitted incidents if needed
                toast({
                  title: "Voice Incident Reported",
                  description: "Your incident report has been submitted successfully via voice command.",
                });
                setIsSubmitSuccess(true);
              }} />

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-sky-500 text-white">
                  <CardTitle>Incident Report Form</CardTitle>
                  <CardDescription className="text-white opacity-90">
                    Please provide as much detail as possible
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Incident Details
                        </h3>

                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incident Title</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Armed Conflict in Benue State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Provide details about what happened, who was involved, and the impact" 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Include details like time, number of people affected, and any immediate needs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="Village, Town, or Area" {...field} />
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
                                <FormLabel>Region</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select region" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {nigeriaRegions.map((region) => (
                                      <SelectItem key={region} value={region}>
                                        {region}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="pt-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-blue-500" />
                            Actor Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="actorType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Actor Type</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select actor type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="state">State Actor (Government, Military, etc.)</SelectItem>
                                      <SelectItem value="non-state">Non-State Actor (Rebel group, Community, etc.)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="actorName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Actor Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Specify the name of the actor" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-green-500" />
                            Your Contact Information
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            This information will be kept confidential and only used if officials need to follow up.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="contactPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your contact number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="contactEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your email address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto"
                          disabled={reportIncidentMutation.isPending}
                        >
                          {reportIncidentMutation.isPending ? "Submitting..." : "Submit Report"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-lg text-center">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle>Thank You for Your Report</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted Successfully</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Your incident report has been received. Officials will review the information and take appropriate action.
                  Thank you for contributing to peace and security in Nigeria.
                </p>
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <p className="text-sm text-gray-500 mb-4">Report reference number: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline">Return to Home</Button>
                </Link>
                <Button onClick={() => setIsSubmitSuccess(false)}>Submit Another Report</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Institute for Peace and Conflict Resolution. All rights reserved.</p>
          <p className="mt-2">Your reports help build a more peaceful Nigeria. Thank you for your contribution.</p>
        </div>
      </footer>
    </div>
  );
}