import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Radar, 
  LayoutDashboard, 
  TextCursorInput, 
  TrendingUp, 
  Bell, 
  ClipboardCheck, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

export default function Sidebar({ isMobileMenuOpen, closeMobileMenu }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 text-xl" /> },
    { path: "/data-collection", label: "Data Collection", icon: <TextCursorInput className="mr-3 text-xl" /> },
    { path: "/analysis", label: "Analysis", icon: <TrendingUp className="mr-3 text-xl" /> },
    { path: "/alerts", label: "Alerts", icon: <Bell className="mr-3 text-xl" /> },
    { path: "/response-plans", label: "Response Plans", icon: <ClipboardCheck className="mr-3 text-xl" /> },
    { path: "/user-management", label: "User Management", icon: <Users className="mr-3 text-xl" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="mr-3 text-xl" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarClasses = `md:flex md:flex-shrink-0 transition-transform duration-300 fixed md:relative inset-y-0 left-0 z-50 transform ${
    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  }`;

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col w-64 border-r border-neutral-200 bg-white h-full">
        <div className="flex items-center h-16 px-4 border-b border-neutral-200">
          <div className="flex items-center">
            <Radar className="text-primary text-2xl mr-2" />
            <span className="font-semibold text-lg">EWERS</span>
          </div>
          <button 
            className="md:hidden ml-auto text-neutral-500 hover:text-neutral-700" 
            onClick={closeMobileMenu}
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          <nav className="mt-2 px-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={closeMobileMenu}>
                <a 
                  className={`flex items-center pl-4 py-3 pr-4 font-medium rounded-md ${
                    isActive(item.path)
                      ? "border-l-4 border-primary bg-primary/5 text-primary"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 border-t border-neutral-200 p-4">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">{user?.fullName || user?.username}</p>
              <p className="text-xs font-medium text-neutral-500">{user?.role || "User"}</p>
            </div>
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5 text-neutral-500 hover:text-neutral-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
