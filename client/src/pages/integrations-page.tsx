import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, ChevronRight, Copy, Key, WebhookIcon, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";

const permissionOptions = [
  { id: "read", label: "Read Only" },
  { id: "write", label: "Read & Write" },
  { id: "*", label: "Full Access" },
];

const webhookEventOptions = [
  { id: "alert.created", label: "Alert Created" },
  { id: "alert.updated", label: "Alert Updated" },
  { id: "alert.resolved", label: "Alert Resolved" },
  { id: "incident.created", label: "Incident Created" },
  { id: "incident.updated", label: "Incident Updated" },
  { id: "incident.resolved", label: "Incident Resolved" },
  { id: "api.accessed", label: "API Accessed" },
  { id: "api.incidents.accessed", label: "Incidents API Accessed" },
  { id: "api.alerts.accessed", label: "Alerts API Accessed" },
];

function ApiKeyDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState("30");

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/integration/api-keys", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration/api-keys"] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your API key.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPermissions.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one permission.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    
    createApiKeyMutation.mutate({
      name,
      permissions: selectedPermissions,
      expiresAt: expiresAt.toISOString(),
    });
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">API Key Name</Label>
          <Input
            id="name"
            placeholder="My Application API Key"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Permissions</Label>
          <div className="grid gap-2">
            {permissionOptions.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={() => togglePermission(permission.id)}
                />
                <Label htmlFor={`permission-${permission.id}`}>{permission.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="expiry">Expires After</Label>
          <Select value={expiryDays} onValueChange={setExpiryDays}>
            <SelectTrigger>
              <SelectValue placeholder="Select an expiry period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={createApiKeyMutation.isPending}
          className="w-full"
        >
          {createApiKeyMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Key className="mr-2 h-4 w-4" />
          )}
          Create API Key
        </Button>
      </DialogFooter>
    </form>
  );
}

function ApiKeysList() {
  const [showNewKey, setShowNewKey] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  
  const { data: apiKeys, isPending, isError } = useQuery({
    queryKey: ["/api/integration/api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/integration/api-keys");
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
  });
  
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integration/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration/api-keys"] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to clipboard.",
    });
  };
  
  const handleDeleteKey = (id: number) => {
    if (window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      deleteApiKeyMutation.mutate(id);
    }
  };
  
  const isKeyExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };
  
  if (isPending) {
    return <div className="flex justify-center p-4">Loading API keys...</div>;
  }
  
  if (isError) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        <AlertTriangle className="mr-2 h-5 w-5" />
        Failed to load API keys
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your API Keys</h3>
        <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
          <DialogTrigger asChild>
            <Button>
              <Key className="mr-2 h-4 w-4" />
              Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access the application programmatically.
                Make sure to copy your API key, as it won't be shown again.
              </DialogDescription>
            </DialogHeader>
            <ApiKeyDialog onClose={() => setShowNewKey(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedKey && (
        <div className="mb-4 p-4 border rounded-md bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">New API Key Created</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedKey(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-2 text-sm">
            Please copy this API key now. You won't be able to see it again!
          </p>
          <div className="flex items-center mb-4">
            <code className="flex-1 p-2 bg-white border rounded text-sm overflow-x-auto">
              {selectedKey.key}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => handleCopyKey(selectedKey.key)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Add this header to your API requests:</p>
            <code className="p-1 bg-white border rounded">
              X-API-Key: {selectedKey.key}
            </code>
          </div>
        </div>
      )}
      
      {apiKeys?.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No API Keys Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first API key to enable programmatic access to the platform.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowNewKey(true)}
          >
            Create API Key
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys?.map((key: any) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    {Array.isArray(key.permissions) ? key.permissions.join(", ") : key.permissions}
                  </TableCell>
                  <TableCell>{formatDate(key.createdAt)}</TableCell>
                  <TableCell>{formatDate(key.expiresAt)}</TableCell>
                  <TableCell>
                    {key.status === "active" && !isKeyExpired(key.expiresAt) ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> 
                        {isKeyExpired(key.expiresAt) ? "Expired" : key.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleCopyKey(key.key)}
                    >
                      Copy ID
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function WebhookDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const createWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/integration/webhooks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration/webhooks"] });
      toast({
        title: "Webhook Created",
        description: "Your new webhook has been created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !url) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and URL for your webhook.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedEvents.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one event.",
        variant: "destructive",
      });
      return;
    }
    
    createWebhookMutation.mutate({
      name,
      url,
      events: selectedEvents,
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Webhook Name</Label>
          <Input
            id="name"
            placeholder="My Application Webhook"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="url">Webhook URL</Label>
          <Input
            id="url"
            placeholder="https://example.com/webhooks/endpoint"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            The URL that will receive webhook events via HTTP POST.
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label>Events</Label>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {webhookEventOptions.map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`event-${event.id}`}
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => toggleEvent(event.id)}
                />
                <Label htmlFor={`event-${event.id}`}>{event.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          type="submit"
          disabled={createWebhookMutation.isPending}
          className="w-full"
        >
          {createWebhookMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <WebhookIcon className="mr-2 h-4 w-4" />
          )}
          Create Webhook
        </Button>
      </DialogFooter>
    </form>
  );
}

function WebhooksList() {
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  
  const { data: webhooks, isPending, isError } = useQuery({
    queryKey: ["/api/integration/webhooks"],
    queryFn: async () => {
      const res = await fetch("/api/integration/webhooks");
      if (!res.ok) throw new Error("Failed to fetch webhooks");
      return res.json();
    },
  });
  
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integration/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integration/webhooks"] });
      toast({
        title: "Webhook Deleted",
        description: "The webhook has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteWebhook = (id: number) => {
    if (window.confirm("Are you sure you want to delete this webhook? This action cannot be undone.")) {
      deleteWebhookMutation.mutate(id);
    }
  };
  
  if (isPending) {
    return <div className="flex justify-center p-4">Loading webhooks...</div>;
  }
  
  if (isError) {
    return (
      <div className="flex justify-center p-4 text-red-500">
        <AlertTriangle className="mr-2 h-5 w-5" />
        Failed to load webhooks
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Webhooks</h3>
        <Dialog open={showNewWebhook} onOpenChange={setShowNewWebhook}>
          <DialogTrigger asChild>
            <Button>
              <WebhookIcon className="mr-2 h-4 w-4" />
              Create New Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Create a new webhook to receive real-time notifications about events in the system.
              </DialogDescription>
            </DialogHeader>
            <WebhookDialog onClose={() => setShowNewWebhook(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {webhooks?.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <WebhookIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Webhooks Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up webhooks to receive real-time notifications for events in the platform.
          </p>
          <Button
            variant="outline"
            onClick={() => setShowNewWebhook(true)}
          >
            Create Webhook
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks?.map((webhook: any) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <div className="flex items-center">
                      {webhook.url}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-5 w-5 p-0"
                        onClick={() => window.open(webhook.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="max-h-12 overflow-y-auto text-xs">
                      {Array.isArray(webhook.events) ? (
                        webhook.events.map((event: string) => (
                          <div key={event} className="mb-1 last:mb-0">
                            <span className="inline-block px-2 py-1 bg-blue-100 rounded text-blue-800">
                              {event}
                            </span>
                          </div>
                        ))
                      ) : (
                        webhook.events
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {webhook.status === "active" ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> {webhook.status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function DocumentationSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">API Usage Guide</h3>
        <div className="prose max-w-none">
          <p>
            This API allows you to programmatically access data from the Early Warning & Early Response System. 
            Below are instructions on how to authenticate and use the available endpoints.
          </p>
          
          <h4>Authentication</h4>
          <p>
            All API requests require an API key to be included in the request headers:
          </p>
          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
            <code>X-API-Key: your_api_key_here</code>
          </pre>
          
          <h4>Available Endpoints</h4>
          <ul>
            <li>
              <strong>GET /api/external/incidents</strong> - Retrieve all incidents
            </li>
            <li>
              <strong>GET /api/external/alerts</strong> - Retrieve all alerts
            </li>
          </ul>
          
          <h4>Response Format</h4>
          <p>
            All responses are returned in JSON format.
          </p>
          
          <h4>Error Handling</h4>
          <p>
            The API uses standard HTTP status codes to indicate success or failure:
          </p>
          <ul>
            <li><strong>200 OK</strong> - Request succeeded</li>
            <li><strong>400 Bad Request</strong> - Invalid request</li>
            <li><strong>401 Unauthorized</strong> - Missing or invalid API key</li>
            <li><strong>403 Forbidden</strong> - API key doesn't have required permissions</li>
            <li><strong>404 Not Found</strong> - Resource not found</li>
            <li><strong>500 Server Error</strong> - Server-side error</li>
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Webhook Guide</h3>
        <div className="prose max-w-none">
          <p>
            Webhooks allow you to receive real-time notifications when events occur in the system.
          </p>
          
          <h4>Webhook Format</h4>
          <p>
            When an event occurs that matches your webhook configuration, our system will send an HTTP POST request to your webhook URL with a JSON payload.
          </p>
          
          <p>Example payload:</p>
          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
{`{
  "event": "alert.created",
  "timestamp": "2025-04-14T12:34:56Z",
  "data": {
    "id": 123,
    "title": "New Crisis Alert",
    "severity": "high",
    "location": "Maiduguri, Borno State",
    "description": "Civil unrest reported..."
  }
}`}
          </pre>
          
          <h4>Webhook Headers</h4>
          <p>
            Each webhook request includes the following headers:
          </p>
          <ul>
            <li><strong>X-EWERS-Webhook-Event</strong> - The event type that triggered the webhook</li>
            <li><strong>X-EWERS-Webhook-Signature</strong> - A HMAC SHA-256 signature of the request body</li>
            <li><strong>X-EWERS-Webhook-Timestamp</strong> - The timestamp when the event was triggered</li>
          </ul>
          
          <h4>Verifying Webhook Signatures</h4>
          <p>
            To verify that a webhook request came from our system, you should compute an HMAC SHA-256 signature using your webhook secret and compare it with the X-EWERS-Webhook-Signature header.
          </p>
          
          <h4>Best Practices</h4>
          <ul>
            <li>Respond to webhook requests quickly (under 5 seconds)</li>
            <li>Implement retry logic in case of failures</li>
            <li>Verify webhook signatures to ensure security</li>
            <li>Process webhook events asynchronously</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Access & Webhooks</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys and configure webhooks for system integration
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Create and manage API keys for programmatic access to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications about system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhooksList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhook Documentation</CardTitle>
              <CardDescription>
                Learn how to integrate with our system using APIs and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentationSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}