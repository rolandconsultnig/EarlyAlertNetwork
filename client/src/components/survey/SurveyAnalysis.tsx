import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  Download, 
  FileSpreadsheet,
  Clock,
  Users,
  Calendar,
  MapPin
} from "lucide-react";

// Sample data for demonstration
const SURVEY_SAMPLE = {
  id: 1,
  title: "Community Security Assessment",
  description: "Quarterly assessment of security perceptions across communities",
  createdAt: "2023-10-15T09:30:00Z",
  responses: 186,
  regionsRepresented: ["North Central", "North East", "South West"],
  questions: [
    {
      id: "q1",
      text: "How would you rate the overall security in your community?",
      type: "rating",
      options: [1, 2, 3, 4, 5],
      responses: [12, 28, 67, 54, 25]
    },
    {
      id: "q2",
      text: "Which security concerns are most prevalent in your area?",
      type: "multiple_choice",
      options: ["Armed Robbery", "Kidnapping", "Terrorism", "Communal Clashes", "Banditry"],
      responses: [42, 65, 38, 87, 59]
    },
    {
      id: "q3",
      text: "Have you observed increased security presence in the last 3 months?",
      type: "single_choice",
      options: ["Yes", "No", "Not Sure"],
      responses: [78, 82, 26]
    },
    {
      id: "q4",
      text: "How often do you report security incidents to authorities?",
      type: "single_choice",
      options: ["Always", "Sometimes", "Rarely", "Never"],
      responses: [45, 63, 52, 26]
    }
  ],
  demographicData: {
    gender: [
      { name: "Male", value: 102 },
      { name: "Female", value: 78 },
      { name: "Other/Prefer not to say", value: 6 }
    ],
    age: [
      { name: "18-24", value: 42 },
      { name: "25-34", value: 68 },
      { name: "35-44", value: 45 },
      { name: "45-54", value: 21 },
      { name: "55+", value: 10 }
    ],
    regions: [
      { name: "North Central", value: 54 },
      { name: "North East", value: 45 },
      { name: "North West", value: 12 },
      { name: "South East", value: 18 },
      { name: "South South", value: 17 },
      { name: "South West", value: 40 }
    ]
  },
  keyInsights: [
    "87 respondents identified communal clashes as a top security concern",
    "Only 24% of respondents 'Always' report security incidents",
    "Perception of security is lowest in North East region (avg. 2.4/5)",
    "55% of respondents aged 25-34 have not observed increased security presence"
  ]
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function SurveyAnalysis() {
  const [selectedSurvey, setSelectedSurvey] = useState(SURVEY_SAMPLE);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Format data for question charts
  const getChartData = (question: any) => {
    return question.options.map((option: any, index: number) => ({
      name: option.toString(),
      value: question.responses[index]
    }));
  };
  
  // Handle export data
  const handleExport = (format: string) => {
    toast({
      title: `Data exported as ${format.toUpperCase()}`,
      description: `Survey data has been exported in ${format.toUpperCase()} format successfully.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Survey Analysis</h2>
          <p className="text-muted-foreground">
            Analyze and visualize survey responses to extract valuable insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="1">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a survey" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Community Security Assessment</SelectItem>
              <SelectItem value="2">Youth Engagement Survey</SelectItem>
              <SelectItem value="3">Water Resource Management Survey</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {selectedSurvey && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{selectedSurvey.title}</CardTitle>
              <CardDescription>{selectedSurvey.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="text-2xl font-bold">{selectedSurvey.responses}</h3>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <MapPin className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="text-2xl font-bold">{selectedSurvey.regionsRepresented.length}</h3>
                  <p className="text-sm text-muted-foreground">Regions</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Clock className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="text-2xl font-bold">{selectedSurvey.questions.length}</h3>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="text-2xl font-bold">{new Date(selectedSurvey.createdAt).toLocaleDateString()}</h3>
                  <p className="text-sm text-muted-foreground">Date Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="responses">Question Analysis</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Overview</CardTitle>
                  <CardDescription>
                    Summary of all responses with key metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Response Distribution by Region</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={selectedSurvey.demographicData.regions}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Responses" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Gender Distribution</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={selectedSurvey.demographicData.gender}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {selectedSurvey.demographicData.gender.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Age Distribution</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedSurvey.demographicData.age}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" name="Respondents" fill="#10b981" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => handleExport('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="responses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis of responses for each question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {selectedSurvey.questions.map((question, index) => (
                      <div key={question.id} className="border-b pb-8 last:border-b-0">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium">Question {index + 1}: {question.text}</h3>
                            <p className="text-sm text-muted-foreground">
                              Type: {question.type.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Bar
                            </Button>
                            <Button variant="outline" size="sm">
                              <PieChartIcon className="h-4 w-4 mr-2" />
                              Pie
                            </Button>
                            <Button variant="outline" size="sm">
                              <TableIcon className="h-4 w-4 mr-2" />
                              Table
                            </Button>
                          </div>
                        </div>
                        
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={getChartData(question)}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Responses" fill={COLORS[index % COLORS.length]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="demographics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demographic Analysis</CardTitle>
                  <CardDescription>
                    Distribution of respondents by demographic factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Gender Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={selectedSurvey.demographicData.gender}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {selectedSurvey.demographicData.gender.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Gender</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedSurvey.demographicData.gender.map((item) => (
                                <TableRow key={item.name}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.value}</TableCell>
                                  <TableCell className="text-right">
                                    {((item.value / selectedSurvey.responses) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Age Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedSurvey.demographicData.age}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Respondents" fill="#10b981" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Age Group</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedSurvey.demographicData.age.map((item) => (
                                <TableRow key={item.name}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.value}</TableCell>
                                  <TableCell className="text-right">
                                    {((item.value / selectedSurvey.responses) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Regional Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedSurvey.demographicData.regions}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Respondents" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Region</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedSurvey.demographicData.regions.map((item) => (
                                <TableRow key={item.name}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.value}</TableCell>
                                  <TableCell className="text-right">
                                    {((item.value / selectedSurvey.responses) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    Important findings and trends identified from the survey data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Primary Findings</h3>
                      <ul className="space-y-3">
                        {selectedSurvey.keyInsights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="rounded-full bg-blue-100 text-blue-800 p-1 mr-3 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p>{insight}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Security Improvement</h4>
                          <p className="text-sm text-muted-foreground">
                            Increase security presence in North East regions where perception of security is lowest (avg. 2.4/5).
                          </p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Incident Reporting</h4>
                          <p className="text-sm text-muted-foreground">
                            Develop simplified reporting mechanisms to increase the percentage of people who consistently report incidents.
                          </p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Communal Conflict Mitigation</h4>
                          <p className="text-sm text-muted-foreground">
                            Implement targeted programs to address communal clashes, which were identified as the top security concern.
                          </p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Youth Engagement</h4>
                          <p className="text-sm text-muted-foreground">
                            Design security awareness programs specifically targeting the 25-34 age group, who reported lower security presence awareness.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Insights Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}