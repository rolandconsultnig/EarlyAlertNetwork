import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import DataCollectionPage from "@/pages/data-collection-page";
import DataProcessingPage from "@/pages/data-processing-page";
import AnalysisPage from "@/pages/analysis-page";
import RiskAssessmentPage from "@/pages/risk-assessment-page";
import VisualizationPage from "@/pages/visualization-page";
import AlertsPage from "@/pages/alerts-page";
import ResponsePlansPage from "@/pages/response-plans-page";
import CaseManagementPage from "@/pages/case-management-page";
import UserManagementPage from "@/pages/user-management-page";
import IntegrationsPage from "@/pages/integrations-page";
import ReportingPage from "@/pages/reporting-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      
      {/* Data Collection & Processing */}
      <ProtectedRoute path="/data-collection" component={DataCollectionPage} />
      <ProtectedRoute path="/data-processing" component={DataProcessingPage} />
      
      {/* Risk Assessment */}
      <ProtectedRoute path="/analysis" component={RiskAssessmentPage} />
      <ProtectedRoute path="/visualization" component={VisualizationPage} />
      
      {/* Response Management */}
      <ProtectedRoute path="/alerts" component={AlertsPage} />
      <ProtectedRoute path="/response-plans" component={ResponsePlansPage} />
      <ProtectedRoute path="/case-management" component={CaseManagementPage} />
      
      {/* Administration */}
      <ProtectedRoute path="/user-management" component={UserManagementPage} />
      <ProtectedRoute path="/integrations" component={IntegrationsPage} />
      <ProtectedRoute path="/reporting" component={ReportingPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
