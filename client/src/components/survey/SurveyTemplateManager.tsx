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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash, 
  Edit2, 
  Save, 
  FileSpreadsheet, 
  RotateCw,
  AlertTriangle,
  Check,
  Move
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Sample survey template data
const SURVEY_TEMPLATES = [
  {
    id: 1,
    title: "Community Security Assessment",
    description: "Template for assessing security perceptions and concerns in communities",
    category: "Security",
    questionCount: 12,
    lastUsed: "2023-10-15T09:30:00Z",
    usageCount: 8
  },
  {
    id: 2,
    title: "Water Resources Survey",
    description: "Assessment of water access, quality and availability in communities",
    category: "Infrastructure",
    questionCount: 15,
    lastUsed: "2023-09-20T14:45:00Z",
    usageCount: 5
  },
  {
    id: 3,
    title: "Youth Engagement & Conflict",
    description: "Evaluate youth participation in community peacebuilding initiatives",
    category: "Social Cohesion",
    questionCount: 18,
    lastUsed: "2023-11-05T11:20:00Z",
    usageCount: 3
  },
  {
    id: 4,
    title: "Health Services Accessibility",
    description: "Measure access to healthcare services in conflict-affected areas",
    category: "Health",
    questionCount: 14,
    lastUsed: "2023-08-12T08:15:00Z",
    usageCount: 6
  }
];

// Sample question types
const QUESTION_TYPES = [
  { id: "text", name: "Text Response" },
  { id: "single_choice", name: "Single Choice" },
  { id: "multiple_choice", name: "Multiple Choice" },
  { id: "rating", name: "Rating Scale" },
  { id: "location", name: "Location Selection" }
];

// Form schema for creating a template
const templateFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  isPublic: z.boolean().default(true)
});

// Form schema for creating a question
const questionFormSchema = z.object({
  text: z.string().min(5, { message: "Question text must be at least 5 characters" }),
  type: z.string().min(1, { message: "Question type is required" }),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  helpText: z.string().optional()
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;
type QuestionFormValues = z.infer<typeof questionFormSchema>;

export function SurveyTemplateManager() {
  const [templates, setTemplates] = useState(SURVEY_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Initialize forms
  const templateForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      isPublic: true
    }
  });
  
  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: "",
      type: "",
      required: true,
      options: [],
      helpText: ""
    }
  });
  
  // Filter templates based on search query
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle template form submission
  function onTemplateSubmit(values: TemplateFormValues) {
    // Add new template
    const newTemplate = {
      id: templates.length + 1,
      title: values.title,
      description: values.description,
      category: values.category,
      questionCount: 0,
      lastUsed: new Date().toISOString(),
      usageCount: 0
    };
    
    setTemplates([...templates, newTemplate]);
    templateForm.reset();
    setCreateTemplateOpen(false);
    
    toast({
      title: "Template Created",
      description: "Your survey template has been created successfully.",
    });
  }
  
  // Handle question form submission
  function onQuestionSubmit(values: QuestionFormValues) {
    questionForm.reset();
    setAddQuestionOpen(false);
    
    toast({
      title: "Question Added",
      description: "The question has been added to the template.",
    });
  }
  
  // Handle using a template
  function useTemplate(templateId: number) {
    toast({
      title: "Template Used",
      description: "The template has been used to create a new survey.",
    });
  }
  
  // Handle deleting a template
  function deleteTemplate(templateId: number) {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      setTemplates(templates.filter(template => template.id !== templateId));
      
      toast({
        title: "Template Deleted",
        description: "The survey template has been deleted.",
        variant: "destructive"
      });
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Survey Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable survey templates for consistent data collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Survey Template</DialogTitle>
                <DialogDescription>
                  Create a new reusable survey template. You can add questions after creating the basic information.
                </DialogDescription>
              </DialogHeader>
              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
                  <FormField
                    control={templateForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={templateForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the purpose of this template" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={templateForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Security">Security</SelectItem>
                            <SelectItem value="Social Cohesion">Social Cohesion</SelectItem>
                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Governance">Governance</SelectItem>
                            <SelectItem value="Economic">Economic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={templateForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Public Template</FormLabel>
                          <FormDescription>
                            Make this template available to all users
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

                  <DialogFooter className="mt-6">
                    <Button type="submit">
                      Create Template
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
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                Survey templates for various assessment purposes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="search" 
                placeholder="Search templates..." 
                className="w-64" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Social Cohesion">Social Cohesion</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <Badge className="mb-1">{template.category}</Badge>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Questions:</span> {template.questionCount}
                    </div>
                    <div>
                      <span className="font-medium">Used:</span> {template.usageCount} times
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Last used:</span> {new Date(template.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-3">
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => useTemplate(template.id)}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Use Template
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => setSelectedTemplate(template.id)}>
                      Edit Questions
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Template Questions</CardTitle>
                <CardDescription>
                  Manage the questions for this template
                </CardDescription>
              </div>
              <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Add a new question to the survey template.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...questionForm}>
                    <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                      <FormField
                        control={questionForm.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter question text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={questionForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {QUESTION_TYPES.map(type => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={questionForm.control}
                          name="required"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>
                                  Must be answered
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
                      <FormField
                        control={questionForm.control}
                        name="helpText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Help Text (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional information for respondents" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter className="mt-6">
                        <Button type="submit">
                          Add Question
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell className="font-medium">How would you rate the overall security in your community?</TableCell>
                  <TableCell>Rating Scale</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Move className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2</TableCell>
                  <TableCell className="font-medium">Which security concerns are most prevalent in your area?</TableCell>
                  <TableCell>Multiple Choice</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Move className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>3</TableCell>
                  <TableCell className="font-medium">Have you observed increased security presence in the last 3 months?</TableCell>
                  <TableCell>Single Choice</TableCell>
                  <TableCell>
                    <Check className="h-4 w-4 text-green-500" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Move className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Back to Templates
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}