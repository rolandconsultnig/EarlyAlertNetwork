import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { ErrorMessage } from './error-message';
import { getErrorInfo, ErrorContext } from '@/lib/error-utils';

interface DataLoaderProps<T> {
  isLoading: boolean;
  error: unknown;
  data: T | null | undefined;
  loadingMessage?: string;
  errorTitle?: string;
  errorDescription?: string;
  errorTips?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  errorContext?: ErrorContext;
  onRetry?: () => void;
  renderData: (data: T) => ReactNode;
  renderEmpty?: () => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

/**
 * A component that handles the three states of data loading:
 * - Loading
 * - Error
 * - Success (with data or empty)
 */
export function DataLoader<T>({
  isLoading,
  error,
  data,
  loadingMessage = "Loading data...",
  errorTitle,
  errorDescription,
  errorTips,
  emptyTitle = "No data found",
  emptyDescription = "There are no items to display at this time.",
  errorContext = "data-loading",
  onRetry,
  renderData,
  renderEmpty,
  loadingComponent,
  errorComponent,
}: DataLoaderProps<T>) {
  
  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-neutral-600 font-medium">{loadingMessage}</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    const errorInfo = getErrorInfo(error, errorContext);
    
    return (
      <ErrorMessage
        variant="card"
        title={errorTitle || errorInfo.title}
        description={errorDescription || errorInfo.description}
        error={error instanceof Error ? error : undefined}
        troubleshootingTips={errorTips || errorInfo.troubleshootingTips}
        severity={errorInfo.severity}
        onRetry={onRetry}
      />
    );
  }
  
  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
    if (renderEmpty) {
      return <>{renderEmpty()}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-gray-100 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-2">{emptyTitle}</h3>
        <p className="text-gray-500">{emptyDescription}</p>
      </div>
    );
  }
  
  // Success state with data
  return <>{renderData(data)}</>;
}

/**
 * A higher-order component (HOC) that wraps a component with a DataLoader
 */
export function withDataLoader<P extends object, T>(
  Component: React.ComponentType<P & { data: T }>,
  options: Omit<DataLoaderProps<T>, 'renderData' | 'data'> & { 
    getData: (props: P) => T | null | undefined
  }
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithDataLoader: React.FC<P> = (props) => {
    const data = options.getData(props);
    
    return (
      <DataLoader
        isLoading={options.isLoading}
        error={options.error}
        data={data}
        loadingMessage={options.loadingMessage}
        errorTitle={options.errorTitle}
        errorDescription={options.errorDescription}
        errorTips={options.errorTips}
        emptyTitle={options.emptyTitle}
        emptyDescription={options.emptyDescription}
        errorContext={options.errorContext}
        onRetry={options.onRetry}
        loadingComponent={options.loadingComponent}
        errorComponent={options.errorComponent}
        renderEmpty={options.renderEmpty}
        renderData={(loadedData) => <Component {...props} data={loadedData} />}
      />
    );
  };
  
  ComponentWithDataLoader.displayName = `withDataLoader(${displayName})`;
  
  return ComponentWithDataLoader;
}