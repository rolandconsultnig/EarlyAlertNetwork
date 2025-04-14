import { AxiosError } from "axios";

export type ErrorContext = 
  | "data-loading" 
  | "authentication" 
  | "form-submission" 
  | "network" 
  | "permission" 
  | "unknown"
  | "api"
  | "validation";

export interface ErrorInfo {
  title: string;
  description: string;
  troubleshootingTips: string[];
  severity: "error" | "warning" | "info";
}

/**
 * Generates user-friendly error messages and troubleshooting tips based on error type and context
 */
export function getErrorInfo(error: unknown, context: ErrorContext = "unknown"): ErrorInfo {
  // Default error info
  const defaultError: ErrorInfo = {
    title: "An error occurred",
    description: "We encountered a problem processing your request.",
    troubleshootingTips: [
      "Try refreshing the page.",
      "Check your internet connection and try again.",
      "If the problem persists, contact technical support."
    ],
    severity: "error"
  };

  // Handle network errors (Axios or Fetch)
  if (error instanceof AxiosError || 
      (error instanceof Error && error.name === "NetworkError") ||
      (error instanceof Error && error.message.includes("network"))) {
    return {
      title: "Network Error",
      description: "Unable to connect to the server. Please check your internet connection.",
      troubleshootingTips: [
        "Check your internet connection and try again.",
        "The server might be temporarily unavailable. Try again later.",
        "If you're using a VPN, try disconnecting and reconnecting.",
        "Clear your browser cache and cookies."
      ],
      severity: "error"
    };
  }

  // Handle specific HTTP status codes
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    
    if (status === 401 || status === 403) {
      return {
        title: "Authentication Error",
        description: status === 401 
          ? "You need to be logged in to access this resource." 
          : "You don't have permission to perform this action.",
        troubleshootingTips: [
          "Try logging out and logging back in.",
          "Your session may have expired. Please log in again.",
          "If you believe you should have access, contact your administrator."
        ],
        severity: "warning"
      };
    }
    
    if (status === 404) {
      return {
        title: "Resource Not Found",
        description: "The requested resource could not be found on the server.",
        troubleshootingTips: [
          "Check that the URL is correct.",
          "The item might have been deleted or moved.",
          "Navigate back to the dashboard and try again."
        ],
        severity: "warning"
      };
    }
    
    if (status === 429) {
      return {
        title: "Too Many Requests",
        description: "You've made too many requests in a short period of time.",
        troubleshootingTips: [
          "Please wait a few minutes before trying again.",
          "Avoid refreshing the page repeatedly.",
        ],
        severity: "warning"
      };
    }
    
    if (status >= 500) {
      return {
        title: "Server Error",
        description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        troubleshootingTips: [
          "This is likely a temporary issue. Please try again later.",
          "Contact technical support if the problem persists.",
        ],
        severity: "error"
      };
    }
  }

  // Handle different error contexts
  switch (context) {
    case "authentication":
      return {
        title: "Authentication Failed",
        description: "We couldn't verify your credentials. Please try again.",
        troubleshootingTips: [
          "Make sure your username and password are correct.",
          "Ensure Caps Lock is not enabled when typing your password.",
          "If you've forgotten your password, use the 'Forgot Password' link.",
          "Clear your browser cookies and try again."
        ],
        severity: "warning"
      };
      
    case "data-loading":
      return {
        title: "Failed to Load Data",
        description: "We encountered a problem while retrieving the data.",
        troubleshootingTips: [
          "Try refreshing the page to reload the data.",
          "Check your internet connection.",
          "The data source might be temporarily unavailable. Try again later.",
          "If the problem persists, try logging out and back in again."
        ],
        severity: "warning"
      };
      
    case "form-submission":
      return {
        title: "Form Submission Failed",
        description: "We couldn't process your form submission.",
        troubleshootingTips: [
          "Check the form for any validation errors and correct them.",
          "Ensure all required fields are filled in correctly.",
          "Try submitting the form again.",
          "If you're uploading files, ensure they meet the size and format requirements."
        ],
        severity: "warning"
      };
      
    case "permission":
      return {
        title: "Permission Denied",
        description: "You don't have permission to perform this action.",
        troubleshootingTips: [
          "Contact your administrator to request access.",
          "If you believe this is an error, try logging out and logging back in.",
          "Your account may require additional verification.",
        ],
        severity: "warning"
      };
      
    case "network":
      return {
        title: "Network Error",
        description: "We're having trouble connecting to the server.",
        troubleshootingTips: [
          "Check your internet connection.",
          "Try refreshing the page.",
          "The server might be temporarily unavailable. Try again later.",
          "If you're using a VPN, try disconnecting and reconnecting."
        ],
        severity: "error"
      };

    case "api":
      return {
        title: "API Connection Error",
        description: "Failed to connect to the external service.",
        troubleshootingTips: [
          "The external service might be temporarily unavailable.",
          "Check your API key configuration if applicable.",
          "Verify that the necessary credentials are properly configured.",
          "Contact technical support for assistance with API integration issues."
        ],
        severity: "error"
      };

    case "validation":
      return {
        title: "Validation Error",
        description: "The submitted data contains errors.",
        troubleshootingTips: [
          "Review all highlighted fields for specific validation errors.",
          "Ensure all required fields are properly filled.",
          "Check for proper formatting of emails, dates, and numbers.",
          "Remove any special characters from fields that don't allow them."
        ],
        severity: "warning"
      };
  }

  // If the error is an instance of Error, extract the message
  if (error instanceof Error) {
    return {
      ...defaultError,
      description: error.message || defaultError.description
    };
  }

  return defaultError;
}

/**
 * Provides a user-friendly message for service outages or maintenance
 */
export function getServiceUnavailableInfo(): ErrorInfo {
  return {
    title: "Service Temporarily Unavailable",
    description: "The service is currently unavailable or undergoing maintenance.",
    troubleshootingTips: [
      "This is a temporary issue. Please try again later.",
      "Check the system status page for any announced maintenance.",
      "Clear your browser cache and cookies."
    ],
    severity: "warning"
  };
}

/**
 * Creates error messages for offline status
 */
export function getOfflineInfo(): ErrorInfo {
  return {
    title: "You're Offline",
    description: "Your device appears to be offline. Some features may not be available.",
    troubleshootingTips: [
      "Check your internet connection.",
      "Try connecting to a different network if available.",
      "Some functionality will be restored automatically when you're back online."
    ],
    severity: "warning"
  };
}

/**
 * Provides helpful error information for server timeout errors
 */
export function getTimeoutInfo(): ErrorInfo {
  return {
    title: "Request Timeout",
    description: "The server took too long to respond to your request.",
    troubleshootingTips: [
      "This might be due to slow network conditions.",
      "Try again when network conditions improve.",
      "If the problem persists, the server might be experiencing high load."
    ],
    severity: "warning"
  };
}

/**
 * Creates a friendly error message for database connection issues
 */
export function getDatabaseErrorInfo(): ErrorInfo {
  return {
    title: "Database Connection Issue",
    description: "We're having trouble connecting to our database.",
    troubleshootingTips: [
      "This is a temporary issue on our end.",
      "Our team has been automatically notified of this issue.",
      "Please try again in a few minutes."
    ],
    severity: "error"
  };
}

/**
 * Generates a friendly maintenance notice
 */
export function getMaintenanceInfo(endTime?: string): ErrorInfo {
  return {
    title: "Scheduled Maintenance",
    description: `The system is currently undergoing scheduled maintenance${endTime ? ` until approximately ${endTime}` : '.'}`,
    troubleshootingTips: [
      "This is a planned maintenance period.",
      "All services should be restored once maintenance is complete.",
      "Check the system status page for updates."
    ],
    severity: "info"
  };
}