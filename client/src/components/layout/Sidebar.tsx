import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Database, 
  LineChart, 
  BarChart3, 
  Map, 
  Bell, 
  Workflow, 
  Folder, 
  Users, 
  Settings, 
  LogOut,
  X,
  ExternalLink,
  Link as LinkIcon,
  FileText,
  MessageCircle,
  Brain,
  MessageSquare,
  Phone,
  Send,
  Share2,
  Twitter,
  Facebook,
  Instagram,
  Video,
  MessageSquareDashed,
  Sparkles,
  Bot,
  Globe,
  Accessibility,
  Car
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Import the IPCR logo
import ipcr_logo from "@assets/Institute-For-Peace-And-Conflict-Resolution.jpg";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

export default function Sidebar({ isMobileMenuOpen, closeMobileMenu }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => location === path;

  // Define module groups for the sidebar
  const moduleGroups = [
    {
      title: "Main Navigation",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
        { path: "/map", label: "Nigeria Crisis Map", icon: <Map className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "AI Assistant",
      items: [
        { path: "/ai-analysis", label: "AI Analysis", icon: <Sparkles className="mr-3 h-5 w-5" /> },
        { path: "/ai-prediction", label: "Predictive Models", icon: <Bot className="mr-3 h-5 w-5" /> },
        { path: "/ai-advisor", label: "Response Advisor", icon: <Globe className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Data Collection & Processing",
      items: [
        { path: "/data-collection", label: "Data Collection", icon: <Database className="mr-3 h-5 w-5" /> },
        { path: "/data-processing", label: "Data Processing & Analysis", icon: <Brain className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Risk Assessment",
      items: [
        { path: "/analysis", label: "Risk Assessment", icon: <LineChart className="mr-3 h-5 w-5" /> },
        { path: "/visualization", label: "Visualization", icon: <Map className="mr-3 h-5 w-5" /> },
        { path: "/incident-analysis", label: "Incident Analysis", icon: <BarChart3 className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Incident Management",
      items: [
        { path: "/incidents-list", label: "View All Incidents", icon: <FileText className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Response Management",
      items: [
        { path: "/alerts", label: "Alerts & Notifications", icon: <Bell className="mr-3 h-5 w-5" /> },
        { path: "/alerts-list", label: "View All Alerts", icon: <ExternalLink className="mr-3 h-5 w-5" /> },
        { path: "/case-management", label: "Case Management", icon: <Folder className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Communications",
      items: [
        { path: "/sms", label: "SMS Management", icon: <MessageSquare className="mr-3 h-5 w-5" /> },
        { path: "/sms/compose", label: "Compose SMS", icon: <MessageSquareDashed className="mr-3 h-5 w-5" /> },
        { path: "/sms/templates", label: "SMS Templates", icon: <MessageCircle className="mr-3 h-5 w-5" /> },
        { path: "/sms/logs", label: "Messaging Logs", icon: <FileText className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Social Media",
      items: [
        { path: "/social-media", label: "Social Dashboard", icon: <Share2 className="mr-3 h-5 w-5" /> },
        { path: "/social-media/twitter", label: "X (Twitter)", icon: <Twitter className="mr-3 h-5 w-5" /> },
        { path: "/social-media/facebook", label: "Facebook", icon: <Facebook className="mr-3 h-5 w-5" /> },
        { path: "/social-media/instagram", label: "Instagram", icon: <Instagram className="mr-3 h-5 w-5" /> },
        { path: "/social-media/tiktok", label: "TikTok", icon: <Video className="mr-3 h-5 w-5" /> },
      ]
    },
    {
      title: "Administration",
      items: [
        { path: "/user-management", label: "User Management", icon: <Users className="mr-3 h-5 w-5" /> },
        { path: "/integrations", label: "Integrations", icon: <LinkIcon className="mr-3 h-5 w-5" /> },
        { path: "/reporting", label: "Reporting", icon: <FileText className="mr-3 h-5 w-5" /> },
        { path: "/accessibility", label: "Accessibility", icon: <Accessibility className="mr-3 h-5 w-5" /> },
        { path: "/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
      ]
    }
  ];
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Main Navigation": true,
    "AI Assistant": true,
    "Data Collection & Processing": true,
    "Risk Assessment": true,
    "Incident Management": true,
    "Response Management": true,
    "Communications": true,
    "Social Media": true,
    "Administration": true
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarClasses = `md:flex md:flex-shrink-0 transition-transform duration-300 fixed md:relative inset-y-0 left-0 z-50 transform ${
    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`;

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col w-64 border-r border-blue-100 bg-white h-full">
        {/* Logo and Header */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <img src={ipcr_logo} alt="IPCR Logo" className="h-10 w-10" />
              <span className="font-bold text-blue-600 text-lg ml-2">IPCR</span>
            </div>
            <button 
              className="md:hidden text-blue-500 hover:text-blue-700" 
              onClick={closeMobileMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 text-center">
            <h2 className="font-semibold text-blue-800">EWERS</h2>
            <p className="text-xs text-blue-600">Early Warning & Early Response</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="overflow-y-auto flex-grow">
          {moduleGroups.map((group) => (
            <div key={group.title} className="mb-3">
              <div 
                className="px-3 pt-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedGroups(prev => ({
                  ...prev,
                  [group.title]: !prev[group.title]
                }))}
              >
                <p className="px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                  {group.title}
                </p>
                <span className="text-xs text-blue-500">
                  {expandedGroups[group.title] ? '▼' : '▶'}
                </span>
              </div>
              
              {expandedGroups[group.title] && (
                <nav className="mt-2 px-2 space-y-1">
                  {group.items.map((item) => (
                    <Link key={item.path} href={item.path} onClick={closeMobileMenu}>
                      <div 
                        className={`flex items-center pl-4 py-2 pr-4 text-sm font-medium rounded-md ${
                          isActive(item.path)
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          ))}

          <div className="px-3 pt-6">
            <p className="px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider">
              External Links
            </p>
            <div className="mt-2 px-2 space-y-1">
              <a 
                href="https://ipcr.gov.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center pl-4 py-3 pr-4 font-medium rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                IPCR Website
              </a>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 border-t border-blue-100 p-4 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 text-white">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user?.fullName || user?.username}</p>
              <p className="text-xs font-medium text-blue-600">{user?.role || "Official"}</p>
            </div>
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
