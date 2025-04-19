import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page-new-fixed";
import DataCollectionPage from "@/pages/data-collection-page";
import DataProcessingPage from "@/pages/data-processing-page";
import AnalysisPage from "@/pages/analysis-page";
import RiskAssessmentPage from "@/pages/risk-assessment-page";
import VisualizationPage from "@/pages/visualization-page";
import AlertsPage from "@/pages/alerts-page-new";
import CaseManagementPage from "@/pages/case-management-page";
import UserManagementPage from "@/pages/user-management-page";
import IntegrationsPage from "@/pages/integrations-page";
import ReportingPage from "@/pages/reporting-page";
import SettingsPage from "@/pages/settings-page";
import SmsPage from "@/pages/sms-page";
import SocialMediaPage from "@/pages/social-media-page";
import AiAnalysisPage from "@/pages/ai-analysis-page";
import AiPredictionPage from "@/pages/ai-prediction-page";
import ReportIncidentPage from "@/pages/report-incident-page";
import MapPage from "@/pages/map-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/report-incident" component={ReportIncidentPage} />
      <Route path="/map" component={MapPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      
      {/* Data Collection & Processing */}
      <ProtectedRoute path="/data-collection" component={DataCollectionPage} />
      <ProtectedRoute path="/data-processing" component={DataProcessingPage} />
      
      {/* AI Assistant */}
      <ProtectedRoute path="/ai-analysis" component={AiAnalysisPage} />
      <ProtectedRoute path="/ai-prediction" component={AiPredictionPage} />
      <ProtectedRoute path="/ai-advisor" component={AiAnalysisPage} />
      
      {/* Risk Assessment */}
      <ProtectedRoute path="/analysis" component={RiskAssessmentPage} />
      <ProtectedRoute path="/visualization" component={VisualizationPage} />
      
      {/* Response Management */}
      <ProtectedRoute path="/alerts" component={AlertsPage} />
      <ProtectedRoute path="/case-management" component={CaseManagementPage} />
      
      {/* Communications - SMS Management */}
      <ProtectedRoute path="/sms" component={SmsPage} />
      <ProtectedRoute path="/sms/compose" component={SmsPage} />
      <ProtectedRoute path="/sms/templates" component={SmsPage} />
      <ProtectedRoute path="/sms/logs" component={SmsPage} />
      
      {/* Social Media */}
      <ProtectedRoute path="/social-media" component={SocialMediaPage} />
      <ProtectedRoute path="/social-media/twitter" component={SocialMediaPage} />
      <ProtectedRoute path="/social-media/facebook" component={SocialMediaPage} />
      <ProtectedRoute path="/social-media/instagram" component={SocialMediaPage} />
      <ProtectedRoute path="/social-media/tiktok" component={SocialMediaPage} />
      
      {/* Administration */}
      <ProtectedRoute path="/user-management" component={UserManagementPage} />
      <ProtectedRoute path="/integrations" component={IntegrationsPage} allowPublicAccess={true} />
      <ProtectedRoute path="/reporting" component={ReportingPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div>
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
