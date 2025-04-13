import { useState } from "react";
import { Search, Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TopbarProps {
  openMobileMenu: () => void;
  title: string;
}

export default function Topbar({ openMobileMenu, title }: TopbarProps) {
  const { user } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true);
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            onClick={openMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold text-neutral-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 relative">
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-secondary border-2 border-white"></span>
              )}
            </Button>
          </div>
          <div className="md:hidden">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
