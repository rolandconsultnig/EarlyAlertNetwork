import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        closeMobileMenu={closeMobileMenu}
      />
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar 
          openMobileMenu={openMobileMenu} 
          title={title}
        />
        
        <main className="flex-1 p-6">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
