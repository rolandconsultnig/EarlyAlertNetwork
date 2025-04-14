import React from "react";
import { AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ErrorMessageProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  troubleshootingTips?: string[];
  onRetry?: () => void;
  variant?: "inline" | "card" | "alert";
  severity?: "error" | "warning" | "info";
  className?: string;
}

export function ErrorMessage({
  title = "An error occurred",
  description = "We encountered a problem while processing your request.",
  error,
  troubleshootingTips = [],
  onRetry,
  variant = "inline",
  severity = "error",
  className = "",
}: ErrorMessageProps) {
  const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : null;
  
  // Set default troubleshooting tips if none provided
  const tips = troubleshootingTips.length > 0 
    ? troubleshootingTips 
    : [
        "Check your internet connection and try again.",
        "Refresh the page to get the latest data.",
        "Try logging out and logging back in.",
        "If the problem persists, contact our support team."
      ];

  // Set icon and color based on severity
  const getIconAndColor = () => {
    switch (severity) {
      case "error":
        return { 
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700"
        };
      case "warning":
        return { 
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-700"
        };
      case "info":
        return { 
          icon: <Info className="h-6 w-6 text-blue-500" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700"
        };
      default:
        return { 
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700"
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getIconAndColor();

  // Render different variants
  if (variant === "card") {
    return (
      <Card className={`${className} ${borderColor} border-2 shadow-sm`}>
        <CardHeader className={`${bgColor} pb-2`}>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className={textColor}>{title}</CardTitle>
          </div>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {errorMessage && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <code className="text-sm whitespace-pre-wrap break-words">{errorMessage}</code>
            </div>
          )}
          {tips.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {onRetry && (
          <CardFooter className="border-t pt-4">
            <Button onClick={onRetry} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  } else if (variant === "alert") {
    return (
      <Alert variant="destructive" className={`${className} ${bgColor} ${borderColor} border-2 border-l-4`}>
        <div className="mr-2">{icon}</div>
        <div>
          <AlertTitle className={textColor}>{title}</AlertTitle>
          <AlertDescription className="text-gray-600">
            {description}
            {errorMessage && (
              <div className="mt-2 p-2 bg-white/50 rounded border border-gray-200">
                <code className="text-xs whitespace-pre-wrap break-words">{errorMessage}</code>
              </div>
            )}
            {tips.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium mb-1">Troubleshooting Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-xs text-gray-600">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {onRetry && (
              <div className="mt-3">
                <Button size="sm" onClick={onRetry} className="flex items-center">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Try Again
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  // Default inline variant
  return (
    <div className={`${className} p-4 ${bgColor} ${borderColor} border rounded-md`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">{icon}</div>
        <div className="flex-1">
          <h3 className={`font-medium ${textColor}`}>{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          
          {errorMessage && (
            <div className="mt-2 p-2 bg-white/50 rounded border border-gray-200">
              <code className="text-sm whitespace-pre-wrap break-words">{errorMessage}</code>
            </div>
          )}
          
          {tips.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Troubleshooting Tips:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600">{tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {onRetry && (
            <div className="mt-3">
              <Button size="sm" onClick={onRetry} className="flex items-center">
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}