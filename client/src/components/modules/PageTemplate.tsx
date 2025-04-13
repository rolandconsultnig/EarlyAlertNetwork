import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageTemplateProps {
  title: string;
  description: string;
  children: ReactNode;
  toolbar?: ReactNode;
}

export default function PageTemplate({ 
  title, 
  description, 
  children, 
  toolbar 
}: PageTemplateProps) {
  return (
    <MainLayout title={title}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {toolbar && (
          <div className="flex gap-2">
            {toolbar}
          </div>
        )}
      </div>
      
      {children}
    </MainLayout>
  );
}