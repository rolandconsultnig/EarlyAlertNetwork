import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlertsPageFixed() {
  return (
    <MainLayout title="Alerts">
      <Card>
        <CardHeader className="p-6 pb-2">
          <CardTitle>Alert Management</CardTitle>
          <CardDescription>
            Monitor and manage system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-neutral-500">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}