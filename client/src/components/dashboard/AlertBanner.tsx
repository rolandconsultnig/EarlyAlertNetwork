import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  title: string;
  description: string;
  onClose: () => void;
  onViewDetails: () => void;
}

export default function AlertBanner({ title, description, onClose, onViewDetails }: AlertBannerProps) {
  return (
    <Alert className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start">
      <AlertTriangle className="text-amber-500 text-xl mr-3 h-5 w-5" />
      <div className="flex-1">
        <AlertTitle className="font-medium text-neutral-900">{title}</AlertTitle>
        <AlertDescription className="text-sm text-neutral-600">{description}</AlertDescription>
      </div>
      <div className="flex items-center space-x-2">
        <Button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md" onClick={onViewDetails}>
          View Details
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5 text-neutral-500 hover:text-neutral-700" />
        </Button>
      </div>
    </Alert>
  );
}
