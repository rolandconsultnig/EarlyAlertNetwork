import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ColorPaletteSelector from "@/components/settings/ColorPaletteSelector";
import { 
  Settings, 
  User, 
  Bell, 
  Mail, 
  Phone,
  Lock, 
  Key, 
  Globe, 
  Map, 
  Database, 
  Shield, 
  Clock, 
  Save, 
  Trash2,
  CheckCircle,
  UserCog,
  RefreshCw,
  Smartphone,
  Radio,
  Palette,
  Info,
  TrendingUp,
  ClipboardCheck
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailAlerts: z.boolean().default(true),
  dashboardAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  radioAlerts: z.boolean().default(false),
  alertThreshold: z.number().min(0).max(100).default(50),
});

const systemSettingsSchema = z.object({
  language: z.string().default("en"),
  theme: z.string().default("light"),
  dataRetention: z.string().default("30"),
  mapProvider: z.string().default("leaflet"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationValues = z.infer<typeof notificationSchema>;
type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: "user@example.com", // This would come from the user record in a real app
      phoneNumber: "",
    },
  });
  
  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification settings form
  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailAlerts: true,
      dashboardAlerts: true,
      smsAlerts: false,
      radioAlerts: false,
      alertThreshold: 50,
    },
  });
  
  // System settings form
  const systemSettingsForm = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      language: "en",
      theme: "light",
      dataRetention: "30",
      mapProvider: "leaflet",
    },
  });
  
  // Dummy mutation for saving profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Dummy mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      return await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Dummy mutation for notification settings
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationValues) => {
      return await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Dummy mutation for system settings
  const saveSystemSettingsMutation = useMutation({
    mutationFn: async (data: SystemSettingsValues) => {
      return await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "System Settings Saved",
        description: "System settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    saveProfileMutation.mutate(data);
  };
  
  const onSecuritySubmit = (data: SecurityFormValues) => {
    changePasswordMutation.mutate(data);
  };
  
  const onNotificationSubmit = (data: NotificationValues) => {
    saveNotificationSettingsMutation.mutate(data);
  };
  
  const onSystemSettingsSubmit = (data: SystemSettingsValues) => {
    saveSystemSettingsMutation.mutate(data);
  };

  return (
    <MainLayout title="Settings">
      <div className="container max-w-6xl mx-auto pb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="pt-6">
                <Tabs 
                  defaultValue="profile" 
                  orientation="vertical" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="flex flex-col h-auto items-stretch">
                    <TabsTrigger value="profile" className="justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="system" className="justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      System
                    </TabsTrigger>
                    <TabsTrigger value="about" className="justify-start">
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Separator className="my-4" />
                
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">System Status</p>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-sm text-neutral-600">All systems operational</p>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">Last checked: 5 minutes ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormDescription>
                              This email will be used for system notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormDescription>
                              For SMS alerts and notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          disabled={saveProfileMutation.isPending}
                        >
                          {saveProfileMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your current password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 6 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  <Separator className="my-8" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Security</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-neutral-500">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Session Management</p>
                          <p className="text-sm text-neutral-500">
                            Manage active login sessions
                          </p>
                        </div>
                        <Button variant="outline">Manage</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">API Access</p>
                          <p className="text-sm text-neutral-500">
                            Manage API keys and access tokens
                          </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Alert Channels</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="emailAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center">
                                  <Mail className="mr-2 h-5 w-5 text-primary" />
                                  Email Notifications
                                </FormLabel>
                                <FormDescription>
                                  Receive alerts via email
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
                          control={notificationForm.control}
                          name="dashboardAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center">
                                  <Bell className="mr-2 h-5 w-5 text-primary" />
                                  Dashboard Alerts
                                </FormLabel>
                                <FormDescription>
                                  Show alerts in the dashboard
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
                          control={notificationForm.control}
                          name="smsAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center">
                                  <Smartphone className="mr-2 h-5 w-5 text-primary" />
                                  SMS Notifications
                                </FormLabel>
                                <FormDescription>
                                  Receive alerts via SMS
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
                          control={notificationForm.control}
                          name="radioAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center">
                                  <Radio className="mr-2 h-5 w-5 text-primary" />
                                  Radio Broadcasts
                                </FormLabel>
                                <FormDescription>
                                  Emergency radio alerts
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
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Alert Preferences</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="alertThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Threshold</FormLabel>
                              <FormControl>
                                <div className="pt-2">
                                  <Slider
                                    defaultValue={[field.value]}
                                    max={100}
                                    step={1}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                  />
                                </div>
                              </FormControl>
                              <div className="flex justify-between">
                                <FormDescription>
                                  Low threshold (more alerts)
                                </FormDescription>
                                <FormDescription>
                                  High threshold (fewer alerts)
                                </FormDescription>
                              </div>
                              <FormDescription className="text-center">
                                Current value: {field.value}%
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          disabled={saveNotificationSettingsMutation.isPending}
                        >
                          {saveNotificationSettingsMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Notification Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "system" && (
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure global system preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...systemSettingsForm}>
                    <form onSubmit={systemSettingsForm.handleSubmit(onSystemSettingsSubmit)} className="space-y-6">
                      <FormField
                        control={systemSettingsForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The language used throughout the system interface
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interface Theme</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System Default</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose the application's visual appearance
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="py-5">
                        <Separator />
                        <h3 className="text-lg font-medium flex items-center mt-5 mb-3">
                          <Palette className="mr-2 h-5 w-5 text-primary" />
                          Accessibility Color Settings
                        </h3>
                        <p className="text-sm text-muted-foreground mb-5">
                          Choose a color scheme that best fits your accessibility needs and preferences
                        </p>
                        <ColorPaletteSelector 
                          onPaletteChange={(palette) => {
                            toast({
                              title: "Color palette updated",
                              description: `Changed to '${palette.name}' color scheme`,
                              variant: "default",
                            });
                          }}
                        />
                      </div>

                      <Separator className="my-5" />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="dataRetention"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Retention Period (days)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select retention period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How long historical data is kept in the system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemSettingsForm.control}
                        name="mapProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Map Provider</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select map provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="leaflet">Leaflet (OpenStreetMap)</SelectItem>
                                <SelectItem value="google">Google Maps</SelectItem>
                                <SelectItem value="mapbox">Mapbox</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Provider for the geographic visualization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          disabled={saveSystemSettingsMutation.isPending}
                        >
                          {saveSystemSettingsMutation.isPending ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save System Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  <Separator className="my-8" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Maintenance</h3>
                    
                    <div className="space-y-4">
                      <Alert>
                        <Database className="h-4 w-4" />
                        <AlertTitle>Database Operations</AlertTitle>
                        <AlertDescription>
                          These actions affect system data and should be used with caution.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Cache
                        </Button>
                        <Button variant="outline" size="sm">
                          <Database className="mr-2 h-4 w-4" />
                          Export Data
                        </Button>
                        <Button variant="outline" size="sm">
                          <Database className="mr-2 h-4 w-4" />
                          Import Data
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear All Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "about" && (
              <Card>
                <CardHeader>
                  <CardTitle>About System</CardTitle>
                  <CardDescription>Information about the Early Warning & Early Response System</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">System Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Version</span>
                        <span className="font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Build Date</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">License</span>
                        <span className="font-medium">MIT</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center mb-2">
                          <Database className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Data Collection</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Collects data from multiple sources
                        </p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Analysis</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Processes and analyzes collected data
                        </p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center mb-2">
                          <Bell className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Alerts</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Manages risk alerts and notifications
                        </p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center mb-2">
                          <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">Response</h4>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Coordinates response activities
                        </p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Support</h3>
                    <p className="text-neutral-600 mb-4">
                      For technical support or questions about the system, please contact:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-2" />
                        <span>support@ewers-system.com</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-primary mr-2" />
                        <span>https://ewers-system.com/support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Check for Updates
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Use the imported Info icon from lucide-react instead
