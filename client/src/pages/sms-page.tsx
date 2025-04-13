import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Mock data for SMS logs
const mockLogs = [
  { id: 1, recipient: "+2348012345678", message: "Alert: Security situation deteriorating in Kaduna North. Avoid areas near...", status: "Delivered", timestamp: "2023-06-01 14:32:10" },
  { id: 2, recipient: "+2348023456789", message: "Update: Road closures in Abuja Central due to flooding. Seek alternative routes...", status: "Delivered", timestamp: "2023-06-01 13:27:45" },
  { id: 3, recipient: "+2348034567890", message: "Warning: Potential civil unrest reported in Lagos Island. Please stay indoors...", status: "Failed", timestamp: "2023-06-01 11:15:33" },
  { id: 4, recipient: "+2348045678901", message: "IPCR: Community dialogue session scheduled for tomorrow in Kano...", status: "Delivered", timestamp: "2023-06-01 10:02:18" },
  { id: 5, recipient: "+2348056789012", message: "Reminder: Submit security reports for Lagos South by end of day...", status: "Pending", timestamp: "2023-06-01 09:45:52" },
];

// Mock templates
const mockTemplates = [
  { id: 1, name: "Security Alert", content: "Alert: Security situation deteriorating in [LOCATION]. Avoid areas near [LANDMARK]. IPCR is monitoring the situation closely." },
  { id: 2, name: "Road Closure", content: "Update: Road closures in [LOCATION] due to [REASON]. Seek alternative routes via [ALTERNATIVE]. Expected to reopen at [TIME]." },
  { id: 3, name: "Civil Unrest", content: "Warning: Potential civil unrest reported in [LOCATION]. Please stay indoors and avoid [AREAS]. Contact [NUMBER] for emergency assistance." },
  { id: 4, name: "Community Meeting", content: "IPCR: Community dialogue session scheduled for [DATE] in [LOCATION] at [TIME]. Topic: [TOPIC]. Your participation is important." },
  { id: 5, name: "Report Reminder", content: "Reminder: Submit security reports for [REGION] by [DEADLINE]. Contact [NAME] at [NUMBER] for assistance." },
];

export default function SmsPage() {
  const { toast } = useToast();
  const [smsText, setSmsText] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedTab, setSelectedTab] = useState("compose");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
  
  const handleSelectTemplate = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
    setSmsText(template.content);
  };
  
  const handleSendSms = () => {
    if (!recipient || !smsText) {
      toast({
        title: "Missing Information",
        description: "Please provide both recipient phone number and message content.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "SMS Sent",
      description: `Your message has been sent to ${recipient}`,
    });
    
    // Reset the form
    setRecipient("");
    setSmsText("");
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">SMS Management</h1>
      
      <Tabs defaultValue="compose" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose SMS</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
        </TabsList>
        
        {/* Compose SMS Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Compose SMS
              </CardTitle>
              <CardDescription>
                Send SMS messages to individuals or groups for alerts, notifications and updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Phone Number</Label>
                <Input 
                  id="recipient" 
                  placeholder="+234 Phone Number" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Include country code (e.g., +234 for Nigeria)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Type your message here..." 
                  rows={5}
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className={smsText.length > 160 ? "text-red-500" : ""}>
                      {smsText.length} characters
                    </span>
                    {smsText.length > 160 && " (multiple SMS will be sent)"}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTab("templates")}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {setSmsText(""); setRecipient("");}}>
                Clear
              </Button>
              <Button onClick={handleSendSms}>
                <Send className="mr-2 h-4 w-4" /> Send SMS
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>
                Standard message templates for common scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="font-medium mb-1">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.content}</div>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template);
                          setSelectedTab("compose");
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedTab("compose")}
              >
                Return to Compose
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>SMS Logs</CardTitle>
              <CardDescription>
                History of sent messages and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of recent SMS messages sent through the system.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>
                        {log.status === "Delivered" && (
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {log.status}
                          </Badge>
                        )}
                        {log.status === "Failed" && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {log.status}
                          </Badge>
                        )}
                        {log.status === "Pending" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">
                            <Clock className="h-3 w-3 mr-1" />
                            {log.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}