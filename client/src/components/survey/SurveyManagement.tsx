import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash, Pencil, PlusCircle, FileQuestion, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define types for surveys
interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'rating' | 'location';
  text: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

interface Survey {
  id: number;
  title: string;
  description: string;
  isTemplate: boolean;
  isActive: boolean;
  questions: SurveyQuestion[];
  createdAt: string;
  createdBy: number;
  updatedAt: string | null;
  responsesCount: number;
}

// Create a schema for form validation
const surveyFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  isTemplate: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export function SurveyManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch surveys
  const { data: surveys, isLoading, error } = useQuery({
    queryKey: ["/api/surveys"],
    staleTime: 60000 // 1 minute
  });

  // Fetch templates 
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/surveys/templates"],
    staleTime: 60000,
    enabled: activeTab === "templates"
  });

  // Delete survey mutation
  const deleteSurveyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/surveys/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Survey deleted",
        description: "The survey has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/templates"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete survey. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create survey form
  const form = useForm<z.infer<typeof surveyFormSchema>>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isTemplate: false,
      isActive: true
    }
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof surveyFormSchema>) => {
      // Add empty questions array
      const surveyData = {
        ...values,
        questions: [],
        createdBy: 1 // Default to admin user
      };
      
      const response = await apiRequest("POST", "/api/surveys", surveyData);
      const newSurvey = await response.json();
      return newSurvey;
    },
    onSuccess: (newSurvey) => {
      toast({
        title: "Survey created",
        description: "Your new survey has been created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/templates"] });
      
      setCreateDialogOpen(false);
      form.reset();
      
      // Navigate to the survey editor
      navigate(`/surveys/edit/${newSurvey.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof surveyFormSchema>) {
    createSurveyMutation.mutate(values);
  }

  function handleDeleteSurvey(id: number) {
    if (confirm("Are you sure you want to delete this survey? This action cannot be undone.")) {
      deleteSurveyMutation.mutate(id);
    }
  }

  // Handle creating a survey from a template
  function createFromTemplate(templateId: number) {
    const template = templates?.find((t: Survey) => t.id === templateId);
    if (!template) return;
    
    // Open the create dialog and pre-fill with template info
    form.reset({
      title: `Copy of ${template.title}`,
      description: template.description,
      isTemplate: false,
      isActive: true
    });
    
    setCreateDialogOpen(true);
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading surveys...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded text-red-900">
        Error loading surveys. Please refresh and try again.
      </div>
    );
  }

  const displayedSurveys = activeTab === "templates" ? templates : surveys;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Survey Management</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>
                Create a new survey or template. You can add questions after creating the basic information.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter survey title" {...field} />
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
                          placeholder="Describe the purpose of this survey" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="isTemplate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Template</FormLabel>
                          <FormDescription>
                            Save as reusable template
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Make available for responses
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={createSurveyMutation.isPending}>
                    {createSurveyMutation.isPending ? "Creating..." : "Create Survey"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Surveys</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {surveys && surveys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveys.map((survey: Survey) => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey}
                  onDelete={() => handleDeleteSurvey(survey.id)}
                  onEdit={() => navigate(`/surveys/edit/${survey.id}`)}
                  onViewResponses={() => navigate(`/surveys/responses/${survey.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed rounded-lg">
              <FileQuestion className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <h3 className="font-medium">No surveys yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first survey to start collecting data
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Survey
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          {templatesLoading ? (
            <div className="flex justify-center items-center h-40">Loading templates...</div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: Survey) => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onDelete={() => handleDeleteSurvey(template.id)}
                  onEdit={() => navigate(`/surveys/edit/${template.id}`)}
                  onCreateFromTemplate={() => createFromTemplate(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed rounded-lg">
              <FileQuestion className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <h3 className="font-medium">No templates yet</h3>
              <p className="text-muted-foreground mt-1">
                Create a survey and save it as a template
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SurveyCardProps {
  survey: Survey;
  onDelete: () => void;
  onEdit: () => void;
  onViewResponses: () => void;
}

function SurveyCard({ survey, onDelete, onEdit, onViewResponses }: SurveyCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{survey.title}</CardTitle>
            <CardDescription className="mt-1">{survey.description}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            survey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {survey.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created on</span>
            <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Questions</span>
            <span>{survey.questions.length}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Responses</span>
            <span>{survey.responsesCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onViewResponses}>
          View Responses
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

interface TemplateCardProps {
  template: Survey;
  onDelete: () => void;
  onEdit: () => void;
  onCreateFromTemplate: () => void;
}

function TemplateCard({ template, onDelete, onEdit, onCreateFromTemplate }: TemplateCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{template.title}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
            Template
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Created on</span>
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Questions</span>
            <span>{template.questions.length}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onCreateFromTemplate}>
          <Copy className="mr-2 h-4 w-4" />
          Use Template
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}