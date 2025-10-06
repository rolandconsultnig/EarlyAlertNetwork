import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

interface ChatLayoutProps {
  children: ReactNode;
  title: string;
}

export default function ChatLayout({ children, title }: ChatLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        isMobileMenuOpen={false} 
        closeMobileMenu={() => {}}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar 
          openMobileMenu={() => {}} 
          title={title}
        />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
