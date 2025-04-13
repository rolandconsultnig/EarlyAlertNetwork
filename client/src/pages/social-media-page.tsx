import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Video, 
  Send, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  BarChart4, 
  Upload, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for social media analytics
const mockAnalytics = {
  twitter: {
    followers: 12468,
    engagement: 3.2,
    retweets: 245,
    likes: 1897,
    impressions: 45600
  },
  facebook: {
    followers: 28750,
    engagement: 4.1,
    shares: 187,
    likes: 3456,
    impressions: 62300
  },
  instagram: {
    followers: 18924,
    engagement: 5.7,
    likes: 4532,
    comments: 876,
    impressions: 38900
  },
  tiktok: {
    followers: 8750,
    engagement: 7.2,
    likes: 6754,
    shares: 1245,
    views: 87600
  }
};

// Mock data for previous posts
const mockPosts = [
  { 
    id: 1, 
    platform: "Twitter", 
    content: "IPCR is monitoring the situation in Northern Nigeria. Stay tuned for updates on our peace initiatives.", 
    status: "Published",
    engagement: 248,
    publishDate: "2023-06-01 14:32" 
  },
  { 
    id: 2, 
    platform: "Facebook", 
    content: "Today marks the successful completion of our community dialogue program in Kaduna. Over 300 community leaders participated in this important peace-building initiative.", 
    status: "Published",
    engagement: 423,
    publishDate: "2023-05-30 10:15" 
  },
  { 
    id: 3, 
    platform: "Instagram", 
    content: "Images from our recent conflict resolution workshop in Lagos. Swipe to see more moments from this impactful event! #PeaceBuilding #Nigeria", 
    status: "Published",
    engagement: 512,
    publishDate: "2023-05-28 16:45" 
  },
  { 
    id: 4, 
    platform: "TikTok", 
    content: "Watch how our early warning systems help prevent conflicts before they start. #IPCR #ConflictPrevention", 
    status: "Published",
    engagement: 1875,
    publishDate: "2023-05-27 12:30" 
  },
  { 
    id: 5, 
    platform: "Twitter", 
    content: "New report alert! Our analysis of conflict trends in Nigeria's Middle Belt region is now available. Download from our website.", 
    status: "Scheduled",
    engagement: 0,
    publishDate: "2023-06-03 09:00" 
  }
];

export default function SocialMediaPage() {
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [postLink, setPostLink] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("compose");
  
  // Get the current path to determine which platform to focus on
  const location = window.location.pathname;
  
  // Set the proper platform based on URL path
  useState(() => {
    // Initialize platforms array with the one from the URL if applicable
    if (location.includes("/twitter")) {
      setSelectedPlatforms(["Twitter"]);
    } else if (location.includes("/facebook")) {
      setSelectedPlatforms(["Facebook"]);
    } else if (location.includes("/instagram")) {
      setSelectedPlatforms(["Instagram"]);
    } else if (location.includes("/tiktok")) {
      setSelectedPlatforms(["TikTok"]);
    }
    
    // Set the active tab to analytics if we're on a specific platform page
    if (location !== "/social-media") {
      setActiveTab("analytics");
    }
  });
  
  const handlePlatformToggle = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };
  
  const handlePost = () => {
    if (!postContent) {
      toast({
        title: "Missing Content",
        description: "Please add content to your post.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platform Selected",
        description: "Please select at least one social media platform.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Post Submitted",
      description: `Your content will be posted to ${selectedPlatforms.join(", ")}`,
    });
    
    // Reset form
    setPostContent("");
    setPostLink("");
    setSelectedPlatforms([]);
    setMediaFile(null);
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Twitter className="h-4 w-4 mr-1" />;
      case "Facebook":
        return <Facebook className="h-4 w-4 mr-1" />;
      case "Instagram":
        return <Instagram className="h-4 w-4 mr-1" />;
      case "TikTok":
        return <Video className="h-4 w-4 mr-1" />;
      default:
        return <Share2 className="h-4 w-4 mr-1" />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Published":
        return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
      case "Scheduled":
        return <Clock className="h-4 w-4 mr-1 text-orange-600" />;
      case "Failed":
        return <AlertCircle className="h-4 w-4 mr-1 text-red-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Social Media Dashboard</h1>
      
      <Tabs defaultValue="compose" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose Post</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="posts">Previous Posts</TabsTrigger>
        </TabsList>
        
        {/* Compose Post Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Compose Social Media Post
              </CardTitle>
              <CardDescription>
                Create and publish content across multiple social media platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platforms">Select Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedPlatforms.includes("Twitter") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePlatformToggle("Twitter")}
                    className={selectedPlatforms.includes("Twitter") ? "bg-blue-500" : ""}
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    X (Twitter)
                  </Button>
                  <Button 
                    variant={selectedPlatforms.includes("Facebook") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePlatformToggle("Facebook")}
                    className={selectedPlatforms.includes("Facebook") ? "bg-blue-700" : ""}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button 
                    variant={selectedPlatforms.includes("Instagram") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePlatformToggle("Instagram")}
                    className={selectedPlatforms.includes("Instagram") ? "bg-purple-600" : ""}
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagram
                  </Button>
                  <Button 
                    variant={selectedPlatforms.includes("TikTok") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePlatformToggle("TikTok")}
                    className={selectedPlatforms.includes("TikTok") ? "bg-black" : ""}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    TikTok
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="What would you like to share?" 
                  rows={5}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className={postContent.length > 280 ? "text-red-500" : ""}>
                      {postContent.length} characters
                    </span>
                    {postContent.length > 280 && " (exceeds Twitter limit)"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Add Link (Optional)</Label>
                <Input 
                  id="link" 
                  placeholder="https://example.com" 
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="media">Upload Media (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("media-upload")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <input 
                    id="media-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  {mediaFile && (
                    <p className="text-sm">
                      {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPostContent("");
                  setPostLink("");
                  setSelectedPlatforms([]);
                  setMediaFile(null);
                }}
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button onClick={handlePost}>
                  <Send className="mr-2 h-4 w-4" /> Post Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Twitter className="mr-2 h-5 w-5 text-blue-500" />
                  X (Twitter) Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">{mockAnalytics.twitter.followers.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{mockAnalytics.twitter.engagement}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Retweets</p>
                    <p className="text-xl font-semibold">{mockAnalytics.twitter.retweets}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-xl font-semibold">{mockAnalytics.twitter.likes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Facebook className="mr-2 h-5 w-5 text-blue-700" />
                  Facebook Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Page Followers</p>
                    <p className="text-2xl font-bold">{mockAnalytics.facebook.followers.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{mockAnalytics.facebook.engagement}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Shares</p>
                    <p className="text-xl font-semibold">{mockAnalytics.facebook.shares}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-xl font-semibold">{mockAnalytics.facebook.likes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Instagram className="mr-2 h-5 w-5 text-purple-600" />
                  Instagram Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">{mockAnalytics.instagram.followers.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{mockAnalytics.instagram.engagement}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-xl font-semibold">{mockAnalytics.instagram.likes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="text-xl font-semibold">{mockAnalytics.instagram.comments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  TikTok Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">{mockAnalytics.tiktok.followers.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">{mockAnalytics.tiktok.engagement}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-xl font-semibold">{mockAnalytics.tiktok.likes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="text-xl font-semibold">{mockAnalytics.tiktok.views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 className="mr-2 h-5 w-5" />
                Overall Performance
              </CardTitle>
              <CardDescription>
                Comparison of engagement across platforms over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-lg bg-gray-50">
                <p className="text-muted-foreground">Analytics visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Previous Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Previous Posts</CardTitle>
              <CardDescription>
                Review and analyze your social media content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your recent social media posts.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center w-fit">
                          {getPlatformIcon(post.platform)}
                          {post.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(post.status)}
                          {post.status}
                        </div>
                      </TableCell>
                      <TableCell>{post.engagement}</TableCell>
                      <TableCell>{post.publishDate}</TableCell>
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