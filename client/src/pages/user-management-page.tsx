import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw,
  Shield,
  UserCog,
  Key,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Create a schema for the user creation form
const userFormSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    fullName: true,
    role: true,
    securityLevel: true,
    permissions: true,
    department: true,
    position: true,
    phoneNumber: true,
    email: true,
  })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    securityLevel: z.coerce.number().min(1).max(7).default(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserManagementPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Fetch users
  const { 
    data: users, 
    isLoading: isLoadingUsers, 
    error: usersError,
    refetch: refetchUsers 
  } = useQuery<User[]>({
    queryKey: ["/api/user/all"]
  });
  
  // Create form using react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "user",
      securityLevel: 1,
      department: "",
      position: "",
      phoneNumber: "",
      email: "",
    },
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const { confirmPassword, ...userData } = data;
      
      // Use the new endpoint for creating users when authenticated
      const res = await apiRequest("POST", "/api/user/create", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/all"] });
      toast({
        title: "User Created",
        description: "The user has been created successfully.",
      });
      form.reset();
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(data: UserFormValues) {
    createUserMutation.mutate(data);
  }
  
  // Filter users based on search query and role filter
  const filteredUsers = users?.filter(user => {
    // Apply role filter
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    
    // Apply search filter if search query exists
    const searchMatch = !searchQuery || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return roleMatch && searchMatch;
  });
  
  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary/10 text-primary">Admin</Badge>;
      case "coordinator":
        return <Badge className="bg-green-100 text-green-800">Coordinator</Badge>;
      case "analyst":
        return <Badge className="bg-blue-100 text-blue-800">Analyst</Badge>;
      case "field_agent":
        return <Badge className="bg-amber-100 text-amber-800">Field Agent</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-800">User</Badge>;
    }
  };

  return (
    <MainLayout title="User Management">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs defaultValue="all" className="w-auto">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setRoleFilter("all")}
              >
                All Users
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                onClick={() => setRoleFilter("admin")}
              >
                Admins
              </TabsTrigger>
              <TabsTrigger 
                value="coordinator" 
                onClick={() => setRoleFilter("coordinator")}
              >
                Coordinators
              </TabsTrigger>
              <TabsTrigger 
                value="analyst" 
                onClick={() => setRoleFilter("analyst")}
              >
                Analysts
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search users..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            Manage system users and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading users...</p>
            </div>
          ) : usersError ? (
            <div className="text-center py-8 text-red-500">
              <Shield className="h-8 w-8 mx-auto mb-4" />
              <p>Failed to load users. Please try again.</p>
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback className="bg-primary text-white">
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-4 text-neutral-400" />
              <p className="text-neutral-500">No users found</p>
              <p className="text-neutral-400 text-sm mt-1">
                {searchQuery ? "Try adjusting your search or filters" : "Add users to the system"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Overview</CardTitle>
            <CardDescription>System roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Administrator</p>
                    <p className="text-sm text-neutral-500">Full system access</p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {users?.filter(u => u.role === "admin").length || 0} users
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Response Coordinator</p>
                    <p className="text-sm text-neutral-500">Manages response activities</p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {users?.filter(u => u.role === "coordinator").length || 0} users
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Data Analyst</p>
                    <p className="text-sm text-neutral-500">Analyzes risk indicators</p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {users?.filter(u => u.role === "analyst").length || 0} users
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 text-amber-600 mr-3" />
                  <div>
                    <p className="font-medium">Field Agent</p>
                    <p className="text-sm text-neutral-500">Collects field data</p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {users?.filter(u => u.role === "field_agent").length || 0} users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Module-level permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-md p-3">
                <h3 className="font-medium mb-2">Data Collection Module</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Administrator</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinator</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Analyst</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Field Agent</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="border border-neutral-200 rounded-md p-3">
                <h3 className="font-medium mb-2">Alert Generation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Administrator</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Coordinator</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Analyst</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Field Agent</span>
                    <span>—</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Configure Role Permissions
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      SA
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">System Administrator</p>
                  <p className="text-xs text-neutral-500">Created a new alert</p>
                  <p className="text-xs text-neutral-400 mt-1">10 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-600 text-white text-xs">
                      RC
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">Response Coordinator</p>
                  <p className="text-xs text-neutral-500">Updated response activity</p>
                  <p className="text-xs text-neutral-400 mt-1">30 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      DA
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">Data Analyst</p>
                  <p className="text-xs text-neutral-500">Generated risk report</p>
                  <p className="text-xs text-neutral-400 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-600 text-white text-xs">
                      FA
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">Field Agent</p>
                  <p className="text-xs text-neutral-500">Submitted incident report</p>
                  <p className="text-xs text-neutral-400 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Full Activity Log
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="coordinator">Response Coordinator</SelectItem>
                          <SelectItem value="analyst">Data Analyst</SelectItem>
                          <SelectItem value="field_agent">Field Agent</SelectItem>
                          <SelectItem value="user">Standard User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines the user's permissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="securityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Clearance Level</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString() || "1"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clearance level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Level 1 - Basic</SelectItem>
                          <SelectItem value="2">Level 2 - Low</SelectItem>
                          <SelectItem value="3">Level 3 - Medium</SelectItem>
                          <SelectItem value="4">Level 4 - High</SelectItem>
                          <SelectItem value="5">Level 5 - Very High</SelectItem>
                          <SelectItem value="6">Level 6 - Extreme</SelectItem>
                          <SelectItem value="7">Level 7 - Maximum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines access to sensitive information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
